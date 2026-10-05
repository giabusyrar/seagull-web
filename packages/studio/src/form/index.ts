'use client';

export { FormManager } from './components/FormManager';
export {
  QuestionnaireRunner,
  type QuestionnaireRunnerProps,
  type QuestionnaireRunnerPayload,
  type RunnerDimensionScore,
} from './QuestionnaireRunner';
export {
  listQuestionnaires,
  getQuestionnaire,
  getQuestionnaireModel,
  saveQuestionnaire,
  deleteQuestionnaire,
  MissingTenantError,
  getDimensions,
  type DimensionRow,
  getSafetyFlags,
  createSafetyFlag,
  type SafetyFlagRow,
} from './api';
export {
  toSurveyModel,
  fromSurveyModel,
  scoreSurveyAnswers,
  buildScoreRequest,
  flattenElements,
  type SurveyJSModel,
  type SurveyJSPage,
  type SurveyJSElement,
  type SurveyJSChoice,
  type ScoreRequestCore,
  type ScoreDimensionRef,
  type ScoreAnswerEntry,
} from './surveyjs';
export {
  BUILTIN_TEMPLATES,
  PFORM_EXAMPLE,
  fromPFormSchema,
  applyDimensionMapping,
  CALCULATION_METHODS,
  applyCalculationMethod,
  getDimensionMeta,
  type BuiltinTemplate,
  type DimensionMeta,
} from './catalog';
export type {
  FormSchema,
  FormFieldConfig,
  QuestionnaireItem,
  QuestionItem,
  QuestionOption,
  QuestionType,
  MatrixRow,
  CalculationMethod,
} from './types';
