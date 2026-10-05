import type { OrchestratorPipelineConfig } from './types';

/**
 * How long the pipeline waits on each service before giving up. These are
 * client-side waits, not engine policy and not a property of any tenant: a
 * timeout only decides when "no answer yet" becomes "no answer", and the
 * stage then reports that it timed out rather than returning a value.
 * A deployment can replace them through `defaults` or a configOverride.
 */
export const DEFAULT_VISION_TIMEOUT_MS = 3000;
export const DEFAULT_SCORE_TIMEOUT_MS = 5000;
export const DEFAULT_MATCH_TIMEOUT_MS = 5000;

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
export const DEFAULT_PIPELINE_SETTINGS = {
  executionStrategy: 'dynamic_capability_dispatch',
  vision: { timeoutMs: DEFAULT_VISION_TIMEOUT_MS },
  scoring: { timeoutMs: DEFAULT_SCORE_TIMEOUT_MS },
  matching: { timeoutMs: DEFAULT_MATCH_TIMEOUT_MS },
} satisfies PipelineSettings;

/** What a deployment may default: everything but the tenant, the ruleset and the service URLs. */
export interface PipelineSettings {
  executionStrategy: OrchestratorPipelineConfig['executionStrategy'];
  vision: { timeoutMs: number };
  scoring: { timeoutMs: number };
  matching: { timeoutMs: number; strategyId?: string };
}
