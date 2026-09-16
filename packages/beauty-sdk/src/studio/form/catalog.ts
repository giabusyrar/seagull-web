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

// Used when /api/dimensions returns nothing (e.g. the reference DB is
// unreachable) so the builder still works fully offline.
export const FALLBACK_DIMENSIONS: DimensionMeta[] = [
  { code: 'sebum', label: 'Sebum / Oiliness', purpose: 'How oily or dry the skin is.' },
  { code: 'sensitivity', label: 'Sensitivity / Redness', purpose: 'How reactive the skin is to products and environment.' },
  { code: 'pigmentation', label: 'Pigment Level', purpose: 'How much uneven pigment or dark spots are present.' },
  { code: 'dark_spot', label: 'Dark Spot Tendency', purpose: 'Whether the skin scars or darkens easily.' },
  { code: 'pores', label: 'Pores / Texture', purpose: 'How visible pores are and how rough the skin feels.' },
  { code: 'acne', label: 'Acne', purpose: 'Presence and severity of active breakouts.' },
  { code: 'wrinkle', label: 'Wrinkles / Fine Lines', purpose: 'Visible ageing signs such as fine lines.' },
];

export const getDimensionMeta = (code: string, extra: DimensionMeta[] = []): DimensionMeta =>
  [...extra, ...FALLBACK_DIMENSIONS].find((d) => d.code === code) || {
    code,
    label: code,
    purpose: 'Measure this aspect of the skin.',
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
// Template: Pixie (Wardah) + OMG Skin Analyzer questions.
// Source: "kuisioner yg mau dicoba.pdf". Numbers only — labeling and
// normalization are done downstream in the Score Engine.
// ---------------------------------------------------------------------------

const opt = (label: string, value: string, score: number) => ({ label, value, score });

const abc = (id: string, label: string, dimension: string, choices: [string, string, string]): QuestionItem => ({
  id,
  type: 'single_choice',
  label,
  dimension,
  options: [
    opt(choices[0], `${id}_a`, 1),
    opt(choices[1], `${id}_b`, 2),
    opt(choices[2], `${id}_c`, 3),
  ],
});

const sebumCharacter: QuestionItem = {
  id: 'sebum_character',
  type: 'multi_choice',
  label: 'Check every statement that matches your facial skin (select all that apply).',
  dimension: 'sebum',
  options: [
    opt('I can use any cleanser without feeling dry', 'sebum_any_cleanser', 2),
    opt('I do not use any product after cleansing', 'sebum_no_product', 1),
    opt('I never or only occasionally use moisturizer', 'sebum_rare_moist', 2),
    opt('I use facial moisturizer once a day', 'sebum_moist_1x', -1),
    opt('I use facial moisturizer twice a day', 'sebum_moist_2x', -2),
    opt('My facial skin is rough or dry', 'sebum_rough_dry', -2),
    opt('My facial skin is oily in some areas', 'sebum_oily_areas', 2),
    opt('My face is very oily', 'sebum_very_oily', 3),
    opt('My face feels uncomfortable without moisturizer', 'sebum_uncomfortable', -2),
    opt('I like the feel of rich creams and/or oils on my skin', 'sebum_likes_rich', -3),
    opt('None of the above', 'sebum_none', 0),
  ],
};

const sensitivityChecklist: QuestionItem = {
  id: 'sensitivity_checklist',
  type: 'multi_choice',
  label: 'Tick any condition you are prone to experiencing.',
  dimension: 'sensitivity',
  options: [
    opt('Facial redness and/or flushing', 'sens_redness', 1),
    opt('Stinging or burning sensation on the skin', 'sens_stinging', 1),
    opt('Allergic reaction to skincare products', 'sens_allergy', 1),
    opt('Irritation when shaving the face', 'sens_shaving', 1),
    opt('None of the above', 'sens_none', 0),
  ],
};

const pigmentAmount = abc(
  'pigment_amount',
  'How much dark pigment or discoloration is visible on your face?',
  'pigmentation',
  ['A few faint spots', 'Several visible spots', 'Many clearly visible spots'],
);
const pigmentScars = abc(
  'pigment_scars',
  'What happens to acne marks or dark marks you have had?',
  'pigmentation',
  ['They fade quickly', 'They take a long time to fade', 'They are hard to remove'],
);
const pigmentReactivity = abc(
  'pigment_reactivity',
  'How easily does your skin change colour after sun, injury, or acne?',
  'pigmentation',
  ['Rarely gets dark marks', 'Often gets dark marks', 'Very easily gets dark marks'],
);

const darkSpotTendency: QuestionItem = {
  id: 'dark_spot_tendency',
  type: 'single_choice',
  label: 'Do dark spots appear easily after acne, injury, or sun exposure?',
  dimension: 'dark_spot',
  options: [opt('Yes', 'ds_yes', 1), opt('No', 'ds_no', 0)],
};

export const PIXIE_OMG_SKIN_ANALYZER: QuestionnaireItem = {
  code: 'pixie_omg_skin_analyzer',
  name: 'Pixie / OMG Skin Analyzer',
  description: 'Questionnaire replica of the Wardah (Pixie) + OMG Skin Analyzer inputs for sebum, sensitivity, pigment level, and dark-spot tendency.',
  status: 'draft',
  questions: [
    sebumCharacter,
    sensitivityChecklist,
    pigmentAmount,
    pigmentScars,
    pigmentReactivity,
    darkSpotTendency,
  ],
  calculationMethods: {
    sebum: 'sum',
    sensitivity: 'boolean_or', // Pixie: any checklist item -> "Sensitive Stinger"
    pigmentation: 'average',
    dark_spot: 'boolean_or',
  },
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

/** Suggested XG dimension for each pForm question — a starting point, not enforced. */
export const PFORM_SUGGESTED_DIMENSIONS: Record<string, string> = {
  pform_age: 'lifestyle',
  pform_pregnancy: 'sensitivity',
  pform_sun_exposure: 'sun_exposure',
  pform_climate: 'climate_humidity',
  pform_pollution: 'pollution_exposure',
  pform_stress: 'mental_stress',
  pform_sleep: 'mental_stress',
  pform_diet: 'gut_health',
  pform_hydration: 'gut_health',
  pform_smoking: 'lifestyle',
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
    id: PIXIE_OMG_SKIN_ANALYZER.code,
    name: PIXIE_OMG_SKIN_ANALYZER.name,
    description: PIXIE_OMG_SKIN_ANALYZER.description,
    build: () => cloneQuestionnaire(PIXIE_OMG_SKIN_ANALYZER),
  },
  {
    id: PFORM_EXAMPLE.code,
    name: PFORM_EXAMPLE.name,
    description: PFORM_EXAMPLE.description,
    build: () => cloneQuestionnaire(PFORM_EXAMPLE),
  },
];