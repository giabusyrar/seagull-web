export { i as Core, C as CoreCollectionKey, D as DynamicCollection, a as DynamicCollectionRoute, g as getActiveCoreCollections, b as getCollectionPrefix, r as resolveDynamicEndpoint } from './index-DIzEQZzi.js';
import * as contracts from '@gateway-experience/contracts';
export { contracts as Contracts };
export { i as Hooks, U as UseSkinAssessmentOptions, u as useRegimenMatch, a as useSkinAssessment } from './index-BUsE9cJu.js';
export { A as AgingProgressionSlider, a as AgingProgressionSliderProps, B as BeautyExperienceWidget, b as BeautyExperienceWidgetProps, D as DimensionOption, c as DimensionScoreCard, d as DimensionScoreCardProps, e as DimensionSelector, f as DimensionSelectorProps, P as PolygonHeatmap, g as PolygonHeatmapProps, h as ProductRecommendationCard, i as ProductRecommendationCardProps, j as UI, j as Vision } from './index-BsQ2or1V.js';
export { i as Studio } from './index-CBLwogx7.js';
export { i as Form, F as FormManager, i as FormStudio } from './index-Dalie5NP.js';
export { i as Score, S as ScoreManager, i as ScoreStudio } from './index-DYahXy8i.js';
export { i as Match, M as MatchManager, i as MatchStudio } from './index-qBDTpV0E.js';
export { i as Reference, R as ReferenceManager, i as ReferenceStudio } from './index-BUgXs2mW.js';
export { AgingProgressionResult, AgingTimelinePoint, BeautyClientConfig, ClinicalSummary, EnvironmentalContext, FacialZoneData, NormalizedPoint, RecommendedProduct, VisionAnalysisOptions, VisionAnalysisResponse, ZoneUvMetric } from './types/index.js';
export { AssessmentsSubClient, BeautyClient, FormSubClient, MatchSubClient, ReferenceSubClient, VisionSubClient } from './client/index.js';
import 'react';
import '@gateway-experience/shared';

type PipelineExecutionStrategy = 'dynamic_capability_dispatch' | 'parallel_late_fusion' | 'vision_first_reverse_probe' | 'form_only' | 'vision_only';
interface VisionCapabilityInfo {
    id: string;
    name: string;
    description: string;
    triggerKeys: string[];
    outputDimensions: string[];
}
interface OrchestratorPipelineConfig {
    id: string;
    brandId: string;
    applicationId: string;
    channel: 'kiosk' | 'mobile_app' | 'web_widget';
    executionStrategy: PipelineExecutionStrategy;
    vision: {
        serviceUrl: string;
        timeoutMs: number;
        inputMode: 'single_image' | 'multi_view' | 'video_keyframe';
        confidenceThreshold: number;
        enabledCapabilities: string[];
    };
    form: {
        questionnaireCode: string;
        dimensionMappingRules: Record<string, string>;
    };
    scoring: {
        rulesetCode: string;
        dimensionFusionWeights: Record<string, {
            formWeight: number;
            visionWeight: number;
        }>;
    };
    matching: {
        minEfficacyScore: number;
        strictContraindications: boolean;
        maxAmRoutineSteps: number;
        maxPmRoutineSteps: number;
    };
}
interface AssessmentPayload {
    brandId: string;
    applicationId: string;
    answers: Record<string, any>;
    images?: {
        view: 'front' | 'left' | 'right';
        data: string;
    }[];
    customerConditions?: Record<string, boolean>;
    userAge?: number;
    configOverride?: Partial<OrchestratorPipelineConfig>;
}
interface UnifiedAssessmentResponse {
    success: boolean;
    pipelineId: string;
    executionStrategy: PipelineExecutionStrategy;
    stages: {
        form: {
            extractedDimensions: Record<string, number>;
            detectedConditions: string[];
        };
        vision: {
            dispatchedCapabilities: string[];
            telemetrySignals: Record<string, number>;
            spatialZones?: Record<string, Record<string, number>>;
        };
        scoring: {
            fusedDimensionScores: Record<string, number>;
            skinProfile: {
                code: string;
                name: string;
                category?: string;
                description?: string;
            };
            severityTiers: Record<string, {
                gradeName: string;
                severity: string;
            }>;
            totalScore: number;
        };
        matching: {
            amRoutine: Array<{
                step: string;
                productName: string;
                matchScore: number;
                reason: string;
            }>;
            pmRoutine: Array<{
                step: string;
                productName: string;
                matchScore: number;
                reason: string;
            }>;
            contraindicationWarnings: string[];
        };
    };
    timings: Record<string, number>;
}

