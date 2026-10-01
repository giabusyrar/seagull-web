interface FormSubmission {
    form_id?: string;
    /** Survey code, when evaluating a specific survey. */
    code?: string;
    answers?: Record<string, unknown>;
    answer_list?: Array<{
        question_name?: string;
        value?: unknown;
    }>;
}
interface VisionSubmission {
    photo_url?: string;
    analysis_type?: string;
    metrics?: Record<string, number>;
}
interface AssessmentEvaluateRequest {
    brand_id: string;
    application_id: string;
    customer_id?: string;
    customer_token?: string;
    customer_conditions?: Record<string, boolean>;
    form?: FormSubmission;
    vision?: VisionSubmission;
    metadata?: Record<string, unknown>;
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

export type { AssessmentEvaluateRequest as A, AssessmentEvaluateResponse as a };
