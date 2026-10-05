import type {
  CalculationMethod,
  QuestionItem,
  QuestionnaireItem,
  QuestionOption,
} from './types';

// A dimension as the builder needs it: a code plus friendly, code-free copy.
export interface DimensionMeta {
  code: string;
  label: string;
  purpose: string;
}

/**
 * Friendly copy for a dimension code, looked up in `catalog` (the dimensions
 * loaded from reference data). An unknown code is shown as itself with no
 * purpose text — never with invented copy.
 */
export const getDimensionMeta = (code: string, catalog: DimensionMeta[] = []): DimensionMeta =>
  catalog.find((d) => d.code === code) || {
    code,
    label: code,
    purpose: '',
  };

// The calculation methods the Score Engine supports (score_service.go).
export const CALCULATION_METHODS: {
  value: CalculationMethod;
  label: string;
  hint: string;
}[] = [
  { value: 'sum', label: 'Sum', hint: 'Add every answer score together.' },
  { value: 'average', label: 'Average', hint: 'Total divided by the number of answered questions.' },
  { value: 'max', label: 'Highest', hint: 'Take the single highest answer score.' },
  { value: 'min', label: 'Lowest', hint: 'Take the single lowest answer score.' },
  { value: 'boolean_or', label: 'Boolean OR', hint: 'Any answer scores above 0 → 100, otherwise 0.' },
  { value: 'boolean_and', label: 'Boolean AND', hint: 'All answers score above 0 → 100, otherwise 0.' },
];

// Client-side mirror of score_service.go's per-dimension combination, for the
// simulator preview. Result is clamped to [0, 100] like the backend.
export const applyCalculationMethod = (
  scores: number[],
  method: CalculationMethod = 'sum',
): number => {
  const clamp = (n: number) => Math.max(0, Math.min(100, n));
  const total = scores.reduce((a, b) => a + b, 0);
  switch (method) {
    case 'average':
      return clamp(scores.length ? total / scores.length : 0);
    case 'max':
      return clamp(scores.length ? Math.max(...scores) : 0);
    case 'min':
      return clamp(scores.length ? Math.min(...scores) : 0);
    case 'boolean_or':
      return scores.some((s) => s > 0) ? 100 : 0;
    case 'boolean_and':
      return scores.length > 0 && scores.every((s) => s > 0) ? 100 : 0;
    default:
      return clamp(total);
  }
};

// ---------------------------------------------------------------------------
// pForm bridge
//
// pForm is the internal (still in development) form engine — a general
// questionnaire builder with per-answer scoring, like an internal Google Forms.
// It has NO concept of a "dimension"; it just produces questions and scored
// answers (demographics, lifestyle, clinical quizzes — any form).
//
// XG's job is to overlay a `dimension` on each question and a calculation method
// on each dimension, turning a pForm form into a Score-Engine-ready XG
// questionnaire. `fromPFormSchema()` does the structural import (blank dimension
// slots, scores preserved); `applyDimensionMapping()` fills the slots in.
//
// The concrete pForm response shape is not finalised yet, so `fromPFormSchema`
// accepts the two likely shapes: a SurveyJS-style model, or a flat
// `{ questions: [{ label, type?, options: [{ label, value?, score? }] }] }`.
// PFORM_EXAMPLE below is a stand-in until real pForm output is available.
// ---------------------------------------------------------------------------

const pfChoice = (label: string, value: string, score: number): QuestionOption => ({
  label,
  value,
  score,
});

const pfSingle = (
  id: string,
  label: string,
  choices: [string, number][],
): QuestionItem => ({
  id,
  type: 'single_choice',
  label,
  dimension: '', // assigned by XG
  options: choices.map(([label, score], i) => pfChoice(label, `${id}_${i}`, score)),
});

export const PFORM_EXAMPLE: QuestionnaireItem = {
  code: 'pform_example',
  name: 'pForm form (example)',
  description:
    'Example of a pForm form imported into XG: scored questions with no dimension yet. Assign a dimension to each question (Questions tab) and a method per dimension (Calculation tab) before use.',
  status: 'draft',
  questions: [
    pfSingle('pform_age', 'Age range', [
      ['Under 20', 0],
      ['20–29', 1],
      ['30–39', 2],
      ['40–49', 3],
      ['50 or older', 4],
    ]),
    {
      id: 'pform_pregnancy',
      type: 'boolean',
      label: 'Are you currently pregnant or breastfeeding?',
      dimension: '',
      options: [],
      scoreTrue: 1,
      scoreFalse: 0,
    },
    pfSingle('pform_sun_exposure', 'On an average day, how long are you outdoors in direct sun?', [
      ['Less than 30 minutes', 0],
      ['30 minutes – 1 hour', 1],
      ['1 – 3 hours', 2],
      ['More than 3 hours', 3],
    ]),
    pfSingle('pform_climate', 'Which best describes the climate where you live?', [
      ['Cool and dry', 0],
      ['Temperate', 1],
      ['Hot and humid', 2],
      ['Hot and dry', 2],
    ]),
    pfSingle('pform_pollution', 'How would you rate the air pollution / dust where you spend most of your day?', [
      ['Low', 0],
      ['Moderate', 1],
      ['High', 2],
    ]),
    {
      id: 'pform_stress',
      type: 'rating',
      label: 'On a scale of 1–5, how stressed have you felt this past month?',
      dimension: '',
      options: [],
      scale: { min: 1, max: 5 },
    },
    {
      id: 'pform_sleep',
      type: 'rating',
      label: 'On a scale of 1–5, how well have you been sleeping?',
      dimension: '',
      options: [],
      scale: { min: 1, max: 5 },
    },
    pfSingle('pform_diet', 'How often do you eat fried, sugary, or heavily processed food?', [
      ['Rarely', 0],
      ['A few times a week', 1],
      ['Most days', 2],
      ['Every day', 3],
    ]),
    pfSingle('pform_hydration', 'How much plain water do you drink daily?', [
      ['Less than 1 litre', 2],
      ['1 – 2 litres', 1],
      ['More than 2 litres', 0],
    ]),
    {
      id: 'pform_smoking',
      type: 'boolean',
      label: 'Do you smoke?',
      dimension: '',
      options: [],
      scoreTrue: 2,
      scoreFalse: 0,
    },
  ],
  calculationMethods: {}, // set alongside the dimension mapping
};

