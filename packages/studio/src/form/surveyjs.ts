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

const CHOICE_SURVEYJS_TYPES = new Set([
  'radiogroup',
  'checkbox',
  'dropdown',
  'tagbox',
  'buttongroup',
  'ranking',
]);
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
  answer: string;
  score: number;
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

export interface ScoreRequestCore {
  answer_list: ScoreAnswerEntry[];
  customer_condition: Record<string, boolean>;
  dimensions: ScoreDimensionRef[];
}

/**
 * Builds the core of the `ScoreModuleRequest` the Form Engine sends to the Score
 * Engine — a faithful client-side mirror of form-engine's ExtractEvaluationData.
 * The caller adds `code` / `brand_id` / `application_id` / `vision_signals`.
 */
export function buildScoreRequest(
  model: SurveyJSModel,
  data: Record<string, unknown>
): ScoreRequestCore {
  const answer_list: ScoreAnswerEntry[] = [];
  const customer_condition: Record<string, boolean> = {};
  const dimAnswers: Record<string, number[]> = {};
  const dimBounds: Record<string, { min: number; max: number }> = {};

  const bump = (dim: string | undefined, score: number, min: number, max: number) => {
    if (!dim) return;
    (dimAnswers[dim] ??= []).push(score);
    const b = (dimBounds[dim] ??= { min: 0, max: 0 });
    if (min < b.min) b.min = min;
    if (max > b.max) b.max = max;
  };
  const scaleOf = (el: SurveyJSElement): [number, number] => [
    el.scale?.min ?? el.rateMin ?? el.min ?? 0,
    el.scale?.max ?? el.rateMax ?? el.max ?? 0,
  ];
  const asChoice = (c: SurveyJSChoice | string): SurveyJSChoice =>
    typeof c === 'string' ? { value: c, text: c } : c;

  for (const el of flattenElements(model)) {
    const ans = data[el.name];
    if (ans == null || ans === '') continue;
    const [minS, maxS] = scaleOf(el);

    if (el.type === 'boolean') {
      const on = ans === true || ans === 'true';
      const score = on ? el.scoreTrue ?? 1 : el.scoreFalse ?? 0;
      answer_list.push({ answer: String(on), score, min_score: minS, max_score: maxS || 1 });
      bump(el.dimension, score, minS, maxS || 1);
      continue;
    }

    if (CHOICE_SURVEYJS_TYPES.has(el.type) && el.choices?.length) {
      const picked = (Array.isArray(ans) ? ans : [ans]).map(String);
      for (const raw of el.choices) {
        const ch = asChoice(raw);
        if (!picked.includes(String(ch.value))) continue;
        const score = typeof ch.score === 'number' ? ch.score : 0;
        answer_list.push({ answer: ch.text ?? String(ch.value), score, min_score: minS, max_score: maxS });
        if (ch.condition_map) Object.assign(customer_condition, ch.condition_map);
        bump(ch.dimension || el.dimension, score, minS, maxS);
      }
      continue;
    }

    if (el.type === 'matrix' && el.columns?.length && typeof ans === 'object') {
      const cols = el.columns.map(asChoice);
      for (const colVal of Object.values(ans as Record<string, unknown>)) {
        const col = cols.find((c) => String(c.value) === String(colVal));
        if (!col) continue;
        const score = typeof col.score === 'number' ? col.score : 0;
        answer_list.push({ answer: col.text ?? String(col.value), score, min_score: minS, max_score: maxS });
        bump(el.dimension, score, minS, maxS);
      }
      continue;
    }

    const n = Number(ans);
    if (!Number.isNaN(n)) {
      answer_list.push({ answer: String(n), score: n, min_score: minS, max_score: maxS });
      bump(el.dimension, n, minS, maxS);
    }
  }

  const methods = model.calculation_methods || {};
  const dimensions: ScoreDimensionRef[] = Object.entries(dimAnswers).map(([key, answers]) => {
    const b = dimBounds[key] || { min: 0, max: 0 };
    return {
      key,
      min_score: b.min,
      max_score: b.max || 100,
      calculation_method: methods[key] || 'sum',
      answers,
    };
  });

  return { answer_list, customer_condition, dimensions };
}

/** Per-dimension raw score contributions from a set of SurveyJS answers. */
export function scoreSurveyAnswers(
  model: SurveyJSModel,
  data: Record<string, unknown>
): Record<string, number[]> {
  const byDimension: Record<string, number[]> = {};
  const push = (dim: string | undefined, n: number) => {
    if (!dim) return;
    (byDimension[dim] ??= []).push(n);
  };

  for (const el of flattenElements(model)) {
    const answer = data[el.name];
    if (answer == null || answer === '') continue;

    if (el.type === 'boolean') {
      const on = answer === true || answer === 'true';
      push(el.dimension, on ? el.scoreTrue ?? 1 : el.scoreFalse ?? 0);
      continue;
    }

    if (CHOICE_SURVEYJS_TYPES.has(el.type) && el.choices?.length) {
      const picked = (Array.isArray(answer) ? answer : [answer]).map(String);
      for (const c of el.choices) {
        const choice = typeof c === 'string' ? { value: c, text: c } : c;
        if (picked.includes(String(choice.value))) {
          push(
            (choice as SurveyJSChoice).dimension || el.dimension,
            typeof (choice as SurveyJSChoice).score === 'number'
              ? ((choice as SurveyJSChoice).score as number)
              : 0
          );
        }
      }
      continue;
    }

    // matrix — answer is { rowValue: columnValue }; each answered row adds its
    // picked column's score to the question's dimension.
    if (el.type === 'matrix' && el.columns?.length && typeof answer === 'object') {
      const cols = el.columns.map((c) =>
        typeof c === 'string' ? { value: c, text: c } : c
      );
      for (const colVal of Object.values(answer as Record<string, unknown>)) {
        const col = cols.find((c) => String(c.value) === String(colVal));
        if (col) {
          push(
            el.dimension,
            typeof (col as SurveyJSChoice).score === 'number'
              ? ((col as SurveyJSChoice).score as number)
              : 0
          );
        }
      }
      continue;
    }

    // rating / slider / text(number) — the value itself is the score.
    const n = Number(answer);
    if (!Number.isNaN(n)) push(el.dimension, n);
  }
  return byDimension;
}
