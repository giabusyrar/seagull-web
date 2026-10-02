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

export interface OrchestratorPipelineConfig {
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
    dimensionFusionWeights: Record<string, { formWeight: number; visionWeight: number }>;
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

export interface AssessmentPayload {
  brandId: string;
  applicationId: string;
  answers: Record<string, any>;
  images?: { view: 'front' | 'left' | 'right'; data: string }[];
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

export interface UnifiedAssessmentResponse {
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
      severityTiers: Record<string, { gradeName: string; severity: string }>;
      /** Averaged over the dimensions that were scored; see missingDimensions. */
      totalScore: number;
      /** Dimensions with no score, so nothing downstream reads one into them. */
      missingDimensions?: string[];
    };
    matching: {
      amRoutine: Array<{ step: string; productName: string; matchScore: number; reason: string }>;
      pmRoutine: Array<{ step: string; productName: string; matchScore: number; reason: string }>;
      contraindicationWarnings: string[];
      /** Brand-defined phases, when the engine answers with those. */
      phases?: Record<string, Array<{ step: string; productName: string; matchScore: number; reason: string }>>;
      /** Why there is no regimen; absent when one was returned. */
      regimenError?: string;
    };
  };
  timings: Record<string, number>;
}
