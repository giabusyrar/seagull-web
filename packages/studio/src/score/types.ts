import type { SkinProfile, SkinGradingTier } from '@gateway-experience/shared';

export type { SkinProfile, SkinGradingTier };

export interface ScoreRuleset {
  id: string;
  brandId: string;
  applicationId: string;
  code: string;
  title: string;
  description?: string;
  status: string; // 'ACTIVE' | 'DRAFT' | 'INACTIVE' | 'ARCHIVED'
  version: number;
  schema: string; // JSON string of JDM Decision Model
  createdAt?: string;
  updatedAt?: string;
}

export interface TableColumn {
  id: string;
  field: string;
  label: string;
}

export interface DecisionTableContent {
  hitPolicy: 'first' | 'collect';
  inputs: TableColumn[];
  outputs: TableColumn[];
  rules: Record<string, string>[];
}

export interface JDMNode {
  id: string;
  name: string;
  type: 'inputNode' | 'decisionTableNode' | 'expressionNode' | 'outputNode' | string;
  content?: DecisionTableContent | any;
  position?: { x: number; y: number };
}

export interface JDMEdge {
  id: string;
  sourceId: string;
  targetId: string;
}

/** A single grading band: score up to `max` maps to `label`. Health-oriented
 *  (100 = optimal, 0 = critical) — a higher score always means healthier skin. */
export interface VisualBand {
  id: string;
  max: number;
  label: string;
}

export interface JDMDecisionModel {
  nodes: JDMNode[];
  edges: JDMEdge[];
  /** Per-dimension rollup weight for the weighted-mean total_score. Keyed by dimensionKey. */
  dimension_weights?: Record<string, number>;
  /** Per-dimension form-vs-vision blend, applied only when camera analysis is enabled. */
  dimension_fusion?: Record<string, { form: number; vision: number }>;
  /** Clinical concern name per dimension, surfaced when it is the dominant concern. */
  concern_labels?: Record<string, string>;
  /** Score Range Categorization bands (3), applied to total_score. */
  score_range_bands?: Array<{ max: number; label: string }>;
  /** Severity Level bands (4), applied to total_score. */
  severity_bands?: Array<{ max: number; label: string }>;
  /** Per-dimension bipolar (Baumann) classifier. Keyed by lowercase dimensionKey.
   *  When present for a dimension, its axis_values letter is `score >= threshold
   *  ? high : low` instead of the Score-Range initial. Also written for any
   *  axis with exactly 2 bands (a >2-band axis instead gets a decisionTableNode). */
  axis_codes?: Record<string, { threshold: number; low: string; high: string }>;
  /** Documents, per axis, which registered form dimension and/or vision field
   *  its number actually comes from (e.g. pigmentation <- form "pigmentation"
   *  + vision "score_darkspot"). Not read by the engine — this is the spec an
   *  orchestrator reads to know how to build a /evaluate request's dimensions[]
   *  and vision_signals from a raw vendor response and form answers. */
  field_mapping?: Record<string, { form?: string; vision?: string }>;
}

/** Defaults used when a ruleset carries no overrides. Health-oriented: the
 *  score climbs from 0 (critical) to 100 (optimal). */
export const DEFAULT_SCORE_RANGE_BANDS: VisualBand[] = [
  { id: 'sr1', max: 40, label: 'Perlu Perhatian Khusus' },
  { id: 'sr2', max: 60, label: 'Sedang' },
  { id: 'sr3', max: 100, label: 'Optimal' },
];

/** Clinical 5-level severity scale (Scoring Method doc). */
export const DEFAULT_SEVERITY_BANDS: VisualBand[] = [
  { id: 'sv1', max: 20, label: 'Sangat Parah' },
  { id: 'sv2', max: 40, label: 'Parah' },
  { id: 'sv3', max: 60, label: 'Sedang' },
  { id: 'sv4', max: 80, label: 'Ringan' },
  { id: 'sv5', max: 100, label: 'Sehat' },
];

export interface VisualSeverityTier {
  id: string;
  minScore: number;
  maxScore: number;
  valueCode: string;
  gradeName: string;
  severity: 'optimal' | 'mild' | 'moderate' | 'severe' | 'critical';
  trait: string;
}

/** Where one axis's number comes from at evaluate-time. Always a registered
 *  catalog entry — never free text — so the picker in the UI and the
 *  field_mapping this compiles to both stay meaningful: 'form' references a
 *  reference-service dimension code (Q1-Q6, or a DOB-derived one like
 *  age_over_30 — DOB is still fundamentally a questionnaire answer, just
 *  from a different form than Q1-Q6); 'vision' references a known CV output
 *  field (see KNOWN_VISION_FIELDS). */
export interface InputSource {
  origin: 'form' | 'vision';
  fieldCode: string;
  label: string;
}

/** One health-oriented (100 = optimal) score range mapped to an axis letter.
 *  Bands must be ordered, non-overlapping, and cover 0-100 with no gaps —
 *  an axis with exactly 2 bands compiles to a plain axis_codes threshold;
 *  3+ compiles to a decisionTableNode (e.g. Pore Severity's Smooth/Visible/
 *  Enlarged). */
export interface ThresholdBand {
  id: string;
  min: number;
  max: number;
  letter: string;
}

/** A curated catalog of CV output fields this system knows about — the
 *  vision-side counterpart to reference-service's dimensions. Confirmed
 *  against Paradev's real /api/v2/scoring response (baumann.dimensions.*)
 *  and Photo Matrix API.pdf. Picking from this list (never free text) is
 *  what lets a ruleset's field_mapping double as real integration docs. */
