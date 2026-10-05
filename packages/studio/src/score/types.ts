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
  /** The input sources this ruleset blends, and how to read each one's raw values. */
  sources?: Record<string, SourceSpec>;
  /** Per dimension: which field of each source feeds it, and with what weight (summing to 1). */
  dimension_inputs?: Record<string, DimensionInputs>;
  /** @deprecated Legacy two-source blend, read only (core reads it as sources
   *  form/vision when `sources` is absent). The editor saves `dimension_inputs`. */
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
  /** @deprecated Legacy two-source input mapping, read only (core reads it,
   *  with dimension_fusion, when `sources` is absent). The editor saves
   *  `dimension_inputs`. */
  field_mapping?: Record<string, { form?: string; vision?: string }>;
}

/** How to read a source's raw values: `concern` = higher is worse, `health` = higher is better. */
export type SourceDirection = 'concern' | 'health';

/** One input source of a ruleset: its value range and direction. Core
 *  normalises every input to 0-100 concern from these before blending. */
export interface SourceSpec {
  scale: [number, number];
  direction: SourceDirection;
}

/** One dimension's inputs as core reads them: weights > 0, summing to 1. */
export interface DimensionInputs {
  inputs: Record<string, string>;
  weights: Record<string, number>;
  /** Sources without which the dimension is not scored. */
  required?: string[];
}

/** The two sources a legacy ruleset (field_mapping + dimension_fusion, no
 *  `sources`) converts to without changing a score, as core specified them
 *  (Core session, 2026-10-04): form arrives 0-100 in concern space; vision's
 *  vendor fields are 0-100 in HEALTH space (legacy code inverted them before
 *  blending; the new shape passes them raw, so the direction says so). A fact
 *  about the legacy format, not a default for new sources. */
export const LEGACY_SOURCES: Readonly<Record<'form' | 'vision', SourceSpec>> = {
  form: { scale: [0, 100], direction: 'concern' },
  vision: { scale: [0, 100], direction: 'health' },
};

/** The form field fed by date of birth rather than an answer; a legacy
 *  field_mapping.form naming it is the one form mapping core actually read. */
export const AGE_FIELD = 'age_over_30';

/** The age, in whole years, above which AGE_FIELD reads 100 (concern) rather
 *  than 0. Not a policy of this repo: it is core's AgeOverThirty check
 *  (seagull-core apps/core-engine/internal/form/domain/vision_mapping.go,
 *  `age > 30`, evaluated in Asia/Jakarta — someone turning exactly 30 today is
 *  not over). The Studio never applies it: /simulate and /evaluate run core's
 *  check. It exists only to label the simulator's age input, and must change
 *  if core's does. */
export const AGE_FIELD_CUTOFF_YEARS = 30;

/** The sources whose fields have a registered catalog to pick from. Any other
 *  declared source (a device, a lab) names its fields directly. */
export const FORM_SOURCE = 'form';
export const VISION_SOURCE = 'vision';

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
 *  AGE_FIELD — DOB is still fundamentally a questionnaire answer, just
 *  from a different form than Q1-Q6); 'vision' references a known CV output
 *  field (see KNOWN_VISION_FIELDS). */
export interface InputSource {
  /** The source's name in the ruleset's `sources`. */
  origin: string;
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
];

/** One source feeding an axis. `weight` is a percentage (0-100); an axis's
 *  weights must add up to 100. Left undefined when a legacy ruleset gave none,
 *  so the gap shows instead of being filled in. */
export interface AxisInput {
  source: string;
  field: string;
  label?: string;
  weight?: number;
}

export interface VisualAxisConfig {
  id: string;
  axisCode: string;
  name: string;
  dimensionKey: string;
  /** Rollup weight — how much this dimension counts toward the overall score. */
  weight: number;
  /** Clinical concern name shown when this dimension is the dominant concern. */
  concernLabel?: string;

  /** Where this axis's number comes from: one row per source. One row is a
   *  single source; several are blended by their weights. */
  inputs?: AxisInput[];
  /** Sources without which this dimension is not scored. */
  required?: string[];
  /** Ordered bands turning the composed number into a letter. 2 bands ->
   *  axis_codes; 3+ -> a decisionTableNode. */
  bands?: ThresholdBand[];

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

/** One source's part in a dimension score (health space, 100 = healthy);
 *  `weight` is the weight applied after missing sources were re-shared. */
export interface SourceContribution {
  score: number;
  weight: number;
}

/** Mirrors the Go domain.DimensionBreakdown / SkinProfileV2 (stage2Score's
 *  shared output shape — identical for /evaluate and /simulate). */
export interface DimensionBreakdown {
  scored?: boolean;
  contributions?: Record<string, SourceContribution>;
  /** Sources this dimension maps that did not arrive. */
  missing?: string[];
  /** Why it was not scored. */
  reason?: string;
  final_score: number | null;
  axis: string | null;
  /** @deprecated two-source fields; use contributions. */
  source?: 'form' | 'vision' | 'blend' | 'none';
  /** @deprecated */
  form_score?: number | null;
  /** @deprecated */
  vision_score?: number | null;
  /** @deprecated */
  weight?: { form: number; vision: number };
}

/** The N-source breakdown every scoring response carries, per dimension. */
export interface DimensionBlend {
  scored: boolean;
  score?: number;
  contributions: Record<string, SourceContribution>;
  missing: string[];
  reason?: string;
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
    dimension_breakdown?: Record<string, DimensionBlend>;
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
