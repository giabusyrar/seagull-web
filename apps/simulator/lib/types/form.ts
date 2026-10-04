// Form-engine evaluation output (core-engine form EvaluationOutput), as
// /evaluate and /evaluate-with-photos return it and as the conversation
// engine's `score` result carries it. Fields may be missing.

export interface GradingTier { dimension_key?: string; score?: number; grade_name?: string; severity?: string }
export interface AnswerRow { question?: string; answer?: unknown; score?: number }

export interface EvaluationOutput {
  success?: boolean;
  code?: string;
  total_score?: number;
  dimension_scores?: Record<string, number>;
  skin_concern?: { dimension?: string; label?: string; score?: number };
  skin_profile?: { code?: string; name?: string; description?: string; axis_values?: Record<string, string> };
  skin_grading_tiers?: GradingTier[];
  customer_condition?: Record<string, boolean>;
  sub_classification?: Record<string, string>;
  answer_list?: AnswerRow[];
  applied_rules?: string[];
  assessment_id?: string;
  evaluated_at?: string;
  /** Only from /evaluate-with-photos: the vision signals the score used. */
  vision_signals_used?: Record<string, number>;
  error?: string;
}
