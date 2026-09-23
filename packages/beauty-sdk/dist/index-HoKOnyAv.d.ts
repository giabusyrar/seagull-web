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
     *  ? high : low` instead of the Score-Range initial. */
    axis_codes?: Record<string, {
        threshold: number;
        low: string;
        high: string;
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
interface VisualAxisConfig {
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
interface RulesetSimulationRequest {
    schema: string;
    dimension_scores: Record<string, number>;
    vision_signals?: Record<string, number>;
    customer_condition?: Record<string, boolean>;
}
interface RulesetSimulationResponse {
    success: boolean;
    performance?: string;
    result?: {
        axis_values?: Record<string, string>;
        tiers?: Record<string, {
            grade_name: string;
            severity: string;
        }>;
        traits?: Record<string, string>;
        total_score?: number;
        [key: string]: any;
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
declare function compileVisualToJDM(axes: VisualAxisConfig[], profileConfig?: VisualProfileMappingConfig, scoreRangeBands?: VisualBand[], severityBands?: VisualBand[]): string;
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
  export { index_BandTable as BandTable, index_ClinicalAxisCard as ClinicalAxisCard, index_ClinicalDimensionCard as ClinicalDimensionCard, index_DEFAULT_SCORE_RANGE_BANDS as DEFAULT_SCORE_RANGE_BANDS, index_DEFAULT_SEVERITY_BANDS as DEFAULT_SEVERITY_BANDS, index_DEFAULT_STARTER_AXES as DEFAULT_STARTER_AXES, index_DEFAULT_STARTER_PROFILES as DEFAULT_STARTER_PROFILES, type index_DecisionTableContent as DecisionTableContent, type index_JDMDecisionModel as JDMDecisionModel, index_ProfileMappingTable as ProfileMappingTable, type index_ProfileStrategyType as ProfileStrategyType, type index_RulesetSimulationRequest as RulesetSimulationRequest, type index_RulesetSimulationResponse as RulesetSimulationResponse, type index_ScoreEvaluationResult as ScoreEvaluationResult, index_ScoreManager as ScoreManager, type index_ScoreRuleset as ScoreRuleset, index_SeverityTierTable as SeverityTierTable, type index_SkinProfileItem as SkinProfileItem, type index_VisualAxisConfig as VisualAxisConfig, type index_VisualBand as VisualBand, type index_VisualProfileEntry as VisualProfileEntry, type index_VisualProfileMappingConfig as VisualProfileMappingConfig, type index_VisualSeverityTier as VisualSeverityTier, index_compileVisualToJDM as compileVisualToJDM, index_decompileJDMToVisual as decompileJDMToVisual, index_decompileJDMToVisualComponents as decompileJDMToVisualComponents, index_defaultConcernLabel as defaultConcernLabel };
}

export { BandTable as B, ClinicalAxisCard as C, DEFAULT_SCORE_RANGE_BANDS as D, type JDMDecisionModel as J, ProfileMappingTable as P, type RulesetSimulationRequest as R, ScoreManager as S, type VisualAxisConfig as V, ClinicalDimensionCard as a, DEFAULT_SEVERITY_BANDS as b, DEFAULT_STARTER_AXES as c, DEFAULT_STARTER_PROFILES as d, type DecisionTableContent as e, type ProfileStrategyType as f, type RulesetSimulationResponse as g, type ScoreEvaluationResult as h, index as i, type ScoreRuleset as j, SeverityTierTable as k, type SkinProfileItem as l, type VisualBand as m, type VisualProfileEntry as n, type VisualProfileMappingConfig as o, type VisualSeverityTier as p, compileVisualToJDM as q, decompileJDMToVisual as r, decompileJDMToVisualComponents as s, defaultConcernLabel as t };
