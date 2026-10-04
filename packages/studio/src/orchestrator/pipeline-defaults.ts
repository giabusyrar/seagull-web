import type { OrchestratorPipelineConfig } from './types';

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
export const DEFAULT_PIPELINE_SETTINGS = {
  id: 'pipe-default',
  brandId: 'brand_wardah',
  applicationId: 'app_kiosk',
  channel: 'kiosk',
  executionStrategy: 'dynamic_capability_dispatch',
  vision: {
    timeoutMs: 3000,
    inputMode: 'single_image',
    confidenceThreshold: 0.6,
    enabledCapabilities: [],
  },
  form: {
    questionnaireCode: 'q_default_diagnostic',
    dimensionMappingRules: {
      q_sebum: 'sebum',
      q_sensitivity: 'sensitivity',
      q_pigmentation: 'pigmentation',
      q_aging: 'aging',
      q_barrier: 'barrier',
    },
  },
  scoring: {
    rulesetCode: 'ruleset_default_jdm',
    dimensionFusionWeights: {
      sebum: { formWeight: 0.4, visionWeight: 0.6 },
      acne: { formWeight: 0.3, visionWeight: 0.7 },
      pigmentation: { formWeight: 0.4, visionWeight: 0.6 },
      aging: { formWeight: 0.5, visionWeight: 0.5 },
      sensitivity: { formWeight: 0.6, visionWeight: 0.4 },
      barrier: { formWeight: 0.5, visionWeight: 0.5 },
    },
  },
  matching: {
    minEfficacyScore: 40,
    strictContraindications: true,
    maxAmRoutineSteps: 4,
    maxPmRoutineSteps: 4,
    timeoutMs: 5000,
  },
} satisfies PipelineSettings;

/** A pipeline config without its service URLs, which come from `PipelineEnv`. */
export type PipelineSettings = Omit<OrchestratorPipelineConfig, 'vision' | 'matching'> & {
  vision: Omit<OrchestratorPipelineConfig['vision'], 'serviceUrl'>;
  matching: Omit<OrchestratorPipelineConfig['matching'], 'serviceUrl'>;
};
