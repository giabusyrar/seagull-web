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
   *  ? high : low` instead of the Score-Range initial. */
  axis_codes?: Record<string, { threshold: number; low: string; high: string }>;
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

export interface VisualAxisConfig {
  id: string;
  axisCode: string;
  name: string;
  dimensionKey: string;
  /** Rollup weight — how much this dimension counts toward the overall score. */
  weight: number;
  /** Clinical concern name shown when this dimension is the dominant concern. */
  concernLabel?: string;
  /** Form-vs-vision blend for this dimension (percent, sums to 100). Vision half
   *  only applies once camera analysis is live. */
  formWeight?: number;
  visionWeight?: number;
  /** Baumann-style bipolar classifier. When both letters are set, the engine
   *  assigns this dimension one of the two letters by threshold
   *  (score < threshold -> low, score >= threshold -> high) instead of the
   *  Score-Range initial (O/S/P). Leave blank to use the Score-Range letter. */
  axisCodeLow?: string;
  axisCodeHigh?: string;
  /** Threshold (0-100) for the bipolar split. Defaults to 50 when letters are set. */
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

export interface RulesetSimulationRequest {
  schema: string;
  dimension_scores: Record<string, number>;
  vision_signals?: Record<string, number>;
  customer_condition?: Record<string, boolean>;
}

export interface RulesetSimulationResponse {
  success: boolean;
  performance?: string;
  result?: {
    axis_values?: Record<string, string>;
    tiers?: Record<string, { grade_name: string; severity: string }>;
    traits?: Record<string, string>;
    total_score?: number;
    [key: string]: any;
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
