import { describe, expect, it } from 'vitest';
import { buildScoreRequest, scoreSurveyAnswers, type SurveyJSModel } from './surveyjs';

// The same table as seagull-core internal/form/domain/survey_parser_not_scored_test.go
// (TestExtractEvaluationData_NotScored) and survey_parser_test.go
// (TestExtractEvaluationData_TheoreticalBounds): this mirror must score as core does.

type WantDim = [min: number, max: number, method: string, answers: number[]];
type WantWarn = [code: string, contains: string];

const survey = (elements: unknown[], methods?: Record<string, string>): SurveyJSModel =>
  ({ code: 't', pages: [{ name: 'p1', elements }], ...(methods ? { calculation_methods: methods } : {}) }) as SurveyJSModel;

const cases: {
  name: string;
  elements: unknown[];
  methods?: Record<string, string>;
  answers: Record<string, unknown>;
  dims?: Record<string, WantDim>;
  warns?: WantWarn[];
  nullScores?: string[];
}[] = [
  {
    name: 'unscored choice contributes nothing and is not in the bounds',
    elements: [
      { type: 'radiogroup', name: 'q1', dimension: 'd', choices: [{ value: 'a', text: 'A', score: 1 }, { value: 'b', text: 'B', score: 3 }, { value: 'c', text: 'C' }] },
      { type: 'radiogroup', name: 'q2', dimension: 'd', choices: [{ value: 'x', text: 'X', score: 0 }, { value: 'y', text: 'Y', score: 2 }] },
    ],
    methods: { d: 'sum' },
    answers: { q1: 'c', q2: 'y' },
    dims: { d: [1, 5, 'sum', [2]] },
    warns: [['ANSWER_NOT_SCORED', 'q1: answer "C" is not scored: option "c" declares no score']],
    nullScores: ['q1'],
  },
  {
    name: 'dimension with only unscored answers is not scored',
    elements: [{ type: 'radiogroup', name: 'q1', dimension: 'd', choices: [{ value: 'a', text: 'A', score: 1 }, { value: 'b', text: 'B', score: 3 }, { value: 'c', text: 'C' }] }],
    methods: { d: 'sum' },
    answers: { q1: 'c' },
    warns: [['ANSWER_NOT_SCORED', 'q1: answer "C"'], ['DIMENSION_NOT_SCORED', "d: none of the form's answers to it declares a score"]],
    nullScores: ['q1'],
  },
  {
    name: 'checkbox: unscored choice skipped, bounds from scored choices only',
    elements: [{ type: 'checkbox', name: 'q1', dimension: 'd', choices: [{ value: 'x', text: 'X', score: 2 }, { value: 'n', text: 'N', score: -1 }, { value: 'y', text: 'Y' }] }],
    methods: { d: 'sum' },
    answers: { q1: ['x', 'y'] },
    dims: { d: [-1, 2, 'sum', [2]] },
    warns: [['ANSWER_NOT_SCORED', 'q1: answer "Y"']],
  },
  {
    name: 'matrix column without score is skipped',
    elements: [{
      type: 'matrix', name: 'm', dimension: 'd', rows: [{ value: 'r1', text: 'R1' }, { value: 'r2', text: 'R2' }],
      columns: [{ value: 'lo', text: 'Low', score: 0 }, { value: 'hi', text: 'High', score: 2 }, { value: 'na', text: 'N/A' }],
    }],
    methods: { d: 'sum' },
    answers: { m: { r1: 'hi', r2: 'na' } },
    dims: { d: [0, 4, 'sum', [2]] },
    warns: [['ANSWER_NOT_SCORED', 'column "na" declares no score']],
  },
  {
    name: 'boolean with no scoreFalse: answering false is not scored',
    elements: [{ type: 'boolean', name: 'b', dimension: 'd', scoreTrue: 1 }],
    methods: { d: 'boolean_or' },
    answers: { b: false },
    warns: [['ANSWER_NOT_SCORED', 'b: answer "false" is not scored: the question declares no scoreFalse'], ['DIMENSION_NOT_SCORED', "d: none of the form's answers"]],
    nullScores: ['b'],
  },
  {
    name: 'boolean with only scoreTrue has no range (no 0 default for false)',
    elements: [{ type: 'boolean', name: 'b', dimension: 'd', scoreTrue: 1 }],
    methods: { d: 'boolean_or' },
    answers: { b: true },
    warns: [['DIMENSION_NOT_SCORED', "d: the form's declared scores give no usable range (min 1, max 1)"]],
  },
  {
    name: 'boolean with no scores at all (no 1 / 0 default)',
    elements: [{ type: 'boolean', name: 'b', dimension: 'd' }],
    methods: { d: 'sum' },
    answers: { b: true },
    warns: [['ANSWER_NOT_SCORED', 'the question declares no scoreTrue'], ['DIMENSION_NOT_SCORED', "d: none of the form's answers"]],
    nullScores: ['b'],
  },
  {
    name: 'rating without scale is not scored (no 0..100 default)',
    elements: [{ type: 'rating', name: 'r', dimension: 'd' }],
    methods: { d: 'sum' },
    answers: { r: 4 },
    warns: [['ANSWER_NOT_SCORED', 'r: answer "4" is not scored: the question declares no scale'], ['DIMENSION_NOT_SCORED', "d: none of the form's answers"]],
    nullScores: ['r'],
  },
  {
    name: 'number without scale beside a scaled slider: only the slider counts',
    elements: [
      { type: 'text', inputType: 'number', name: 'n', dimension: 'd' },
      { type: 'slider', name: 's', dimension: 'd', scale: { min: 0, max: 10 } },
    ],
    methods: { d: 'sum' },
    answers: { n: 50, s: 7 },
    dims: { d: [0, 10, 'sum', [7]] },
    warns: [['ANSWER_NOT_SCORED', 'n: answer "50"']],
    nullScores: ['n'],
  },
  {
    name: 'matrix without rows contributes nothing (no n = 1 default)',
    elements: [{ type: 'matrix', name: 'm', dimension: 'd', columns: [{ value: 'lo', text: 'Low', score: 0 }, { value: 'hi', text: 'High', score: 2 }] }],
    methods: { d: 'sum' },
    answers: { m: { r1: 'hi' } },
    warns: [['ANSWER_NOT_SCORED', 'm: answer "High" is not scored: the matrix declares no rows'], ['DIMENSION_NOT_SCORED', "d: none of the form's answers"]],
    nullScores: ['m'],
  },
  {
    name: 'dimension with no calculation method is not scored (no sum default)',
    elements: [{ type: 'radiogroup', name: 'q', dimension: 'd', choices: [{ value: 'a', text: 'A', score: 0 }, { value: 'b', text: 'B', score: 2 }] }],
    answers: { q: 'b' },
    warns: [['DIMENSION_NOT_SCORED', 'd: the form declares no calculation method for it in calculation_methods']],
  },
  {
    name: 'dimension with an unknown calculation method is not scored',
    elements: [{ type: 'radiogroup', name: 'q', dimension: 'd', choices: [{ value: 'a', text: 'A', score: 0 }, { value: 'b', text: 'B', score: 2 }] }],
    methods: { d: 'median' },
    answers: { q: 'b' },
    warns: [['DIMENSION_NOT_SCORED', `d: the form's calculation method "median" is not one the Score Module implements`]],
  },
  {
    name: 'dimension with no usable range is not scored (no 0..100 default)',
    elements: [{ type: 'radiogroup', name: 'q', dimension: 'd', choices: [{ value: 'a', text: 'A', score: 2 }, { value: 'b', text: 'B', score: 2 }] }],
    methods: { d: 'sum' },
    answers: { q: 'b' },
    warns: [['DIMENSION_NOT_SCORED', "d: the form's declared scores give no usable range (min 2, max 2)"]],
  },
  {
    name: 'question with no dimension is a label, not an unscored answer',
    elements: [
      { type: 'radiogroup', name: 'concern', choices: [{ value: 'acne', text: 'Acne' }] },
      { type: 'radiogroup', name: 'q', dimension: 'd', choices: [{ value: 'a', text: 'A', score: 0 }, { value: 'b', text: 'B', score: 2 }] },
    ],
    methods: { d: 'sum' },
    answers: { concern: 'acne', q: 'b' },
    dims: { d: [0, 2, 'sum', [2]] },
    nullScores: ['concern'],
  },
];

