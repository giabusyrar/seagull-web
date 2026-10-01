// Assessment shapes for the SDK's own calls.
//
// These used to come from @gateway-experience/contracts. The gateway is
// retiring its assessment stack, and those contract types go with it, so the
// SDK carries its own — mirroring what core-engine's survey evaluate actually
// returns (seagull-core internal/form/domain/evaluate.go, EvaluationOutput).

export interface FormSubmission {
  form_id?: string;
  /** Survey code, when evaluating a specific survey. */
  code?: string;
  answers?: Record<string, unknown>;
  answer_list?: Array<{ question_name?: string; value?: unknown }>;
}

export interface VisionSubmission {
  photo_url?: string;
  analysis_type?: string;
  metrics?: Record<string, number>;
}

export interface AssessmentEvaluateRequest {
  brand_id: string;
  application_id: string;
  customer_id?: string;
  customer_token?: string;
  customer_conditions?: Record<string, boolean>;
  form?: FormSubmission;
  vision?: VisionSubmission;
  metadata?: Record<string, unknown>;
}

export interface SkinGradingTier {
  dimension_key?: string;
  score?: number;
  grade_name?: string;
  severity?: string;
}

export interface AssessmentWarning {
  code?: string;
  message?: string;
}

/**
 * core-engine's EvaluationOutput. Scoring is stateless; the handler stores the
 * result as a customer assessment and reports its id — or leaves assessment_id
 * empty and explains why in warnings, which is worth surfacing rather than
 * treating a stored and an unstored result as the same thing.
 */
export interface AssessmentEvaluateResponse {
  success: boolean;
  code?: string;
  brand_id?: string;
  application_id?: string;
  customer_id?: string;
  total_score?: number;
  dimension_scores?: Record<string, number>;
  raw_dimension_scores?: Record<string, number>;
  score_range?: string;
  severity_level?: string;
  skin_profile?: unknown;
  skin_grading_tiers?: SkinGradingTier[];
  customer_condition?: Record<string, boolean>;
  answer_list?: Array<Record<string, unknown>>;
  analysis_result?: Record<string, unknown>;
  applied_rules?: string[];
  labels?: Record<string, unknown>;
  evaluated_at?: string;
  /** The stored customer_assessments row; empty when storing failed. */
  assessment_id?: string;
  warnings?: AssessmentWarning[];
}

/** One recommended product, as the match engine returns it. */
export interface RecommendedProduct {
  sku?: string;
  id?: string;
  name: string;
  brand?: string;
  category?: string;
  match_reason?: string;
  score_confidence?: number;
  image_url?: string;
  active_actives?: string[];
}
