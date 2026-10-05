import React from 'react';
import { HostRoutes } from '@gateway-experience/shared';

declare const FormManager: React.FC;

interface FormFieldConfig {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'number' | 'select' | 'boolean';
    required?: boolean;
    options?: string[];
}
interface FormSchema {
    id: string;
    name: string;
    key: string;
    description?: string;
    fields: FormFieldConfig[];
    createdAt?: string;
}
interface QuestionOption {
    label: string;
    value: string;
    score?: number;
    conditionMap?: Record<string, boolean>;
    dimensionScores?: Record<string, number>;
}
type QuestionType = 'single_choice' | 'multi_choice' | 'dropdown' | 'boolean' | 'rating' | 'ranking' | 'matrix' | 'numeric_input' | 'slider';
interface MatrixRow {
    value: string;
    label: string;
}
interface QuestionItem {
    id: string;
    type: QuestionType;
    label: string;
    dimension: string;
    options: QuestionOption[];
    rows?: MatrixRow[];
    scoreTrue?: number;
    scoreFalse?: number;
    scale?: {
        min: number;
        max: number;
    };
    subDimension?: string;
    dimensions?: string[];
}
type CalculationMethod = 'sum' | 'average' | 'max' | 'min' | 'boolean_or' | 'boolean_and';
interface QuestionnaireItem {
    code: string;
    name: string;
    description: string;
    status: 'draft' | 'published' | string;
    /** Tenant scope. Defaults to the Form Manager's active brand/application selector. */
    brandId?: string;
    applicationId?: string;
    questionsCount?: number;
    version?: string;
    questions?: QuestionItem[];
    calculationMethods?: Record<string, CalculationMethod>;
    isDraft?: boolean;
}

/**
 * Conversion between the builder's constrained QuestionnaireItem and a SurveyJS
 * schema (aligned with the Form Engine's domain.SurveyModel).
 *
 * SurveyJS is the standardised stored / on-the-wire form structure. The builder
 * keeps its friendly model; everything persisted or handed to a runner is
 * SurveyJS. `fromSurveyModel` is tolerant of legacy rows stored as a raw
 * QuestionnaireItem.
 */
interface SurveyJSChoice {
    value: string;
    text: string;
    score?: number;
    dimension?: string;
    condition_map?: Record<string, boolean>;
}
interface SurveyJSRow {
    value: string;
    text: string;
}
interface SurveyJSElement {
    type: string;
    name: string;
    title?: string;
    inputType?: string;
    dimension?: string;
    isRequired?: boolean;
    choices?: Array<SurveyJSChoice | string>;
    columns?: Array<SurveyJSChoice | string>;
    rows?: Array<SurveyJSRow | string>;
    scale?: {
        min: number;
        max: number;
    };
    rateMin?: number;
    rateMax?: number;
    displayMode?: string;
    min?: number;
    max?: number;
    scoreTrue?: number;
    scoreFalse?: number;
    renderAs?: string;
}
interface SurveyJSPage {
    name: string;
    title?: string;
    elements: SurveyJSElement[];
}
interface SurveyJSModel {
    title?: string;
    description?: string;
    code?: string;
    pages?: SurveyJSPage[];
    elements?: SurveyJSElement[];
    /** Per-dimension aggregation (XG extension; SurveyJS ignores unknown keys). */
    calculation_methods?: Record<string, CalculationMethod>;
    [key: string]: unknown;
}
declare function toSurveyModel(item: QuestionnaireItem): SurveyJSModel;
declare function flattenElements(model: SurveyJSModel): SurveyJSElement[];
declare function fromSurveyModel(raw: any): QuestionnaireItem;
interface ScoreAnswerEntry {
    answer: string;
    score: number;
    min_score: number;
    max_score: number;
}
interface ScoreDimensionRef {
    key: string;
    min_score: number;
    max_score: number;
    calculation_method: CalculationMethod;
    answers: number[];
}
interface ScoreRequestCore {
    answer_list: ScoreAnswerEntry[];
    customer_condition: Record<string, boolean>;
    dimensions: ScoreDimensionRef[];
}
/**
 * Builds the core of the `ScoreModuleRequest` the Form Engine sends to the Score
 * Engine — a faithful client-side mirror of form-engine's ExtractEvaluationData.
 * The caller adds `code` / `brand_id` / `application_id` / `vision_signals`.
 */
declare function buildScoreRequest(model: SurveyJSModel, data: Record<string, unknown>): ScoreRequestCore;
/** Per-dimension raw score contributions from a set of SurveyJS answers. */
declare function scoreSurveyAnswers(model: SurveyJSModel, data: Record<string, unknown>): Record<string, number[]>;