export interface VisionFieldMeta {
  code: string;
  label: string;
  description?: string;
}
// Codes here must match field_mapping.vision values exactly — the vendor's
// response is flattened by its FULL dot-path (a bare leaf name like
// "score_wrinkle" is not safe: the vendor genuinely repeats the same short
// name at more than one path with different scales/meanings, confirmed via
// a real staging response). This is decompile-time label sugar only — the
// live Blending tab resolves the authoritative option list from the
// ref_skin_conditions catalog (useVisionFields) at render time, so this
// list falling behind never breaks a save, only a label shown briefly
// before that catalog loads.
export const KNOWN_VISION_FIELDS: VisionFieldMeta[] = [
  { code: 'data.inference_result.results.skin_scoring.Darkspot', label: 'Darkspot', description: 'results.skin_scoring.Darkspot — feeds Pigmentation.' },
  { code: 'data.inference_result.results.skin_scoring.Wrinkle', label: 'Wrinkle', description: 'results.skin_scoring.Wrinkle — feeds Aging.' },
  { code: 'data.inference_result.results.skin_scoring.Pores', label: 'Pores', description: 'results.skin_scoring.Pores — feeds Pore Severity.' },
  { code: 'age_over_30', label: 'Age > 30 (from DOB)', description: 'Derived from date_of_birth on the identity questionnaire, not a Q1-Q6 question. 0 if <=30, 100 if >30.' },
];

export interface VisualAxisConfig {
  id: string;
  axisCode: string;
  name: string;
  dimensionKey: string;
  /** Rollup weight — how much this dimension counts toward the overall score. */
  weight: number;
  /** Clinical concern name shown when this dimension is the dominant concern. */
  concernLabel?: string;

  /** How this axis's one number is produced before banding. */
  inputComposition?: 'single_source' | 'weighted_blend';
  /** Used when inputComposition = 'single_source'. */
  source?: InputSource;
  /** Used when inputComposition = 'weighted_blend'. formWeight is 0-100;
   *  vision gets the remainder. */
  formWeight?: number;
  formSource?: InputSource;
  visionSource?: InputSource;
  /** Ordered bands turning the composed number into a letter. 2 bands ->
   *  axis_codes; 3+ -> a decisionTableNode. */
  bands?: ThresholdBand[];

  /** @deprecated superseded by formSource/visionSource + bands. */
  visionWeight?: number;
  /** @deprecated superseded by `bands`. */
  axisCodeLow?: string;
  axisCodeHigh?: string;
  axisCodeThreshold?: number;
  /** @deprecated Per-dimension severity tiers were replaced by overall Score
   *  Range + Severity Level bands. Kept optional for backward compatibility. */
  tiers?: VisualSeverityTier[];
}

export type ProfileStrategyType = 'total_score' | 'combination_matrix' | 'primary_concern';

export interface VisualProfileEntry {
  id: string;
  minScore?: number;
  maxScore?: number;
  dimensionCodes?: Record<string, string>;
  primaryDimension?: string;
  severityLevel?: string;
  code: string;
  title: string;
  category: string;
  summary?: string;
}

export interface VisualProfileMappingConfig {
  strategy: ProfileStrategyType;
  profiles: VisualProfileEntry[];
}

/** Request body for POST /score-engine/simulate. HEALTH-space (100 = sehat,
 *  matching what the slider is labelled) — the backend converts each to
 *  concern-space before handing off to the exact same stage2Score fusion
 *  /evaluate uses, so the two can never drift apart. age_years feeds the
 *  ruleset's age_over_30-mapped dimension via the real AgeOverThirty check,
 *  overriding any form_scores entry for that same dimension. */
export interface RulesetSimulationRequest {
  schema: string;
  form_scores?: Record<string, number>;
  vision_scores?: Record<string, number>;
  age_years?: number;
  customer_condition?: Record<string, boolean>;
}

/** Mirrors the Go domain.DimensionBreakdown / SkinProfileV2 (stage2Score's
 *  shared output shape — identical for /evaluate and /simulate). */
export interface DimensionBreakdown {
  source: 'form' | 'vision' | 'blend' | 'none';
  form_score: number | null;
  vision_score: number | null;
  weight?: { form: number; vision: number };
  final_score: number | null;
  axis: string | null;
}

export interface SkinProfileV2 {
  code: string;
  name: string;
  category?: string;
  description: string;
  complete: boolean;
  axis_values?: Record<string, string>;
}

export interface RulesetSimulationResponse {
  success: boolean;
  performance?: string;
  result?: {
    total_score?: number;
    dimensions?: Record<string, DimensionBreakdown>;
    skin_profile?: SkinProfileV2;
    sub_classification?: Record<string, unknown>;
    warnings?: string[];
  };
  error?: string;
}

// Backward-compatibility Aliases
export type SkinProfileItem = SkinProfile;
export type BaumannSkinType = SkinProfile;

export interface ScoreDimension {
  code: string;
  name: string;
  maxScore: number;
  weight?: number;
}

export interface SkinGradingAxis {
  id: string;
  brandId: string;
  applicationId: string;
  gradingCode: string;
  category?: string;
  axisCode: string;
  name: string;
  dimensionKey: string;
  weight: number;
  cutoffScore: number;
  lowValueCode: string;
  lowLabel: string;
  highValueCode: string;
  highLabel: string;
}

export interface ScoreEvaluationResult {
  inputPayload?: Record<string, any>;
  finalScore?: number;
  appliedRules?: string[];
  dimensionScores?: Record<string, number>;
  skinProfile?: SkinProfile;
  skinGradingTiers?: SkinGradingTier[];
  customerConditions?: Record<string, boolean>;
  performance?: string;
}
