import type {
  CalculationMethod,
  QuestionItem,
  QuestionnaireItem,
  QuestionOption,
  QuestionType,
} from './types';

/**
 * Conversion between the builder's constrained QuestionnaireItem and a SurveyJS
 * schema (aligned with the Form Engine's domain.SurveyModel).
 *
 * SurveyJS is the standardised stored / on-the-wire form structure. The builder
 * keeps its friendly model; everything persisted or handed to a runner is
 * SurveyJS. `fromSurveyModel` is tolerant of legacy rows stored as a raw
 * QuestionnaireItem.
 */

export interface SurveyJSChoice {
  value: string;
  text: string;
  score?: number;
  dimension?: string;
  condition_map?: Record<string, boolean>;
}

export interface SurveyJSRow {
  value: string;
  text: string;
}

export interface SurveyJSElement {
  type: string;
  name: string;
  title?: string;
  inputType?: string;
  dimension?: string;
  isRequired?: boolean;
  choices?: Array<SurveyJSChoice | string>;
  // matrix
  columns?: Array<SurveyJSChoice | string>;
  rows?: Array<SurveyJSRow | string>;
  // rating / numeric bounds
  scale?: { min: number; max: number };
  rateMin?: number;
  rateMax?: number;
  displayMode?: string; // rating: keep "buttons" so it never collapses to a dropdown
  min?: number;
  max?: number;
  // boolean
  scoreTrue?: number;
  scoreFalse?: number;
  renderAs?: string; // boolean: "radio" avoids the toggle-switch responsiveness bug in survey-core
}

export interface SurveyJSPage {
  name: string;
  title?: string;
  elements: SurveyJSElement[];
}

export interface SurveyJSModel {
  title?: string;
  description?: string;
  code?: string;
  pages?: SurveyJSPage[];
  elements?: SurveyJSElement[];
  /** Per-dimension aggregation (XG extension; SurveyJS ignores unknown keys). */
  calculation_methods?: Record<string, CalculationMethod>;
  [key: string]: unknown;
}

const TYPE_TO_SURVEYJS: Record<QuestionType, { type: string; inputType?: string }> = {
  single_choice: { type: 'radiogroup' },
  multi_choice: { type: 'checkbox' },
  dropdown: { type: 'dropdown' },
  boolean: { type: 'boolean' },
  rating: { type: 'rating' },
  ranking: { type: 'ranking' },
  matrix: { type: 'matrix' },
  numeric_input: { type: 'text', inputType: 'number' },
  slider: { type: 'rating' },
};

const SURVEYJS_TO_TYPE: Record<string, QuestionType> = {
  radiogroup: 'single_choice',
  buttongroup: 'single_choice',
  imagepicker: 'single_choice',
  dropdown: 'dropdown',
  checkbox: 'multi_choice',
  tagbox: 'multi_choice',
  ranking: 'ranking',
  boolean: 'boolean',
  rating: 'rating',
  matrix: 'matrix',
  text: 'numeric_input',
};

const CHOICE_BUILDER_TYPES = new Set<QuestionType>([
  'single_choice',
  'multi_choice',
  'dropdown',
  'ranking',
]);