/**
 * QuestionnaireRunner — consumer-facing, embeddable questionnaire.
 *
 * Renders a SurveyJS form from a stored schema, so every SurveyJS question type
 * is available. On completion it computes the per-dimension scores client-side
 * (from the `score` / `dimension` props carried on the schema) and hands the
 * parent a payload. Respondents never see scores.
 *
 * `customerId` is opaque and only forwarded into the payload — the seam where a
 * pForm customer id will be threaded through later.
 *
 * The consumer app must load SurveyJS styles once, e.g.
 * `import 'survey-core/survey-core.css'` at the page/layout level.
 */
interface RunnerDimensionScore {
    code: string;
    calculation_method: CalculationMethod;
    score: number;
    raw_scores: number[];
}
/** One entry of SurveyJS's canonical result export (survey.getPlainData()). */
interface RunnerPlainDatum {
    name: string;
    title: string;
    value: unknown;
    displayValue: unknown;
}
interface QuestionnaireRunnerPayload {
    questionnaire_code: string;
    customer_id?: string;
    source: 'questionnaire';
    brand_id?: string;
    application_id?: string;
    /** SurveyJS answer data: questionName -> value (or value[]). */
    answers: Record<string, unknown>;
    /** SurveyJS canonical export: name / title / value / displayValue per question. */
    plain_data: RunnerPlainDatum[];
    dimensions: RunnerDimensionScore[];
    completed_at: string;
}
interface QuestionnaireRunnerProps {
    /** `code` of the questionnaire to run. Ignored when `model` is supplied. */
    questionnaireCode: string;
    /** Pre-loaded SurveyJS model; skips the network fetch. */
    model?: SurveyJSModel;
    /** Pre-loaded builder item; converted to a SurveyJS model. */
    questionnaire?: QuestionnaireItem;
    /** Opaque customer id (supplied by the integrating client), forwarded verbatim into the payload. */
    customerId?: string;
    /**
     * Tenant the questionnaire is stored under. Required to fetch by
     * `questionnaireCode`; without it the runner shows an error rather than
     * loading some other tenant's form.
     */
    brandId?: string;
    applicationId?: string;
    /** Fired once, with the computed payload, when the respondent submits. */
    onComplete: (payload: QuestionnaireRunnerPayload) => void | Promise<void>;
    /** Fired on every answer change. */
    onAnswer?: (questionName: string, value: unknown) => void;
    /** Rendered after submit instead of the built-in confirmation. */
    renderComplete?: (payload: QuestionnaireRunnerPayload) => React.ReactNode;
    className?: string;
}
declare const QuestionnaireRunner: React.FC<QuestionnaireRunnerProps>;

/**
 * Thrown when a questionnaire call is made without a brand / application.
 * There is no default tenant: a call without one would otherwise read or write
 * some real tenant's questionnaires. Callers show the message and ask the user
 * to pick a tenant.
 */
declare class MissingTenantError extends Error {
    constructor();
}
declare function listQuestionnaires(brandId: string, applicationId: string): Promise<QuestionnaireItem[]>;
declare function getQuestionnaire(code: string, brandId: string, applicationId: string): Promise<QuestionnaireItem | null>;
/** Raw SurveyJS model for a questionnaire — used by QuestionnaireRunner. */
declare function getQuestionnaireModel(code: string, brandId: string, applicationId: string): Promise<SurveyJSModel | null>;
declare function saveQuestionnaire(item: QuestionnaireItem, brandId?: string, applicationId?: string): Promise<void>;
declare function deleteQuestionnaire(code: string, brandId: string, applicationId: string): Promise<void>;
interface DimensionRow {
    code: string;
    name?: string;
    description?: string;
    parentCode?: string;
}
/** Dimension catalog from reference-service. Empty on failure (caller falls back). */
declare function getDimensions(routes: Pick<HostRoutes, 'reference'>): Promise<DimensionRow[]>;
interface SafetyFlagRow {
    code: string;
    name?: string;
    description?: string;
}
/**
 * Safety flag catalog (ref_conditions in reference-service) — the same
 * registered "customer condition" entity the Customer Conditions admin page
 * manages. Empty on failure (caller falls back to whatever's already used in
 * the questionnaire being edited, never a hardcoded list).
 */
declare function getSafetyFlags(routes: Pick<HostRoutes, 'reference'>): Promise<SafetyFlagRow[]>;
/**
 * Registers a new safety flag in the catalog (ref_conditions) — used when a
 * questionnaire builder picks "+ Custom..." on a choice's flag picker. The
 * flag becomes a real, named catalog entry from that point on (visible on
 * the Customer Conditions admin page, reusable on other questionnaires),
 * not just a bare code with no name anywhere. Returns null on failure —
 * caller still uses the flag locally on this questionnaire either way.
 */