type PFormChoiceLike = { label?: string; text?: string; title?: string; value?: string; score?: number };
type PFormQuestionLike = {
  id?: string;
  name?: string;
  key?: string;
  type?: string;
  label?: string;
  title?: string;
  question?: string;
  choices?: (PFormChoiceLike | string)[];
  options?: (PFormChoiceLike | string)[];
  answers?: (PFormChoiceLike | string)[];
  elements?: PFormQuestionLike[];
};
type PFormSchemaLike = {
  code?: string;
  id?: string;
  name?: string;
  title?: string;
  description?: string;
  questions?: PFormQuestionLike[];
  items?: PFormQuestionLike[];
  fields?: PFormQuestionLike[];
  pages?: { elements?: PFormQuestionLike[] }[];
  elements?: PFormQuestionLike[];
};

const PFORM_TYPE_MAP: Record<string, QuestionItem['type']> = {
  radiogroup: 'single_choice',
  radio: 'single_choice',
  single: 'single_choice',
  single_choice: 'single_choice',
  dropdown: 'dropdown',
  select: 'dropdown',
  checkbox: 'multi_choice',
  multi: 'multi_choice',
  multi_choice: 'multi_choice',
  boolean: 'boolean',
  rating: 'rating',
  ranking: 'ranking',
  number: 'numeric_input',
  numeric: 'numeric_input',
  text: 'numeric_input',
};

/**
 * Structural import of a pForm form into an XG questionnaire. pForm carries the
 * questions and per-answer scores but no dimension, so every question's
 * `dimension` comes back blank — feed the result through `applyDimensionMapping`
 * once XG has assigned dimensions. Tolerant of pForm's shape not being final:
 * accepts SurveyJS-style (`pages`/`elements`) and flat
 * (`questions`/`items`/`fields`) inputs.
 */
export function fromPFormSchema(raw: PFormSchemaLike): QuestionnaireItem {
  const flat: PFormQuestionLike[] = [
    ...(raw.questions ?? []),
    ...(raw.items ?? []),
    ...(raw.fields ?? []),
    ...(raw.elements ?? []),
    ...(raw.pages ?? []).flatMap((p) => p?.elements ?? []),
  ];

  const questions: QuestionItem[] = flat.map((q, i) => {
    const id = q.id || q.name || q.key || `pform_q${i + 1}`;
    const rawChoices = q.choices ?? q.options ?? q.answers ?? [];
    const options: QuestionOption[] = rawChoices.map((c, ci) => {
      const obj = typeof c === 'string' ? { label: c } : c;
      return {
        label: obj.label ?? obj.text ?? obj.title ?? obj.value ?? `Option ${ci + 1}`,
        value: obj.value ?? `${id}_${ci}`,
        score: typeof obj.score === 'number' ? obj.score : 0,
      };
    });
    const type =
      PFORM_TYPE_MAP[(q.type || '').toLowerCase()] ||
      (options.length ? 'single_choice' : 'numeric_input');
    return {
      id,
      type,
      label: q.label ?? q.title ?? q.question ?? `Question ${i + 1}`,
      dimension: '', // assigned in XG
      options: type === 'boolean' ? [] : options,
    };
  });

  return {
    code: raw.code || raw.id || 'pform_import',
    name: raw.name || raw.title || 'pForm import',
    description:
      raw.description ||
      'Imported from pForm. Assign a dimension to each question before use.',
    status: 'draft',
    questions,
    calculationMethods: {},
  };
}

/**
 * Assigns real dimension codes to a questionnaire's questions (and, optionally,
 * the per-dimension calculation methods). Questions not in `mapping` keep
 * whatever dimension they already have. Turns a pForm import / template into a
 * ready-to-save questionnaire once XG has decided each question's dimension.
 */
export function applyDimensionMapping(
  q: QuestionnaireItem,
  mapping: Record<string, string>,
  methods: Record<string, CalculationMethod> = {},
): QuestionnaireItem {
  const questions = (q.questions ?? []).map((question) => {
    const dim = mapping[question.id];
    return dim ? { ...question, dimension: dim } : { ...question };
  });
  const usedDims = Array.from(new Set(questions.map((x) => x.dimension).filter(Boolean)));
  const calculationMethods: Record<string, CalculationMethod> = {};
  for (const d of usedDims) {
    calculationMethods[d] = methods[d] || q.calculationMethods?.[d] || 'sum';
  }
  return { ...q, questions, calculationMethods };
}

export interface BuiltinTemplate {
  id: string;
  name: string;
  description: string;
  build: () => QuestionnaireItem;
}

const cloneQuestionnaire = (q: QuestionnaireItem): QuestionnaireItem =>
  JSON.parse(JSON.stringify(q));

export const BUILTIN_TEMPLATES: BuiltinTemplate[] = [
  {
    id: PFORM_EXAMPLE.code,
    name: PFORM_EXAMPLE.name,
    description: PFORM_EXAMPLE.description,
    build: () => cloneQuestionnaire(PFORM_EXAMPLE),
  },
];