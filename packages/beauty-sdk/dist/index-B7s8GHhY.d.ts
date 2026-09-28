import React from 'react';
import { SkinProfile, SkinGradingTier } from '@gateway-experience/shared';

declare const ScoreManager: React.FC;

interface ScoreRuleset {
    id: string;
    brandId: string;
    applicationId: string;
    code: string;
    title: string;
    description?: string;
    status: string;
    version: number;
    schema: string;
    createdAt?: string;
    updatedAt?: string;
}
interface TableColumn {
    id: string;
    field: string;
    label: string;
}
interface DecisionTableContent {
    hitPolicy: 'first' | 'collect';
    inputs: TableColumn[];
    outputs: TableColumn[];
    rules: Record<string, string>[];
}
interface JDMNode {
    id: string;
    name: string;
    type: 'inputNode' | 'decisionTableNode' | 'expressionNode' | 'outputNode' | string;
    content?: DecisionTableContent | any;
    position?: {
        x: number;
        y: number;
    };
}
interface JDMEdge {
    id: string;
    sourceId: string;
    targetId: string;
}
/** A single grading band: score up to `max` maps to `label`. Health-oriented
 *  (100 = optimal, 0 = critical) — a higher score always means healthier skin. */
interface VisualBand {
    id: string;
    max: number;
    label: string;
}
interface JDMDecisionModel {
    nodes: JDMNode[];
    edges: JDMEdge[];
    /** Per-dimension rollup weight for the weighted-mean total_score. Keyed by dimensionKey. */
    dimension_weights?: Record<string, number>;
    /** Per-dimension form-vs-vision blend, applied only when camera analysis is enabled. */
    dimension_fusion?: Record<string, {
        form: number;
        vision: number;
    }>;
    /** Clinical concern name per dimension, surfaced when it is the dominant concern. */
    concern_labels?: Record<string, string>;
    /** Score Range Categorization bands (3), applied to total_score. */
    score_range_bands?: Array<{
        max: number;
        label: string;
    }>;
    /** Severity Level bands (4), applied to total_score. */
    severity_bands?: Array<{
        max: number;
        label: string;
    }>;
    /** Per-dimension bipolar (Baumann) classifier. Keyed by lowercase dimensionKey.
     *  When present for a dimension, its axis_values letter is `score >= threshold
     *  ? high : low` instead of the Score-Range initial. Also written for any
     *  axis with exactly 2 bands (a >2-band axis instead gets a decisionTableNode). */
    axis_codes?: Record<string, {
        threshold: number;
        low: string;
        high: string;
    }>;
    /** Documents, per axis, which registered form dimension and/or vision field
     *  its number actually comes from (e.g. pigmentation <- form "pigmentation"
     *  + vision "score_darkspot"). Not read by the engine — this is the spec an
     *  orchestrator reads to know how to build a /evaluate request's dimensions[]
     *  and vision_signals from a raw vendor response and form answers. */
    field_mapping?: Record<string, {
        form?: string;
        vision?: string;
    }>;
}
/** Defaults used when a ruleset carries no overrides. Health-oriented: the
 *  score climbs from 0 (critical) to 100 (optimal). */
