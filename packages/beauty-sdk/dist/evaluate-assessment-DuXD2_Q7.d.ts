import { BeautyClientConfig } from './types/index.js';

/**
 * core-engine's SurveyEvaluateRequest (seagull-core
 * internal/form/domain/survey.go). The survey code travels in the PATH, not
 * the body, and the answers are `data` — not `answers`, and not `answer_list`,
 * which is what the evaluation returns rather than what it takes.
 */
interface AssessmentEvaluateRequest {
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
interface SkinGradingTier {
    dimension_key?: string;
    score?: number;
    grade_name?: string;
    severity?: string;
}
interface AssessmentWarning {
    code?: string;
    message?: string;
}
/**
 * core-engine's EvaluationOutput. Scoring is stateless; the handler stores the
 * result as a customer assessment and reports its id — or leaves assessment_id
 * empty and explains why in warnings, which is worth surfacing rather than
 * treating a stored and an unstored result as the same thing.
 */
interface AssessmentEvaluateResponse {
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

/** An assessment request whose scope may come from the client config instead. */
type AssessmentEvaluateInput = Omit<AssessmentEvaluateRequest, 'brand_id' | 'application_id'> & {
    brand_id?: string;
    application_id?: string;
};
/** Anything that can evaluate a survey into a stored assessment. */
interface AssessmentEvaluator {
    evaluateAssessment(surveyCode: string, request: AssessmentEvaluateInput): Promise<AssessmentEvaluateResponse>;
}
/**
 * Evaluate one survey and store the result as a customer assessment.
 *
 * core-engine takes the survey code from the path: its handler reads :code
 * and looks the survey up with it, so a call without one finds nothing. The
 * gateway's own /api/v1/assessments/evaluate is being retired.
 *
 * The client/ transport has no forms.evaluate operation yet (see
 * client/operations.ts), so this is the one place the call is made.
 * `config.gatewayUrl` is used as given; gatewayAssessmentEvaluator trims a
 * trailing slash first, as the legacy client's constructor does.
 */
declare function evaluateAssessment(config: BeautyClientConfig, surveyCode: string, request: AssessmentEvaluateInput, doFetch?: typeof fetch): Promise<AssessmentEvaluateResponse>;
/** An AssessmentEvaluator that calls the gateway directly with this config. */
declare function gatewayAssessmentEvaluator(config: BeautyClientConfig): AssessmentEvaluator;

export { type AssessmentEvaluateInput as A, type AssessmentEvaluator as a, type AssessmentEvaluateResponse as b, type AssessmentEvaluateRequest as c, evaluateAssessment as e, gatewayAssessmentEvaluator as g };