declare function createSafetyFlag(routes: Pick<HostRoutes, 'reference'>, code: string, name: string): Promise<SafetyFlagRow | null>;

interface DimensionMeta {
    code: string;
    label: string;
    purpose: string;
}
/**
 * Friendly copy for a dimension code, looked up in `catalog` (the dimensions
 * loaded from reference data). An unknown code is shown as itself with no
 * purpose text — never with invented copy.
 */
declare const getDimensionMeta: (code: string, catalog?: DimensionMeta[]) => DimensionMeta;
declare const CALCULATION_METHODS: {
    value: CalculationMethod;
    label: string;
    hint: string;
}[];
declare const applyCalculationMethod: (scores: number[], method?: CalculationMethod) => number;
declare const PFORM_EXAMPLE: QuestionnaireItem;
/** Suggested XG dimension for each pForm question — a starting point, not enforced. */
declare const PFORM_SUGGESTED_DIMENSIONS: Record<string, string>;
type PFormChoiceLike = {
    label?: string;
    text?: string;
    title?: string;
    value?: string;
    score?: number;
};
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
    pages?: {
        elements?: PFormQuestionLike[];
    }[];
    elements?: PFormQuestionLike[];
};
/**
 * Structural import of a pForm form into an XG questionnaire. pForm carries the
 * questions and per-answer scores but no dimension, so every question's
 * `dimension` comes back blank — feed the result through `applyDimensionMapping`
 * once XG has assigned dimensions. Tolerant of pForm's shape not being final:
 * accepts SurveyJS-style (`pages`/`elements`) and flat
 * (`questions`/`items`/`fields`) inputs.
 */
declare function fromPFormSchema(raw: PFormSchemaLike): QuestionnaireItem;
/**
 * Assigns real dimension codes to a questionnaire's questions (and, optionally,
 * the per-dimension calculation methods). Questions not in `mapping` keep
 * whatever dimension they already have. Turns a pForm import / template into a
 * ready-to-save questionnaire once XG has decided each question's dimension.
 */
declare function applyDimensionMapping(q: QuestionnaireItem, mapping: Record<string, string>, methods?: Record<string, CalculationMethod>): QuestionnaireItem;
interface BuiltinTemplate {
    id: string;
    name: string;
    description: string;
    build: () => QuestionnaireItem;
}
declare const BUILTIN_TEMPLATES: BuiltinTemplate[];