export function toSurveyModel(item: QuestionnaireItem): SurveyJSModel {
  const elements: SurveyJSElement[] = (item.questions ?? []).map((q) => {
    const map = TYPE_TO_SURVEYJS[q.type] ?? { type: 'radiogroup' };
    const el: SurveyJSElement = { type: map.type, name: q.id, title: q.label };
    if (map.inputType) el.inputType = map.inputType;
    if (q.type === 'single_choice' || q.type === 'dropdown' || q.type === 'boolean') {
      el.isRequired = true;
    }
    if (q.dimension) el.dimension = q.dimension;

    const asChoice = (o: QuestionOption) => ({
      value: o.value,
      text: o.label,
      ...(o.score != null ? { score: o.score } : {}),
      ...(o.conditionMap && Object.keys(o.conditionMap).length
        ? { condition_map: o.conditionMap }
        : {}),
    });

    if (CHOICE_BUILDER_TYPES.has(q.type)) {
      el.choices = (q.options ?? []).map(asChoice);
    }

    if (q.type === 'matrix') {
      el.columns = (q.options ?? []).map(asChoice);
      el.rows = (q.rows ?? []).map((r) => ({ value: r.value, text: r.label }));
    }

    if (q.type === 'boolean') {
      if (q.scoreTrue != null) el.scoreTrue = q.scoreTrue;
      if (q.scoreFalse != null) el.scoreFalse = q.scoreFalse;
      // Render Yes/No as a radiogroup: the default toggle-switch runs a
      // responsiveness callback that reads scrollWidth on an unmounted node
      // (survey-core 3.x), throwing on every re-render in the simulator/runner.
      el.renderAs = 'radio';
    }

    if ((q.type === 'rating' || q.type === 'slider' || q.type === 'numeric_input') && q.scale) {
      el.scale = q.scale;
      if (map.type === 'rating') {
        // Cap the visible range: a rating is an ordinal scale, not a 0..100 field.
        el.rateMin = q.scale.min;
        el.rateMax = Math.min(q.scale.max, q.scale.min + 10);
        el.displayMode = 'buttons';
      } else {
        el.min = q.scale.min;
        el.max = q.scale.max;
      }
    }
    return el;
  });

  return {
    title: item.name,
    ...(item.description ? { description: item.description } : {}),
    code: item.code,
    ...(item.status ? { status: item.status } : {}),
    pages: [{ name: 'page1', elements }],
    ...(item.calculationMethods && Object.keys(item.calculationMethods).length
      ? { calculation_methods: item.calculationMethods }
      : {}),
  };
}

function isSurveyModel(raw: any): raw is SurveyJSModel {
  return (
    !!raw &&
    typeof raw === 'object' &&
    !Array.isArray(raw.questions) &&
    (Array.isArray(raw.pages) || Array.isArray(raw.elements))
  );
}

export function flattenElements(model: SurveyJSModel): SurveyJSElement[] {
  return [
    ...(model.pages ?? []).flatMap((p) => p?.elements ?? []),
    ...(model.elements ?? []),
  ];
}

export function fromSurveyModel(raw: any): QuestionnaireItem {
  if (!isSurveyModel(raw)) {
    return {
      code: raw?.code ?? '',
      name: raw?.name ?? raw?.title ?? raw?.code ?? '',
      description: raw?.description ?? '',
      status: raw?.status ?? 'draft',
      questions: raw?.questions ?? [],
      calculationMethods: raw?.calculationMethods ?? raw?.calculation_methods ?? {},
      questionsCount: raw?.questions?.length ?? 0,
    };
  }

  const readChoice = (c: SurveyJSChoice | string): QuestionOption =>
    typeof c === 'string'
      ? { label: c, value: c }
      : {
          label: c.text ?? c.value,
          value: c.value,
          ...(c.score != null ? { score: c.score } : {}),
          ...(c.condition_map ? { conditionMap: c.condition_map } : {}),
        };

  const questions: QuestionItem[] = flattenElements(raw).map((el, i) => {
    const type = SURVEYJS_TO_TYPE[el.type] ?? 'single_choice';
    const source = type === 'matrix' ? el.columns ?? [] : el.choices ?? [];
    const options = source.map(readChoice);
    const q: QuestionItem = {
      id: el.name || `q_${i + 1}`,
      type,
      label: el.title || el.name || `Question ${i + 1}`,
      dimension: el.dimension || '',
      options,
    };
    if (type === 'matrix') {
      q.rows = (el.rows ?? []).map((r) =>
        typeof r === 'string'
          ? { value: r, label: r }
          : { value: r.value, label: r.text ?? r.value }
      );
    }
    if (el.scoreTrue != null) q.scoreTrue = el.scoreTrue;
    if (el.scoreFalse != null) q.scoreFalse = el.scoreFalse;
    const min = el.scale?.min ?? el.rateMin ?? el.min;
    const max = el.scale?.max ?? el.rateMax ?? el.max;
    if (min != null && max != null) q.scale = { min, max };
    return q;
  });

  return {
    code: raw.code ?? '',
    name: raw.title ?? raw.code ?? '',
    description: raw.description ?? '',
    status: (raw.status as string) ?? 'draft',
    questions,
    calculationMethods: raw.calculation_methods ?? {},
    questionsCount: questions.length,
  };
}