interface DbSkinConditionRecord {
    id: string;
    code: string;
    name: string;
    dimensionCode: string;
    visionCapabilities: string[];
    triggerKeys: string[];
    description?: string;
}
/**
 * Fetches dynamic skin conditions and their PyTorch vision capability mappings from the database.
 * No static hardcoded arrays — database is the single source of truth.
 */
declare function fetchSkinConditionsFromDb(baseUrl?: string): Promise<DbSkinConditionRecord[]>;
/**
 * Invalidates the in-memory cache to force a fresh DB read on next dispatch.
 */
declare function invalidateSkinConditionCache(): void;
/**
 * Dynamically resolves required PyTorch vision capabilities from database-defined skin conditions
 * based on user-detected conditions and trigger keys.
 */
declare function resolveRequiredCapabilitiesFromDb(detectedConditions: string[], baseUrl?: string): Promise<string[]>;
/**
 * Backward compatibility alias for resolveRequiredCapabilitiesFromDb.
 */
declare function resolveRequiredCapabilities(detectedConditions: string[], baseUrl?: string): Promise<string[]>;

declare function dispatchPyTorchCapabilities(params: {
    serviceUrl: string;
    timeoutMs: number;
    capabilities: string[];
    images?: {
        view: string;
        data: string;
    }[];
}): Promise<Record<string, number>>;

declare function fuseDimensionScores(formScores: Record<string, number>, visionScores: Record<string, number>, weights?: Record<string, {
    formWeight: number;
    visionWeight: number;
}>): Record<string, number>;

declare function executeAssessmentPipeline(payload: AssessmentPayload): Promise<UnifiedAssessmentResponse>;

type index_AssessmentPayload = AssessmentPayload;
type index_DbSkinConditionRecord = DbSkinConditionRecord;
type index_OrchestratorPipelineConfig = OrchestratorPipelineConfig;
type index_PipelineExecutionStrategy = PipelineExecutionStrategy;
type index_UnifiedAssessmentResponse = UnifiedAssessmentResponse;
type index_VisionCapabilityInfo = VisionCapabilityInfo;
declare const index_dispatchPyTorchCapabilities: typeof dispatchPyTorchCapabilities;
declare const index_executeAssessmentPipeline: typeof executeAssessmentPipeline;
declare const index_fetchSkinConditionsFromDb: typeof fetchSkinConditionsFromDb;
declare const index_fuseDimensionScores: typeof fuseDimensionScores;
declare const index_invalidateSkinConditionCache: typeof invalidateSkinConditionCache;
declare const index_resolveRequiredCapabilities: typeof resolveRequiredCapabilities;
declare const index_resolveRequiredCapabilitiesFromDb: typeof resolveRequiredCapabilitiesFromDb;
declare namespace index {
  export { type index_AssessmentPayload as AssessmentPayload, type index_DbSkinConditionRecord as DbSkinConditionRecord, type index_OrchestratorPipelineConfig as OrchestratorPipelineConfig, type index_PipelineExecutionStrategy as PipelineExecutionStrategy, type index_UnifiedAssessmentResponse as UnifiedAssessmentResponse, type index_VisionCapabilityInfo as VisionCapabilityInfo, index_dispatchPyTorchCapabilities as dispatchPyTorchCapabilities, index_executeAssessmentPipeline as executeAssessmentPipeline, index_fetchSkinConditionsFromDb as fetchSkinConditionsFromDb, index_fuseDimensionScores as fuseDimensionScores, index_invalidateSkinConditionCache as invalidateSkinConditionCache, index_resolveRequiredCapabilities as resolveRequiredCapabilities, index_resolveRequiredCapabilitiesFromDb as resolveRequiredCapabilitiesFromDb };
}

export { type AssessmentPayload, type DbSkinConditionRecord, index as Orchestrator, type OrchestratorPipelineConfig, type PipelineExecutionStrategy, type UnifiedAssessmentResponse, type VisionCapabilityInfo, dispatchPyTorchCapabilities, executeAssessmentPipeline, fetchSkinConditionsFromDb, fuseDimensionScores, invalidateSkinConditionCache, resolveRequiredCapabilities, resolveRequiredCapabilitiesFromDb };
