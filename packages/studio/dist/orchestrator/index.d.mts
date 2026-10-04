import { HostRoutes } from '@gateway-experience/shared';

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
        /** Match engine endpoint; relative paths work in the browser only. */
        serviceUrl: string;
        timeoutMs: number;
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
    /**
     * Origin to resolve the pipeline's own relative calls against. A browser
     * does not need it; on a server there is no page to be relative to, so the
     * caller (the API route) supplies its own origin.
     */
    baseUrl?: string;
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
            /** Measured signals only. A capability with no model is absent here. */
            telemetrySignals: Record<string, number>;
            spatialZones?: Record<string, Record<string, number>>;
            /** Capabilities the model server could not run, with its reason. */
            unavailableCapabilities?: Record<string, string>;
            /** Capabilities dispatched that the response said nothing about. */
            missingCapabilities?: string[];
            /** Why nothing was dispatched at all. */
            dispatchError?: string;
        };
        scoring: {
            fusedDimensionScores: Record<string, number>;
            skinProfile: {
                code: string;
                name: string;
                category?: string;
                description?: string;
                /** True when a dimension the code needs was never scored. */
                indeterminate?: boolean;
            };
            severityTiers: Record<string, {
                gradeName: string;
                severity: string;
            }>;
            /** Averaged over the dimensions that were scored; see missingDimensions. */
            totalScore: number;
            /** Dimensions with no score, so nothing downstream reads one into them. */
            missingDimensions?: string[];
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
            /** Brand-defined phases, when the engine answers with those. */
            phases?: Record<string, Array<{
                step: string;
                productName: string;
                matchScore: number;
                reason: string;
            }>>;
            /** Why there is no regimen; absent when one was returned. */
            regimenError?: string;
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
declare function fetchSkinConditionsFromDb(skinConditionsUrl: string): Promise<DbSkinConditionRecord[]>;
/**
 * Invalidates the in-memory cache to force a fresh DB read on next dispatch.
 */
declare function invalidateSkinConditionCache(): void;
/**
 * Dynamically resolves required PyTorch vision capabilities from database-defined skin conditions
 * based on user-detected conditions and trigger keys.
 */
declare function resolveRequiredCapabilitiesFromDb(detectedConditions: string[], skinConditionsUrl: string): Promise<string[]>;
/**
 * Backward compatibility alias for resolveRequiredCapabilitiesFromDb.
 */
declare function resolveRequiredCapabilities(detectedConditions: string[], skinConditionsUrl: string): Promise<string[]>;

interface CapabilityDispatchResult {
    /**
     * Measured values only, keyed by display metric. A capability the model
     * server did not score is absent — never filled in with a stand-in, so a
     * caller cannot mistake a guess for a measurement.
     */
    telemetry: Record<string, number>;
    /** Capabilities the server could not run, with its reason. */
    unavailable: Record<string, string>;
    /** Capabilities asked for that the response said nothing about. */
    missing: string[];
    /** Why nothing was dispatched at all; absent when the call succeeded. */
    error?: string;
}
/**
 * Dispatch capabilities to the model server
 * (POST <serviceUrl>, /api/v1/models/dispatch-capabilities).
 *
 * This used to return a table of invented scores — sebum 72, acne 65 and so
 * on — whenever a capability had no model, the endpoint was unreachable or
 * the URL looked like a mock. Those numbers were shaped exactly like measured
 * ones, so nothing downstream could tell them apart. They are gone: what was
 * not measured is simply absent, and the reason travels with the result.
 */
declare function dispatchPyTorchCapabilities(params: {
    serviceUrl: string;
    timeoutMs: number;
    capabilities: string[];
    images?: {
        view: string;
        data: string;
    }[];
    /**
     * Data-plane key, when the model server is reached through the gateway
     * (it answers 401 without one). Supplied by the caller rather than read
     * here, so a browser bundle never carries it.
     */
    apiKey?: string;
}): Promise<CapabilityDispatchResult>;

declare function fuseDimensionScores(formScores: Record<string, number>, visionScores: Record<string, number>, weights?: Record<string, {
    formWeight: number;
    visionWeight: number;
}>): Record<string, number>;

interface RoutineStep {
    step: string;
    productName: string;
    matchScore: number;
    reason: string;
}
interface RegimenResult {
    amRoutine: RoutineStep[];
    pmRoutine: RoutineStep[];
    /**
     * Brand-defined phases, when the engine answers with those instead of the
     * AM/PM pair (its response carries either shape).
     */
    phases: Record<string, RoutineStep[]>;
    /** Warnings the engine raised about ingredient interactions. */
    warnings: string[];
    /** Why there is no regimen — unreachable, refused, or simply none returned. */
    error?: string;
}
declare function fetchRegimens(params: {
    url: string;
    brandId: string;
    applicationId: string;
    dimensionScores: Record<string, number>;
    customerConditions?: Record<string, boolean>;
    strategyId?: string;
    timeoutMs?: number;
}): Promise<RegimenResult>;

/**
 * The pipeline settings used when the caller supplies none. Every value here
 * is the one the executor has always applied inline; they were collected
 * into this object, unchanged, so a deployment can replace them through
 * `executeAssessmentPipeline(payload, { defaults })` or a payload
 * `configOverride`.
 *
 * None of these are measurements or calibrated values. The brand and
 * application ids are the demo tenant; the fusion weights, efficacy floor
 * and routine-step limits are policy that has no recorded source. Treat
 * them as placeholders until a deployment's own pipeline config replaces
 * them. Service URLs are not here: they come from the environment (see
 * `PipelineEnv`).
 */
declare const DEFAULT_PIPELINE_SETTINGS: {
    id: string;
    brandId: string;
    applicationId: string;
    channel: "kiosk";
    executionStrategy: "dynamic_capability_dispatch";
    vision: {
        timeoutMs: number;
        inputMode: "single_image";
        confidenceThreshold: number;
        enabledCapabilities: never[];
    };
    form: {
        questionnaireCode: string;
        dimensionMappingRules: {
            q_sebum: string;
            q_sensitivity: string;
            q_pigmentation: string;
            q_aging: string;
            q_barrier: string;
        };
    };
    scoring: {
        rulesetCode: string;
        dimensionFusionWeights: {
            sebum: {
                formWeight: number;
                visionWeight: number;
            };
            acne: {
                formWeight: number;
                visionWeight: number;
            };
            pigmentation: {
                formWeight: number;
                visionWeight: number;
            };
            aging: {
                formWeight: number;
                visionWeight: number;
            };
            sensitivity: {
                formWeight: number;
                visionWeight: number;
            };
            barrier: {
                formWeight: number;
                visionWeight: number;
            };
        };
    };
    matching: {
        minEfficacyScore: number;
        strictContraindications: true;
        maxAmRoutineSteps: number;
        maxPmRoutineSteps: number;
        timeoutMs: number;
    };
};
/** A pipeline config without its service URLs, which come from `PipelineEnv`. */
type PipelineSettings = Omit<OrchestratorPipelineConfig, 'vision' | 'matching'> & {
    vision: Omit<OrchestratorPipelineConfig['vision'], 'serviceUrl'>;
    matching: Omit<OrchestratorPipelineConfig['matching'], 'serviceUrl'>;
};

/** Deployment values the pipeline reads from its environment. */
interface PipelineEnv {
    /** Match engine origin; when absent the payload's baseUrl is used. */
    matchEngineUrl?: string;
    /** Sent to a capability dispatch service a configOverride names. Server-side only. */
    gatewayApiKey?: string;
}
/**
 * The environment as `process.env` has it. In a browser bundle process.env is
 * empty, so the API key is simply absent there rather than shipped to one.
 */
declare function pipelineEnvFromProcess(): PipelineEnv;
/** The services each pipeline stage calls. */
interface PipelineClients {
    resolveRequiredCapabilities: typeof resolveRequiredCapabilitiesFromDb;
    fetchSkinConditions: typeof fetchSkinConditionsFromDb;
    dispatchCapabilities: typeof dispatchPyTorchCapabilities;
    fuseScores: typeof fuseDimensionScores;
    fetchRegimens: typeof fetchRegimens;
}
interface PipelineDeps {
    /** The host app's routes the pipeline calls back into, resolved against the payload's baseUrl. */
    routes: Pick<HostRoutes, 'skinConditions'>;
    /** Settings used where the payload's configOverride is silent. */
    defaults?: PipelineSettings;
    /** Defaults to `pipelineEnvFromProcess()`. */
    env?: PipelineEnv;
    /** Any client left out uses the package's own HTTP client. */
    clients?: Partial<PipelineClients>;
}
/** The effective config: settings, plus service URLs from env, under the payload's override. */
declare function resolvePipelineConfig(payload: AssessmentPayload, settings: PipelineSettings, env: PipelineEnv): OrchestratorPipelineConfig;
declare function executeAssessmentPipeline(payload: AssessmentPayload, deps: PipelineDeps): Promise<UnifiedAssessmentResponse>;

export { type AssessmentPayload, type CapabilityDispatchResult, DEFAULT_PIPELINE_SETTINGS, type DbSkinConditionRecord, type OrchestratorPipelineConfig, type PipelineClients, type PipelineDeps, type PipelineEnv, type PipelineExecutionStrategy, type PipelineSettings, type UnifiedAssessmentResponse, type VisionCapabilityInfo, dispatchPyTorchCapabilities, executeAssessmentPipeline, fetchSkinConditionsFromDb, fuseDimensionScores, invalidateSkinConditionCache, pipelineEnvFromProcess, resolvePipelineConfig, resolveRequiredCapabilities, resolveRequiredCapabilitiesFromDb };