export interface ScoreAnswerEntry {
  question: string;
  answer: string;
  /** null: the answer is bound to a dimension but the form declares no score for it. */
  score: number | null;
  min_score: number;
  max_score: number;
}

export interface ScoreDimensionRef {
  key: string;
  min_score: number;
  max_score: number;
  calculation_method: CalculationMethod;
  answers: number[];
}

/** A caveat core attaches to an evaluation (form/domain Warning). */
export interface ScoreWarning {
  code: 'ANSWER_NOT_SCORED' | 'DIMENSION_NOT_SCORED';
  message: string;
}

export interface ScoreRequestCore {
  answer_list: ScoreAnswerEntry[];
  customer_condition: Record<string, boolean>;
  dimensions: ScoreDimensionRef[];
  /** What core would warn for these answers; not part of the Score Module request. */
  warnings: ScoreWarning[];
}

// ── Mirror of seagull-core internal/form/domain/survey_parser.go ─────────────
// ExtractEvaluationData and dimensionTheoreticalBounds, rule for rule, so a
// preview scores exactly as the engine does. Nothing the schema leaves
// unscored is scored: an unscored option or boolean side, a scale question
// without a `scale`, or a matrix without rows contributes nothing, and a
// dimension with no scored answer, no (known) calculation method or no usable
// range is left out. A change here follows a change there, never the reverse.

/** Choice types whose answer is one value / a list (survey_parser.go choiceTypeSingle / choiceTypeMulti). */
const CHOICE_SINGLE = new Set(['radiogroup', 'dropdown', 'buttongroup', 'imagepicker']);
const CHOICE_MULTI = new Set(['checkbox', 'tagbox', 'ranking']);

/** The aggregations the Score Module implements (survey_parser.go calculationMethods). */
const KNOWN_METHODS = new Set(['sum', 'average', 'mean', 'highest', 'max', 'lowest', 'min', 'boolean_or', 'boolean_and']);
/** Methods whose aggregate never exceeds the widest single contribution; the rest (sum) add up. */
const WIDEST_RANGE_METHODS = new Set(['average', 'mean', 'boolean_or', 'boolean_and', 'highest', 'max', 'lowest', 'min']);

type Range = { min: number; max: number };

/** The questions core reads: the pages' elements, else the top-level ones (domain.SurveyModel.GetAllQuestions). */
function coreQuestions(model: SurveyJSModel): SurveyJSElement[] {
  const fromPages = (model.pages ?? []).flatMap((p) => p?.elements ?? []);
  return fromPages.length ? fromPages : model.elements ?? [];
}

const asChoice = (c: SurveyJSChoice | string): SurveyJSChoice => (typeof c === 'string' ? { value: c, text: c } : c);
const hasScore = (c: SurveyJSChoice): c is SurveyJSChoice & { score: number } => typeof c.score === 'number';
const isScaleType = (q: SurveyJSElement) => q.type === 'rating' || q.type === 'slider' || (q.type === 'text' && q.inputType === 'number');
/** The choice's own dimension wins over the question's; '' when neither declares one. */
const choiceDim = (q: SurveyJSElement, c?: SurveyJSChoice) => (c?.dimension ? c.dimension : q.dimension ?? '');
/** Go's %q, for messages worded as core words them. */
const quote = (v: string) => JSON.stringify(v);

function declaredMethod(model: SurveyJSModel, dim: string): { method?: string; reason?: string } {
  const m = (model.calculation_methods ?? {})[dim] as string | undefined;
  if (!m) return { reason: 'the form declares no calculation method for it in calculation_methods' };
  if (!KNOWN_METHODS.has(m.toLowerCase())) return { reason: `the form's calculation method ${quote(m)} is not one the Score Module implements` };
  return { method: m };
}

