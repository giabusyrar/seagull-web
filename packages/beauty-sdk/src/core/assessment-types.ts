// Assessment shapes for the SDK's own calls.
//
// These used to come from @gateway-experience/contracts. The gateway is
// retiring its assessment stack, and those contract types go with it, so the
// SDK carries its own — mirroring what core-engine's survey evaluate actually
// returns (seagull-core internal/form/domain/evaluate.go, EvaluationOutput).

/**
 * core-engine's SurveyEvaluateRequest (seagull-core
 * internal/form/domain/survey.go). The survey code travels in the PATH, not
 * the body, and the answers are `data` — not `answers`, and not `answer_list`,
 * which is what the evaluation returns rather than what it takes.
 */
export interface AssessmentEvaluateRequest {
  brand_id: string;
  application_id: string;
  /** Required on submit, so every answer set is attributable. */
  customer_id: string;
  /** Answers keyed by question name. */
  data: Record<string, unknown>;
  customer_conditions?: Record<string, boolean>;
  /** Vision metrics to fuse with the form's dimensions. */
  vision_signals?: Record<string, number>;
  computed_dimensions?: Array<Record<string, unknown>>;
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
