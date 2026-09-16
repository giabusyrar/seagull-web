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
  };
}

export interface AssessmentPayload {
  brandId: string;
  applicationId: string;
  answers: Record<string, any>;
  images?: { view: 'front' | 'left' | 'right'; data: string }[];
  customerConditions?: Record<string, boolean>;
  userAge?: number;
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
      severityTiers: Record<string, { gradeName: string; severity: string }>;
      totalScore: number;
    };
    matching: {
      amRoutine: Array<{ step: string; productName: string; matchScore: number; reason: string }>;
      pmRoutine: Array<{ step: string; productName: string; matchScore: number; reason: string }>;
      contraindicationWarnings: string[];
    };
  };
  timings: Record<string, number>;
}