function scoredRange(choices: SurveyJSChoice[]): Range | null {
  const scores = choices.filter(hasScore).map((c) => c.score);
  return scores.length ? { min: Math.min(...scores), max: Math.max(...scores) } : null;
}

/** Theoretical [min,max] aggregate per dimension, from declared scores only. */
function dimensionBounds(model: SurveyJSModel): Record<string, Range> {
  const perDim: Record<string, Range[]> = {};
  const add = (dim: string | undefined, min: number, max: number) => {
    if (dim) (perDim[dim] ??= []).push({ min, max });
  };
  for (const q of coreQuestions(model)) {
    const choices = (q.choices ?? []).map(asChoice);
    if (CHOICE_SINGLE.has(q.type)) {
      const r = scoredRange(choices);
      if (r) add(q.dimension, r.min, r.max);
      for (const c of choices) if (c.dimension && hasScore(c)) add(c.dimension, Math.min(0, c.score), Math.max(0, c.score));
    } else if (q.type === 'checkbox' || q.type === 'tagbox') {
      // Any subset: sum of negatives .. sum of positives, per dimension each choice files under.
      const lo: Record<string, number> = {};
      const hi: Record<string, number> = {};
      for (const c of choices) {
        const dim = choiceDim(q, c);
        if (!hasScore(c) || !dim) continue;
        lo[dim] ??= 0;
        hi[dim] ??= 0;
        if (c.score < 0) lo[dim] += c.score;
        else hi[dim] += c.score;
      }
      for (const dim of Object.keys(lo)) add(dim, lo[dim], hi[dim]);
    } else if (q.type === 'ranking') {
      // Every item is always ranked: a fixed contribution per dimension.
      const sum: Record<string, number> = {};
      for (const c of choices) {
        const dim = choiceDim(q, c);
        if (hasScore(c) && dim) sum[dim] = (sum[dim] ?? 0) + c.score;
      }
      for (const [dim, v] of Object.entries(sum)) add(dim, v, v);
    } else if (q.type === 'boolean') {
      const sides = [q.scoreTrue, q.scoreFalse].filter((v): v is number => typeof v === 'number');
      if (sides.length) add(q.dimension, Math.min(...sides), Math.max(...sides));
    } else if (q.type === 'matrix') {
      if (!q.rows?.length) continue;
      const r = scoredRange((q.columns ?? []).map(asChoice));
      if (r) add(q.dimension, r.min * q.rows.length, r.max * q.rows.length);
    } else if (isScaleType(q)) {
      if (q.scale) add(q.dimension, q.scale.min, q.scale.max);
    }
  }
  const out: Record<string, Range> = {};
  for (const [dim, ranges] of Object.entries(perDim)) {
    const { method } = declaredMethod(model, dim);
    if (!method) continue;
    out[dim] = WIDEST_RANGE_METHODS.has(method.toLowerCase())
      ? ranges.reduce((b, r) => ({ min: Math.min(b.min, r.min), max: Math.max(b.max, r.max) }))
      : ranges.reduce((b, r) => ({ min: b.min + r.min, max: b.max + r.max }), { min: 0, max: 0 });
  }
  return out;
}

/**
 * The core of the `ScoreModuleRequest` the Form Engine sends to the Score
 * Engine, plus the warnings core would attach. The caller adds `code` /
 * `brand_id` / `application_id` / `vision_signals`.
 */
