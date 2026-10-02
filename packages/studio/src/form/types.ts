export interface FormFieldConfig {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'boolean';
  required?: boolean;
  options?: string[];
}

export interface FormSchema {
  id: string;
  name: string;
  key: string;
  description?: string;
  fields: FormFieldConfig[];
  createdAt?: string;
}

export interface ConditionItem {
  code: string;
  name: string;
  description?: string;
  deprecated?: boolean;
}


export interface DimensionItem {
  code: string;
  name: string;
  maxScore: number;
  weight?: number;
  parentCode?: string; // If set, this is a Sub-Dimension of parentCode (e.g., "SLP" -> "SLP_CIRCADIAN")
  driverLabel?: string; // Label used when this dimension is a root cause deficit (e.g. "Poor Sleep Recovery")
  resolver?: 'linear' | 'ratio' | 'capped' | 'threshold' | string;
  description?: string;
  orderIndex?: number;
}

export interface QuestionOption {
  label: string;
  value: string;
  score?: number; // The answer's point value for its question's single dimension.
  conditionMap?: Record<string, boolean>; // safety flags this answer raises (e.g. { is_pregnant: true })

  // --- Legacy (no longer written by the builder UI; kept for backward compatibility) ---
  dimensionScores?: Record<string, number>;
}

// Builder question types. Each maps to a SurveyJS element type on save
// (see studio/form/surveyjs.ts).
export type QuestionType =
  | 'single_choice' // radiogroup
  | 'multi_choice' // checkbox
  | 'dropdown' // dropdown
  | 'boolean' // boolean
  | 'rating' // rating
  | 'ranking' // ranking
  | 'matrix' // matrix (rows scored against shared columns)
  | 'numeric_input' // text (inputType number)
  | 'slider'; // rating (kept for back-compat)

export interface MatrixRow {
  value: string;
  label: string;
}

export interface QuestionItem {
  id: string;
  type: QuestionType;
  label: string;
  dimension: string; // The ONE dimension this question feeds (e.g. "sebum", "sensitivity").
  options: QuestionOption[]; // choices, or (for matrix) the shared scored columns

  // matrix: the rows scored against `options` (columns).
  rows?: MatrixRow[];
  // boolean: score for each state (defaults 1 / 0).
  scoreTrue?: number;
  scoreFalse?: number;
  // rating / numeric: value bounds used for downstream normalisation.
  scale?: { min: number; max: number };

  // --- Legacy (no longer written by the builder UI; kept for backward compatibility) ---
  subDimension?: string;
  dimensions?: string[];
}

// How a dimension's answer scores are combined into one number, mirroring
// apps/services/score-engine/pkg/service/score_service.go. Labeling and
// normalization happen downstream in the Score Engine, not here.
export type CalculationMethod =
  | 'sum'
  | 'average'
  | 'max'
  | 'min'
  | 'boolean_or'
  | 'boolean_and';

export interface QuestionnaireItem {
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
  calculationMethods?: Record<string, CalculationMethod>; // per-dimension aggregation (default 'sum')
  isDraft?: boolean;
}

export interface DomainScoreSummary {
  code: string;
  name?: string;
  score: number;
  weight: number;
  maxScore: number;
  ratio: number; // 0.00 - 1.00
  band: 'GREEN' | 'AMBER' | 'RED';
  subDimensions?: Record<string, {
    code: string;
    name?: string;
    score: number;
    maxScore: number;
  }>;
}

export interface ScoreDriverOutput {
  domain: string;
  label: string;
  deficit: number;
  share: number; // Percentage contribution (e.g. 34.6%)
}

import type { SkinProfile, SkinGradingTier, AnswerEntry } from '@gateway-experience/shared';

export type { SkinProfile, SkinGradingTier, AnswerEntry };

export interface FormEvaluationResult {
  success?: boolean;
  code?: string;
  brand_id?: string;
  application_id?: string;
  total_score?: number;
  totalScore?: number;
  dimension_scores?: Record<string, number>;
  skin_profile?: SkinProfile;
  skin_grading_tiers?: SkinGradingTier[];
  customer_condition?: Record<string, boolean>;
  answer_list?: Array<{ answer: string; score: number; min_score: number; max_score: number }>;
  analysis_result?: Record<string, any>;
  applied_rules?: string[];
  evaluated_at?: string;
  skinProfile?: SkinProfile;
  skinGradingTiers?: SkinGradingTier[];
  baumannSkinType?: { code: string; name: string; description?: string };
  baumann_skin_type?: { code: string; name: string; description?: string };
  longevity_band?: string;
  drivers?: any[];
}

export interface MultiGradingResult extends FormEvaluationResult {
  domainScores?: Record<string, DomainScoreSummary>;
  subDimensionScores?: Record<string, number>;
  lifestylePriorities?: string[];
  recommendedProducts?: string[];
  recommendedTreatments?: string[];
  clinicalFlags?: string[];
}

export type FormTab = 'questionnaires' | 'simulator';