describe('buildScoreRequest mirrors core: nothing unscored is scored', () => {
  for (const c of cases) {
    it(c.name, () => {
      const r = buildScoreRequest(survey(c.elements, c.methods), c.answers);
      expect(Object.fromEntries(r.dimensions.map((d) => [d.key, [d.min_score, d.max_score, d.calculation_method, d.answers]]))).toEqual(c.dims ?? {});
      expect(r.warnings).toHaveLength((c.warns ?? []).length);
      (c.warns ?? []).forEach(([code, contains], i) => {
        expect(r.warnings[i].code).toBe(code);
        expect(r.warnings[i].message).toContain(contains);
      });
      for (const a of r.answer_list) if (c.nullScores?.includes(a.question)) expect(a.score).toBeNull();
    });
  }
});

describe('buildScoreRequest bounds (core TestExtractEvaluationData_TheoreticalBounds)', () => {
  it('sums a checkbox, takes the widest range for average and boolean_or', () => {
    const model = survey(
      [
        { type: 'checkbox', name: 'sebum_q', dimension: 'sebum', choices: [2, 1, 3, -1, -2, -3, 0].map((s, i) => ({ value: 'abcdefg'[i], text: 'abcdefg'[i], score: s })) },
        { type: 'radiogroup', name: 'pig_a', dimension: 'pigmentation', choices: [1, 2, 3].map((s) => ({ value: String(s), text: String(s), score: s })) },
        { type: 'radiogroup', name: 'pig_b', dimension: 'pigmentation', choices: [1, 3].map((s) => ({ value: String(s), text: String(s), score: s })) },
        { type: 'radiogroup', name: 'ds_q', dimension: 'dark_spot', choices: [{ value: 'yes', text: 'Yes', score: 1 }, { value: 'no', text: 'No', score: 0 }] },
      ],
      { sebum: 'sum', pigmentation: 'average', dark_spot: 'boolean_or' },
    );
    const dims = Object.fromEntries(buildScoreRequest(model, { sebum_q: ['c', 'a'], pig_a: '2', pig_b: '3', ds_q: 'yes' }).dimensions.map((d) => [d.key, [d.min_score, d.max_score]]));
    expect(dims).toEqual({ sebum: [-6, 6], pigmentation: [1, 3], dark_spot: [0, 1] });
  });

  it('feeds the runner only the dimensions core would score', () => {
    const model = survey([{ type: 'radiogroup', name: 'q', dimension: 'd', choices: [{ value: 'a', text: 'A', score: 0 }, { value: 'b', text: 'B', score: 2 }] }]);
    expect(scoreSurveyAnswers(model, { q: 'b' })).toEqual({}); // no calculation method: not scored, no 'sum' default
  });
});
