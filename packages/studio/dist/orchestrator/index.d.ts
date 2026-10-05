import { HostRoutes } from '@gateway-experience/shared';

type PipelineExecutionStrategy = 'dynamic_capability_dispatch' | 'parallel_late_fusion' | 'vision_first_reverse_probe' | 'form_only' | 'vision_only';
interface VisionCapabilityInfo {
    id: string;
    name: string;
    description: string;
    triggerKeys: string[];
    outputDimensions: string[];
}
/**
 * The effective pipeline config. The tenant (brand, application) and the
 * scoring ruleset have no defaults: the caller names them, and the pipeline
 * refuses to run without them rather than guess a tenant.
 */
interface OrchestratorPipelineConfig {
    brandId: string;
    applicationId: string;
    executionStrategy: PipelineExecutionStrategy;
    vision: {
        serviceUrl: string;
        timeoutMs: number;
    };
    scoring: {
        /** The core-engine ruleset that scores the answers; its linked questionnaire interprets them. */
        rulesetCode: string;
        /** Score engine evaluate endpoint, without the ruleset code; relative paths work in the browser only. */
        serviceUrl: string;
        timeoutMs: number;
    };
    matching: {
        /** Match engine endpoint; relative paths work in the browser only. */
        serviceUrl: string;
        timeoutMs: number;
        /** A match strategy the brand configured; the engine picks its own when absent. */
        strategyId?: string;
    };
}
/** A configOverride may replace any section, or only part of one. */
type PipelineConfigOverride = Partial<Omit<OrchestratorPipelineConfig, 'vision' | 'scoring' | 'matching'> & {
    vision: Partial<OrchestratorPipelineConfig['vision']>;
    scoring: Partial<OrchestratorPipelineConfig['scoring']>;
    matching: Partial<OrchestratorPipelineConfig['matching']>;
}>;
interface AssessmentPayload {
    brandId: string;
    applicationId: string;
    /**
     * Raw questionnaire answers, keyed as the ruleset's linked questionnaire
     * names its questions. They reach the score engine as answers; the
     * pipeline does not turn them into numbers itself.
     */
    answers: Record<string, unknown>;
    /** Skin-condition codes the customer named, used to pick vision capabilities. */
    concerns?: string[];
    /** The scoring ruleset; a configOverride.scoring.rulesetCode wins over it. */
    rulesetCode?: string;
    /** Required by the score engine unless the run is a dry run. */
    customerId?: string;
    /** Sends X-Dry-Run: true, so core-engine scores without a customer record. */
    dryRun?: boolean;
    images?: {
        view: 'front' | 'left' | 'right';
        data: string;
    }[];
    /**
     * Safety flags for the match engine. The score engine takes none: it
     * derives customer conditions from the answers (each choice's
     * condition_map), so these are added to what it derived, for matching only.
     */
    customerConditions?: Record<string, boolean>;
    userAge?: number;
    /**
     * Origin to resolve the pipeline's own relative calls against. A browser
     * does not need it; on a server there is no page to be relative to, so the
     * caller (the API route) supplies its own origin.
     */
    baseUrl?: string;
    configOverride?: PipelineConfigOverride;
}
/** One dimension's entry in core-engine's dimension_breakdown (HEALTH space, 100 = healthy). */
interface ScoreDimensionBreakdown {
    scored: boolean;
    score?: number;
    contributions: Record<string, {
        score: number;
        weight: number;
    }>;
    missing: string[];
    reason?: string;
}
interface UnifiedAssessmentResponse {
    success: boolean;
    pipelineId: string;
    executionStrategy: PipelineExecutionStrategy;
    stages: {
        form: {
            /** The question keys the caller answered, passed to the score engine unchanged. */
            answeredQuestions: string[];
            /** The concern codes the caller named. */
            detectedConditions: string[];
        };
        vision: {
            dispatchedCapabilities: string[];
            /**
             * Measured signals only, keyed by the capability that produced them.
             * A capability with no model is absent here.
             */
            telemetrySignals: Record<string, number>;
            spatialZones?: Record<string, Record<string, number>>;
            /** Capabilities the model server could not run, with its reason. */
            unavailableCapabilities?: Record<string, string>;
            /** Capabilities dispatched that the response said nothing about. */
            missingCapabilities?: string[];
            /** Why nothing was dispatched at all. */
            dispatchError?: string;
        };
        /** core-engine's score engine result for the configured ruleset. */
        scoring: {
            /** The ruleset that actually scored (core may report a different one than requested). */
            rulesetCode?: string;
            /** Per-dimension HEALTH scores (100 = healthy), scored dimensions only. Empty on an error. */
            fusedDimensionScores: Record<string, number>;
            /** Absent when the engine did not score. `complete` is false when an axis had no data. */
            skinProfile?: {
                code: string;
                name: string;
                category?: string;
                description?: string;
                complete: boolean;
                axisValues?: Record<string, string>;
            };
            /** The engine's total over its axis dimensions; absent when none was scored. */
            totalScore?: number;
            /** Every dimension the ruleset blends, scored or not, with each source's contribution. */
            dimensionBreakdown?: Record<string, ScoreDimensionBreakdown>;
            /** Dimensions the ruleset registers that were not scored this run. */
            missingDimensions?: string[];
            /** Conditions the engine derived from the answers. */
            customerConditions?: Record<string, boolean>;
            /** The engine's warnings, plus the pipeline's own notes about what it did not send. */
            warnings: string[];
            /** Why there are no scores: unreachable, refused, or not configured. */
            scoreError?: string;
        };
        matching: {
            amRoutine: Array<{
                step: string;
                productName: string;
                matchScore?: number;
                reason: string;
            }>;
            pmRoutine: Array<{
                step: string;
                productName: string;
                matchScore?: number;
                reason: string;
            }>;
            contraindicationWarnings: string[];
            /** Brand-defined phases, when the engine answers with those. */
            phases?: Record<string, Array<{
                step: string;
                productName: string;
                matchScore?: number;
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
     * Measured values only, keyed by capability. A capability the model
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

/** Where the score engine's evaluate endpoint is; the ruleset code is appended. */
declare const DEFAULT_SCORE_ENGINE_PATH = "/core/score-engine/evaluate";
interface ScoreResult {
    rulesetCode?: string;
    /** HEALTH scores (100 = healthy), scored dimensions only. */
    dimensionScores: Record<string, number>;
    totalScore?: number;
    skinProfile?: {
        code: string;
        name: string;
        category?: string;
        description?: string;
        complete: boolean;
        axisValues?: Record<string, string>;
    };
    breakdown: Record<string, ScoreDimensionBreakdown>;
    missingDimensions: string[];
    customerConditions: Record<string, boolean>;
    warnings: string[];
    /** Why there are no scores; absent when the engine scored. */
    error?: string;
}
declare function evaluateScore(params: {
    /** The evaluate endpoint without the ruleset code. */
    url: string;
    rulesetCode: string;
    brandId: string;
    applicationId: string;
    answers: Record<string, unknown>;
    customerId?: string;
    dryRun?: boolean;
    /** Sources other than form and vision, as the ruleset declares them. */
    sourceSignals?: Record<string, Record<string, number>>;
    /** Data-plane key when the engine is reached through the gateway directly. Server-side only. */
    apiKey?: string;
    timeoutMs?: number;
}): Promise<ScoreResult>;

interface RoutineStep {
    step: string;
    productName: string;
    /** The engine's own score; absent when it sent none. */
    matchScore?: number;
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
/** Where the match engine is, for a caller that cannot use a relative path. */
declare const DEFAULT_MATCH_ENGINE_PATH = "/core/match-engine/evaluate";
declare function fetchRegimens(params: {
    url: string;
    brandId: string;
    applicationId: string;
    /** The score engine's HEALTH scores, passed through unchanged. */
    dimensionScores: Record<string, number>;
    /**
     * The score engine's skin_profile. The match engine takes its skin type
     * from it and does not classify skin itself.
     */
    skinProfile?: {
        code: string;
        name: string;
        category?: string;
        description?: string;
        axisValues?: Record<string, string>;
    };
    customerConditions?: Record<string, boolean>;
    strategyId?: string;
    timeoutMs?: number;
}): Promise<RegimenResult>;

/**
 * How long the pipeline waits on each service before giving up. These are
 * client-side waits, not engine policy and not a property of any tenant: a
 * timeout only decides when "no answer yet" becomes "no answer", and the
 * stage then reports that it timed out rather than returning a value.
 * A deployment can replace them through `defaults` or a configOverride.
 */
declare const DEFAULT_VISION_TIMEOUT_MS = 3000;
declare const DEFAULT_SCORE_TIMEOUT_MS = 5000;
declare const DEFAULT_MATCH_TIMEOUT_MS = 5000;
/**
 * The pipeline settings used where the caller is silent. Only mechanical
 * values live here: the execution strategy and the timeouts above.
 *
 * There is deliberately no tenant, questionnaire or ruleset. These used to
 * default to a demo brand and application, a questionnaire code, a ruleset
 * code, answer-to-dimension mappings, fusion weights and matching limits —
 * none of them grounded, and a run that forgot its tenant silently scored
 * against the demo one. The caller now names brand, application and
 * ruleset (`PipelineInputError` otherwise); the ruleset owns everything that
 * used to be guessed here. Service URLs come from the environment
 * (see `PipelineEnv`).
 */
declare const DEFAULT_PIPELINE_SETTINGS: {
    executionStrategy: "dynamic_capability_dispatch";
    vision: {
        timeoutMs: number;
    };
    scoring: {
        timeoutMs: number;
    };
    matching: {
        timeoutMs: number;
    };
};
/** What a deployment may default: everything but the tenant, the ruleset and the service URLs. */
interface PipelineSettings {
    executionStrategy: OrchestratorPipelineConfig['executionStrategy'];
    vision: {
        timeoutMs: number;
    };
    scoring: {
        timeoutMs: number;
    };
    matching: {
        timeoutMs: number;
        strategyId?: string;
    };
}

/** Deployment values the pipeline reads from its environment. */
interface PipelineEnv {
    /** Match engine origin; when absent the payload's baseUrl is used. */
    matchEngineUrl?: string;
    /** Score engine origin; when absent the payload's baseUrl is used. */
    scoreEngineUrl?: string;
    /** Capability dispatch endpoint (full URL); absent: nothing is dispatched. */
    visionDispatchUrl?: string;
    /** Sent to the score, match and dispatch services. Server-side only. */
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
    evaluateScore: typeof evaluateScore;
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
/**
 * The caller left out something the pipeline will not guess: the tenant or
 * the scoring ruleset. An API route answers it with a 400.
 */
declare class PipelineInputError extends Error {
    readonly missing: string[];
    constructor(missing: string[]);
}
/**
 * The effective config: settings, plus service URLs from env, under the
 * payload's override. Throws `PipelineInputError` when brand, application
 * or ruleset is missing.
 *
 * Service URLs never come from the payload's override: the server attaches
 * the gateway API key to these calls, so a caller who could name the URL
 * could have the key sent to a host of their choosing.
 */
declare function resolvePipelineConfig(payload: AssessmentPayload, settings: PipelineSettings, env: PipelineEnv): OrchestratorPipelineConfig;
declare function executeAssessmentPipeline(payload: AssessmentPayload, deps: PipelineDeps): Promise<UnifiedAssessmentResponse>;

export { type AssessmentPayload, type CapabilityDispatchResult, DEFAULT_MATCH_ENGINE_PATH, DEFAULT_MATCH_TIMEOUT_MS, DEFAULT_PIPELINE_SETTINGS, DEFAULT_SCORE_ENGINE_PATH, DEFAULT_SCORE_TIMEOUT_MS, DEFAULT_VISION_TIMEOUT_MS, type DbSkinConditionRecord, type OrchestratorPipelineConfig, type PipelineClients, type PipelineConfigOverride, type PipelineDeps, type PipelineEnv, type PipelineExecutionStrategy, PipelineInputError, type PipelineSettings, type RegimenResult, type RoutineStep, type ScoreDimensionBreakdown, type ScoreResult, type UnifiedAssessmentResponse, type VisionCapabilityInfo, dispatchPyTorchCapabilities, evaluateScore, executeAssessmentPipeline, fetchRegimens, fetchSkinConditionsFromDb, invalidateSkinConditionCache, pipelineEnvFromProcess, resolvePipelineConfig, resolveRequiredCapabilities, resolveRequiredCapabilitiesFromDb };
