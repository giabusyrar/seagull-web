export type PipelineExecutionStrategy =
  | 'dynamic_capability_dispatch'
  | 'parallel_late_fusion'
  | 'vision_first_reverse_probe'
  | 'form_only'
  | 'vision_only';

export interface VisionCapabilityInfo {
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
export interface OrchestratorPipelineConfig {
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
export type PipelineConfigOverride = Partial<
  Omit<OrchestratorPipelineConfig, 'vision' | 'scoring' | 'matching'> & {
    vision: Partial<OrchestratorPipelineConfig['vision']>;
    scoring: Partial<OrchestratorPipelineConfig['scoring']>;
    matching: Partial<OrchestratorPipelineConfig['matching']>;
  }
>;

export interface AssessmentPayload {
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
  images?: { view: 'front' | 'left' | 'right'; data: string }[];
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
export interface ScoreDimensionBreakdown {
  scored: boolean;
  score?: number;
  contributions: Record<string, { score: number; weight: number }>;
  missing: string[];
  reason?: string;
}

export interface UnifiedAssessmentResponse {
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
      amRoutine: Array<{ step: string; productName: string; matchScore?: number; reason: string }>;
      pmRoutine: Array<{ step: string; productName: string; matchScore?: number; reason: string }>;
      contraindicationWarnings: string[];
      /** Brand-defined phases, when the engine answers with those. */
      phases?: Record<string, Array<{ step: string; productName: string; matchScore?: number; reason: string }>>;
      /** Why there is no regimen; absent when one was returned. */
      regimenError?: string;
    };
  };
  timings: Record<string, number>;
}