declare const DEFAULT_SCORE_RANGE_BANDS: VisualBand[];
/** Clinical 5-level severity scale (Scoring Method doc). */
declare const DEFAULT_SEVERITY_BANDS: VisualBand[];
interface VisualSeverityTier {
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
interface InputSource {
    origin: 'form' | 'vision';
    fieldCode: string;
    label: string;
}
/** One health-oriented (100 = optimal) score range mapped to an axis letter.
 *  Bands must be ordered, non-overlapping, and cover 0-100 with no gaps —
 *  an axis with exactly 2 bands compiles to a plain axis_codes threshold;
 *  3+ compiles to a decisionTableNode (e.g. Pore Severity's Smooth/Visible/
 *  Enlarged). */
interface ThresholdBand {
    id: string;
    min: number;
    max: number;
    letter: string;
}
interface VisualAxisConfig {
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
type ProfileStrategyType = 'total_score' | 'combination_matrix' | 'primary_concern';
interface VisualProfileEntry {
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
interface VisualProfileMappingConfig {
    strategy: ProfileStrategyType;
    profiles: VisualProfileEntry[];
}
/** Request body for POST /score-engine/simulate. HEALTH-space (100 = sehat,
 *  matching what the slider is labelled) — the backend converts each to
 *  concern-space before handing off to the exact same stage2Score fusion
 *  /evaluate uses, so the two can never drift apart. age_years feeds the
 *  ruleset's age_over_30-mapped dimension via the real AgeOverThirty check,
 *  overriding any form_scores entry for that same dimension. */
interface RulesetSimulationRequest {
    schema: string;
    form_scores?: Record<string, number>;
    vision_scores?: Record<string, number>;
    age_years?: number;
    customer_condition?: Record<string, boolean>;
}
/** Mirrors the Go domain.DimensionBreakdown / SkinProfileV2 (stage2Score's
 *  shared output shape — identical for /evaluate and /simulate). */
interface DimensionBreakdown {
    source: 'form' | 'vision' | 'blend' | 'none';
    form_score: number | null;
    vision_score: number | null;
    weight?: {
        form: number;
        vision: number;
    };
    final_score: number | null;
    axis: string | null;
}
interface SkinProfileV2 {
    code: string;
    name: string;
    category?: string;
    description: string;
    complete: boolean;
    axis_values?: Record<string, string>;
}
interface RulesetSimulationResponse {
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
type SkinProfileItem = SkinProfile;
interface ScoreEvaluationResult {
    inputPayload?: Record<string, any>;
    finalScore?: number;
    appliedRules?: string[];
    dimensionScores?: Record<string, number>;
    skinProfile?: SkinProfile;
    skinGradingTiers?: SkinGradingTier[];
    customerConditions?: Record<string, boolean>;
    performance?: string;
}

interface BlendingTabProps {
    rulesets: ScoreRuleset[];
    selectedRuleset: ScoreRuleset | null;
    onSelectRuleset: (ruleset: ScoreRuleset) => void;
    onSaveRuleset: (updated: Partial<ScoreRuleset>) => Promise<void>;
}
declare const BlendingTab: React.FC<BlendingTabProps>;

interface ProfileMappingTableProps {
    axes: VisualAxisConfig[];
    config: VisualProfileMappingConfig;
    onChange: (updated: VisualProfileMappingConfig) => void;
    disabled?: boolean;
}
declare const ProfileMappingTable: React.FC<ProfileMappingTableProps>;

interface ClinicalDimensionCardProps {
    axis: VisualAxisConfig;
    index: number;
    onUpdate: (updated: VisualAxisConfig) => void;
    onDelete: () => void;
    canDelete?: boolean;
    disabled?: boolean;
    defaultOpen?: boolean;
    /** Sum of every dimension's weight — used to show this one's effective share. */
    siblingWeightTotal?: number;
}
declare const ClinicalDimensionCard: React.FC<ClinicalDimensionCardProps>;
declare const ClinicalAxisCard: React.FC<ClinicalDimensionCardProps>;

interface SeverityTierTableProps {
    tiers: VisualSeverityTier[];
    onChange: (tiers: VisualSeverityTier[]) => void;
    disabled?: boolean;
    /** Show the short letter code per level (only used by the Combination Matrix profile strategy). */
    showValueCode?: boolean;
}
declare const SeverityTierTable: React.FC<SeverityTierTableProps>;

interface BandTableProps {
    bands: VisualBand[];
    onChange: (bands: VisualBand[]) => void;
    disabled?: boolean;
    /** Fixed row count — bands can be re-labelled and re-bounded but not added/removed. */
    fixed?: boolean;
    idPrefix?: string;
}
/**
 * Editor for a set of contiguous score bands (0..100, health-oriented — 100 = optimal).
 * Each row owns an upper bound `max`; the lower bound is the previous row's
 * `max + 1` (0 for the first row). Editing a `max` keeps the list sorted.
 */
declare const BandTable: React.FC<BandTableProps>;

declare function defaultConcernLabel(dimKey: string): string;
declare const DEFAULT_STARTER_AXES: VisualAxisConfig[];
declare const DEFAULT_STARTER_PROFILES: VisualProfileMappingConfig;
/**
 * Compiles the visual Skin Grading configuration into a JDM Decision Model.
 * The graph is intentionally minimal: one Skin Profile decision table. Score
 * Range / Severity Level / Skin Concern are computed by the engine from the
 * bands and concern labels carried alongside the graph.
 */
declare function compileVisualToJDM(axes: VisualAxisConfig[], profileConfig?: VisualProfileMappingConfig, scoreRangeBands?: VisualBand[], severityBands?: VisualBand[], 
/** The schema being edited, if any. Any node in it that this function
 *  doesn't itself own (not 'input_node'/'profile', not `<axisKey>-band`
 *  for a key in `axes`) is carried over untouched — e.g. a hand-authored
 *  node with no axis_values output (Pore Severity writes to
 *  sub_classification, not a 4-letter code) that this editor has no way
 *  to represent yet. Without this, saving silently deletes it. */
existingSchema?: string): string;
interface DecompiledGrading {
    axes: VisualAxisConfig[];
    profileConfig: VisualProfileMappingConfig;
    scoreRangeBands: VisualBand[];
    severityBands: VisualBand[];
    /** True when the schema had content but carried none of the Phase-2 markers
     *  (dimension_weights / concern_labels / a skin_profile.* node). The editor
     *  shows best-effort defaults and a warning: saving rewrites it to the new
     *  format. */
    legacy: boolean;
}
/**
 * Decompiles a JDM schema back into the visual Skin Grading configuration.
 */
declare function decompileJDMToVisualComponents(schemaStr: string): DecompiledGrading;
/** Backwards-compatibility helper for existing callers. */
declare function decompileJDMToVisual(schemaStr: string): VisualAxisConfig[];

declare const index_BandTable: typeof BandTable;
declare const index_BlendingTab: typeof BlendingTab;
declare const index_ClinicalAxisCard: typeof ClinicalAxisCard;
declare const index_ClinicalDimensionCard: typeof ClinicalDimensionCard;
declare const index_DEFAULT_SCORE_RANGE_BANDS: typeof DEFAULT_SCORE_RANGE_BANDS;
declare const index_DEFAULT_SEVERITY_BANDS: typeof DEFAULT_SEVERITY_BANDS;
declare const index_DEFAULT_STARTER_AXES: typeof DEFAULT_STARTER_AXES;
declare const index_DEFAULT_STARTER_PROFILES: typeof DEFAULT_STARTER_PROFILES;
type index_DecisionTableContent = DecisionTableContent;
type index_JDMDecisionModel = JDMDecisionModel;
declare const index_ProfileMappingTable: typeof ProfileMappingTable;
type index_ProfileStrategyType = ProfileStrategyType;
type index_RulesetSimulationRequest = RulesetSimulationRequest;
type index_RulesetSimulationResponse = RulesetSimulationResponse;
type index_ScoreEvaluationResult = ScoreEvaluationResult;
declare const index_ScoreManager: typeof ScoreManager;
type index_ScoreRuleset = ScoreRuleset;
declare const index_SeverityTierTable: typeof SeverityTierTable;
type index_SkinProfileItem = SkinProfileItem;
type index_VisualAxisConfig = VisualAxisConfig;
type index_VisualBand = VisualBand;
type index_VisualProfileEntry = VisualProfileEntry;
type index_VisualProfileMappingConfig = VisualProfileMappingConfig;
type index_VisualSeverityTier = VisualSeverityTier;
declare const index_compileVisualToJDM: typeof compileVisualToJDM;
declare const index_decompileJDMToVisual: typeof decompileJDMToVisual;
declare const index_decompileJDMToVisualComponents: typeof decompileJDMToVisualComponents;
declare const index_defaultConcernLabel: typeof defaultConcernLabel;
declare namespace index {
  export { index_BandTable as BandTable, index_BlendingTab as BlendingTab, index_ClinicalAxisCard as ClinicalAxisCard, index_ClinicalDimensionCard as ClinicalDimensionCard, index_DEFAULT_SCORE_RANGE_BANDS as DEFAULT_SCORE_RANGE_BANDS, index_DEFAULT_SEVERITY_BANDS as DEFAULT_SEVERITY_BANDS, index_DEFAULT_STARTER_AXES as DEFAULT_STARTER_AXES, index_DEFAULT_STARTER_PROFILES as DEFAULT_STARTER_PROFILES, type index_DecisionTableContent as DecisionTableContent, type index_JDMDecisionModel as JDMDecisionModel, index_ProfileMappingTable as ProfileMappingTable, type index_ProfileStrategyType as ProfileStrategyType, type index_RulesetSimulationRequest as RulesetSimulationRequest, type index_RulesetSimulationResponse as RulesetSimulationResponse, type index_ScoreEvaluationResult as ScoreEvaluationResult, index_ScoreManager as ScoreManager, type index_ScoreRuleset as ScoreRuleset, index_SeverityTierTable as SeverityTierTable, type index_SkinProfileItem as SkinProfileItem, type index_VisualAxisConfig as VisualAxisConfig, type index_VisualBand as VisualBand, type index_VisualProfileEntry as VisualProfileEntry, type index_VisualProfileMappingConfig as VisualProfileMappingConfig, type index_VisualSeverityTier as VisualSeverityTier, index_compileVisualToJDM as compileVisualToJDM, index_decompileJDMToVisual as decompileJDMToVisual, index_decompileJDMToVisualComponents as decompileJDMToVisualComponents, index_defaultConcernLabel as defaultConcernLabel };
}

export { BandTable as B, ClinicalAxisCard as C, DEFAULT_SCORE_RANGE_BANDS as D, type JDMDecisionModel as J, ProfileMappingTable as P, type RulesetSimulationRequest as R, ScoreManager as S, type VisualAxisConfig as V, BlendingTab as a, ClinicalDimensionCard as b, DEFAULT_SEVERITY_BANDS as c, DEFAULT_STARTER_AXES as d, DEFAULT_STARTER_PROFILES as e, type DecisionTableContent as f, type ProfileStrategyType as g, type RulesetSimulationResponse as h, index as i, type ScoreEvaluationResult as j, type ScoreRuleset as k, SeverityTierTable as l, type SkinProfileItem as m, type VisualBand as n, type VisualProfileEntry as o, type VisualProfileMappingConfig as p, type VisualSeverityTier as q, compileVisualToJDM as r, decompileJDMToVisual as s, decompileJDMToVisualComponents as t, defaultConcernLabel as u };