export function buildScoreRequest(model: SurveyJSModel, data: Record<string, unknown>): ScoreRequestCore {
  const answer_list: ScoreAnswerEntry[] = [];
  const customer_condition: Record<string, boolean> = {};
  const warnings: ScoreWarning[] = [];
  const dimAnswers: Record<string, number[]> = {};
  const unscoredDims = new Set<string>();

  const record = (dim: string, score: number | null, q: string, text: string, reason: string) => {
    if (!dim) return; // no dimension: a label, not a score
    if (score === null) {
      unscoredDims.add(dim);
      warnings.push({ code: 'ANSWER_NOT_SCORED', message: `${q}: answer ${quote(text)} is not scored: ${reason}` });
      return;
    }
    (dimAnswers[dim] ??= []).push(score);
  };
  const entry = (q: SurveyJSElement, answer: string, score: number | null) =>
    answer_list.push({ question: q.name, answer, score, min_score: q.scale?.min ?? 0, max_score: q.scale?.max ?? 0 });

  const resolveChoice = (q: SurveyJSElement, value: string) => {
    const ch = (q.choices ?? []).map(asChoice).find((c) => String(c.value) === value);
    if (!ch) return;
    const score = hasScore(ch) ? ch.score : null;
    entry(q, ch.text ?? '', score);
    if (ch.condition_map) Object.assign(customer_condition, ch.condition_map);
    record(choiceDim(q, ch), score, q.name, ch.text ?? '', `option ${quote(String(ch.value))} declares no score`);
  };

  for (const q of coreQuestions(model)) {
    if (!(q.name in data)) continue;
    const ans = data[q.name];
    if (CHOICE_SINGLE.has(q.type)) {
      resolveChoice(q, String(ans));
    } else if (CHOICE_MULTI.has(q.type)) {
      for (const v of Array.isArray(ans) ? ans : [ans]) resolveChoice(q, String(v));
    } else if (q.type === 'boolean') {
      const on = ans === true;
      const score = (on ? q.scoreTrue : q.scoreFalse) ?? null;
      entry(q, String(on), score);
      record(choiceDim(q), score, q.name, String(on), `the question declares no ${on ? 'scoreTrue' : 'scoreFalse'}`);
    } else if (q.type === 'matrix') {
      if (!ans || typeof ans !== 'object' || Array.isArray(ans)) continue;
      const cols = (q.columns ?? []).map(asChoice);
      const noRows = !q.rows?.length;
      for (const row of Object.keys(ans).sort()) {
        const col = cols.find((c) => String(c.value) === String((ans as Record<string, unknown>)[row]));
        if (!col) continue;
        const score = noRows || !hasScore(col) ? null : col.score;
        entry(q, col.text ?? '', score);
        record(choiceDim(q, col), score, q.name, col.text ?? '',
          noRows ? 'the matrix declares no rows' : `column ${quote(String(col.value))} declares no score`);
      }
    } else if (isScaleType(q)) {
      if (typeof ans !== 'number' || !Number.isFinite(ans)) continue;
      const n = Math.trunc(ans);
      const score = q.scale ? n : null;
      entry(q, String(n), score);
      record(choiceDim(q), score, q.name, String(n), 'the question declares no scale');
    }
  }

  const bounds = dimensionBounds(model);
  const dimensions: ScoreDimensionRef[] = [];
  for (const dim of [...new Set([...Object.keys(dimAnswers), ...unscoredDims])].sort()) {
    const notScored = (reason: string) => warnings.push({ code: 'DIMENSION_NOT_SCORED', message: `${dim}: ${reason}` });
    const answers = dimAnswers[dim];
    if (!answers) {
      notScored("none of the form's answers to it declares a score");
      continue;
    }
    const { method, reason } = declaredMethod(model, dim);
    if (!method) {
      notScored(reason ?? '');
      continue;
    }
    const b = bounds[dim] ?? { min: 0, max: 0 };
    if (b.max <= b.min) {
      notScored(`the form's declared scores give no usable range (min ${b.min}, max ${b.max})`);
      continue;
    }
    dimensions.push({ key: dim, min_score: Math.round(b.min), max_score: Math.round(b.max), calculation_method: method as CalculationMethod, answers });
  }
  return { answer_list, customer_condition, dimensions, warnings };
}

/** Per-dimension raw score contributions, for the dimensions core would score. */
export function scoreSurveyAnswers(model: SurveyJSModel, data: Record<string, unknown>): Record<string, number[]> {
  return Object.fromEntries(buildScoreRequest(model, data).dimensions.map((d) => [d.key, d.answers]));
}