declare const index_BUILTIN_TEMPLATES: typeof BUILTIN_TEMPLATES;
type index_BuiltinTemplate = BuiltinTemplate;
declare const index_CALCULATION_METHODS: typeof CALCULATION_METHODS;
type index_CalculationMethod = CalculationMethod;
type index_DimensionMeta = DimensionMeta;
type index_DimensionRow = DimensionRow;
type index_FormFieldConfig = FormFieldConfig;
declare const index_FormManager: typeof FormManager;
type index_FormSchema = FormSchema;
type index_MatrixRow = MatrixRow;
type index_MissingTenantError = MissingTenantError;
declare const index_MissingTenantError: typeof MissingTenantError;
declare const index_PFORM_EXAMPLE: typeof PFORM_EXAMPLE;
declare const index_PFORM_SUGGESTED_DIMENSIONS: typeof PFORM_SUGGESTED_DIMENSIONS;
type index_QuestionItem = QuestionItem;
type index_QuestionOption = QuestionOption;
type index_QuestionType = QuestionType;
type index_QuestionnaireItem = QuestionnaireItem;
declare const index_QuestionnaireRunner: typeof QuestionnaireRunner;
type index_QuestionnaireRunnerPayload = QuestionnaireRunnerPayload;
type index_QuestionnaireRunnerProps = QuestionnaireRunnerProps;
type index_RunnerDimensionScore = RunnerDimensionScore;
type index_SafetyFlagRow = SafetyFlagRow;
type index_ScoreAnswerEntry = ScoreAnswerEntry;
type index_ScoreDimensionRef = ScoreDimensionRef;
type index_ScoreRequestCore = ScoreRequestCore;
type index_SurveyJSChoice = SurveyJSChoice;
type index_SurveyJSElement = SurveyJSElement;
type index_SurveyJSModel = SurveyJSModel;
type index_SurveyJSPage = SurveyJSPage;
declare const index_applyCalculationMethod: typeof applyCalculationMethod;
declare const index_applyDimensionMapping: typeof applyDimensionMapping;
declare const index_buildScoreRequest: typeof buildScoreRequest;
declare const index_createSafetyFlag: typeof createSafetyFlag;
declare const index_deleteQuestionnaire: typeof deleteQuestionnaire;
declare const index_flattenElements: typeof flattenElements;
declare const index_fromPFormSchema: typeof fromPFormSchema;
declare const index_fromSurveyModel: typeof fromSurveyModel;
declare const index_getDimensionMeta: typeof getDimensionMeta;
declare const index_getDimensions: typeof getDimensions;
declare const index_getQuestionnaire: typeof getQuestionnaire;
declare const index_getQuestionnaireModel: typeof getQuestionnaireModel;
declare const index_getSafetyFlags: typeof getSafetyFlags;
declare const index_listQuestionnaires: typeof listQuestionnaires;
declare const index_saveQuestionnaire: typeof saveQuestionnaire;
declare const index_scoreSurveyAnswers: typeof scoreSurveyAnswers;
declare const index_toSurveyModel: typeof toSurveyModel;
declare namespace index {
  export { index_BUILTIN_TEMPLATES as BUILTIN_TEMPLATES, type index_BuiltinTemplate as BuiltinTemplate, index_CALCULATION_METHODS as CALCULATION_METHODS, type index_CalculationMethod as CalculationMethod, type index_DimensionMeta as DimensionMeta, type index_DimensionRow as DimensionRow, type index_FormFieldConfig as FormFieldConfig, index_FormManager as FormManager, type index_FormSchema as FormSchema, type index_MatrixRow as MatrixRow, index_MissingTenantError as MissingTenantError, index_PFORM_EXAMPLE as PFORM_EXAMPLE, index_PFORM_SUGGESTED_DIMENSIONS as PFORM_SUGGESTED_DIMENSIONS, type index_QuestionItem as QuestionItem, type index_QuestionOption as QuestionOption, type index_QuestionType as QuestionType, type index_QuestionnaireItem as QuestionnaireItem, index_QuestionnaireRunner as QuestionnaireRunner, type index_QuestionnaireRunnerPayload as QuestionnaireRunnerPayload, type index_QuestionnaireRunnerProps as QuestionnaireRunnerProps, type index_RunnerDimensionScore as RunnerDimensionScore, type index_SafetyFlagRow as SafetyFlagRow, type index_ScoreAnswerEntry as ScoreAnswerEntry, type index_ScoreDimensionRef as ScoreDimensionRef, type index_ScoreRequestCore as ScoreRequestCore, type index_SurveyJSChoice as SurveyJSChoice, type index_SurveyJSElement as SurveyJSElement, type index_SurveyJSModel as SurveyJSModel, type index_SurveyJSPage as SurveyJSPage, index_applyCalculationMethod as applyCalculationMethod, index_applyDimensionMapping as applyDimensionMapping, index_buildScoreRequest as buildScoreRequest, index_createSafetyFlag as createSafetyFlag, index_deleteQuestionnaire as deleteQuestionnaire, index_flattenElements as flattenElements, index_fromPFormSchema as fromPFormSchema, index_fromSurveyModel as fromSurveyModel, index_getDimensionMeta as getDimensionMeta, index_getDimensions as getDimensions, index_getQuestionnaire as getQuestionnaire, index_getQuestionnaireModel as getQuestionnaireModel, index_getSafetyFlags as getSafetyFlags, index_listQuestionnaires as listQuestionnaires, index_saveQuestionnaire as saveQuestionnaire, index_scoreSurveyAnswers as scoreSurveyAnswers, index_toSurveyModel as toSurveyModel };
}

export { flattenElements as A, BUILTIN_TEMPLATES as B, CALCULATION_METHODS as C, type DimensionMeta as D, fromPFormSchema as E, FormManager as F, fromSurveyModel as G, getDimensionMeta as H, getDimensions as I, getQuestionnaire as J, getQuestionnaireModel as K, getSafetyFlags as L, type MatrixRow as M, listQuestionnaires as N, saveQuestionnaire as O, PFORM_EXAMPLE as P, type QuestionItem as Q, type RunnerDimensionScore as R, type SafetyFlagRow as S, scoreSurveyAnswers as T, toSurveyModel as U, type BuiltinTemplate as a, type CalculationMethod as b, type DimensionRow as c, type FormFieldConfig as d, type FormSchema as e, MissingTenantError as f, PFORM_SUGGESTED_DIMENSIONS as g, type QuestionOption as h, index as i, type QuestionType as j, type QuestionnaireItem as k, QuestionnaireRunner as l, type QuestionnaireRunnerPayload as m, type QuestionnaireRunnerProps as n, type ScoreAnswerEntry as o, type ScoreDimensionRef as p, type ScoreRequestCore as q, type SurveyJSChoice as r, type SurveyJSElement as s, type SurveyJSModel as t, type SurveyJSPage as u, applyCalculationMethod as v, applyDimensionMapping as w, buildScoreRequest as x, createSafetyFlag as y, deleteQuestionnaire as z };
