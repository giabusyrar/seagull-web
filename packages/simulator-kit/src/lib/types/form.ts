// Form-engine evaluation output (core-engine form EvaluationOutput), as
// /evaluate and /evaluate-with-photos return it and as the conversation
// engine's `score` result carries it. Fields may be missing.

export interface GradingTier { dimension_key?: string; score?: number; grade_name?: string; severity?: string }
/** score is null when the form declares no score for the answer (core ANSWER_NOT_SCORED). */
export interface AnswerRow { question?: string; answer?: unknown; score?: number | null }

/** One source's part in a dimension score: its score (health space, 100 = healthy) and the weight applied after re-sharing. */
export interface Contribution { score?: number; weight?: number }
/** How one dimension was blended from its sources (core's N-source blend). */
export interface DimensionBreakdown {
  scored?: boolean;
  score?: number;
  contributions?: Record<string, Contribution>;
  /** Sources the ruleset maps for this dimension that did not arrive. */
  missing?: string[];
  /** Why it was not scored. */
  reason?: string;
}

export interface EvaluationOutput {
  success?: boolean;
  code?: string;
  total_score?: number;
  dimension_scores?: Record<string, number>;
  /** Per dimension, which sources made the score and with what weight; only from cores with the N-source blend. */
  dimension_breakdown?: Record<string, DimensionBreakdown>;
  skin_concern?: { dimension?: string; label?: string; score?: number };
  skin_profile?: { code?: string; name?: string; description?: string; axis_values?: Record<string, string> };
  skin_grading_tiers?: GradingTier[];
  customer_condition?: Record<string, boolean>;
  sub_classification?: Record<string, string>;
  answer_list?: AnswerRow[];
  applied_rules?: string[];
  /** Absent in a dry run, where nothing is stored. */
  assessment_id?: string;
  /** The ruleset that scored this evaluation (it follows the survey). */
  ruleset_code?: string;
  /** true: core stored nothing for this evaluation. */
  dry_run?: boolean;
  evaluated_at?: string;
  /** Only from /evaluate-with-photos: the vision signals the score used. */
  vision_signals_used?: Record<string, number>;
  /** Caveats core attached, e.g. DIMENSION_NOT_SCORED, PROFILE_INCOMPLETE (profile built from the scored axes only). */
  warnings?: { code?: string; message?: string }[];
  error?: string;
}
