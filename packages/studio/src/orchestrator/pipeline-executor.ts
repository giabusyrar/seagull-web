import type { HostRoutes } from '@gateway-experience/shared';
import { AssessmentPayload, UnifiedAssessmentResponse, OrchestratorPipelineConfig } from './types';
import { resolveRequiredCapabilitiesFromDb, fetchSkinConditionsFromDb } from './capability-registry';
import { dispatchPyTorchCapabilities } from './pytorch-client';
import { evaluateScore, DEFAULT_SCORE_ENGINE_PATH } from './score-client';
import { fetchRegimens, DEFAULT_MATCH_ENGINE_PATH } from './match-client';
import { DEFAULT_PIPELINE_SETTINGS, type PipelineSettings } from './pipeline-defaults';

/** Deployment values the pipeline reads from its environment. */
export interface PipelineEnv {
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
export function pipelineEnvFromProcess(): PipelineEnv {
  return {
    matchEngineUrl: process.env.MATCH_ENGINE_URL,
    scoreEngineUrl: process.env.SCORE_ENGINE_URL,
    visionDispatchUrl: process.env.VISION_DISPATCH_URL,
    gatewayApiKey: process.env.GATEWAY_API_KEY,
  };
}

/** The services each pipeline stage calls. */
export interface PipelineClients {
  resolveRequiredCapabilities: typeof resolveRequiredCapabilitiesFromDb;
  fetchSkinConditions: typeof fetchSkinConditionsFromDb;
  dispatchCapabilities: typeof dispatchPyTorchCapabilities;
  evaluateScore: typeof evaluateScore;
  fetchRegimens: typeof fetchRegimens;
}

export interface PipelineDeps {
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
export class PipelineInputError extends Error {
  constructor(public readonly missing: string[]) {
    super(`The assessment pipeline needs ${missing.join(', ')}; none was supplied and none is assumed.`);
    this.name = 'PipelineInputError';
  }
}

const defaultClients = (): PipelineClients => ({
  resolveRequiredCapabilities: resolveRequiredCapabilitiesFromDb,
  fetchSkinConditions: fetchSkinConditionsFromDb,
  dispatchCapabilities: dispatchPyTorchCapabilities,
  evaluateScore,
  fetchRegimens,
});

/**
 * The effective config: settings, plus service URLs from env, under the
 * payload's override. Throws `PipelineInputError` when brand, application
 * or ruleset is missing.
 *
 * Service URLs never come from the payload's override: the server attaches
 * the gateway API key to these calls, so a caller who could name the URL
 * could have the key sent to a host of their choosing.
 */
export function resolvePipelineConfig(
  payload: AssessmentPayload,
  settings: PipelineSettings,
  env: PipelineEnv,
): OrchestratorPipelineConfig {
  const o = payload.configOverride || {};
  const config: OrchestratorPipelineConfig = {
    brandId: o.brandId || payload.brandId || '',
    applicationId: o.applicationId || payload.applicationId || '',
    executionStrategy: o.executionStrategy || settings.executionStrategy,
    vision: {
      timeoutMs: settings.vision.timeoutMs,
      ...o.vision,
      // worker-models, which served capability dispatch, was retired with
      // the model registry (Seagull-core, 2026-10-03). A deployment names a
      // dispatch service in its environment; without one the vision stage
      // reports that nothing was dispatched, and why.
      serviceUrl: env.visionDispatchUrl || '',
    },
    scoring: {
      rulesetCode: payload.rulesetCode || '',
      timeoutMs: settings.scoring.timeoutMs,
      // The score engine origin when the pipeline runs on a server; otherwise
      // the app's own path, which the dashboard proxies to the gateway.
      ...o.scoring,
      serviceUrl: `${env.scoreEngineUrl || payload.baseUrl || ''}${DEFAULT_SCORE_ENGINE_PATH}`,
    },
    matching: {
      ...settings.matching,
      ...o.matching,
      serviceUrl: `${env.matchEngineUrl || payload.baseUrl || ''}${DEFAULT_MATCH_ENGINE_PATH}`,
    },
  };

  const missing = [
    !config.brandId && 'brandId',
    !config.applicationId && 'applicationId',
    !config.scoring.rulesetCode && 'rulesetCode',
  ].filter((m): m is string => !!m);
  if (missing.length) throw new PipelineInputError(missing);

  return config;
}

export async function executeAssessmentPipeline(
  payload: AssessmentPayload,
  deps: PipelineDeps,
): Promise<UnifiedAssessmentResponse> {
  const startTime = Date.now();
  const timings: Record<string, number> = {};
  const env = deps.env ?? pipelineEnvFromProcess();
  const clients = { ...defaultClients(), ...deps.clients };
  const config = resolvePipelineConfig(payload, deps.defaults ?? DEFAULT_PIPELINE_SETTINGS, env);
  const skinConditionsUrl = `${payload.baseUrl || ''}${deps.routes.skinConditions}`;

  // -------------------------------------------------------------
  // STAGE 1: FORM INPUT
  // The answers are passed to the score engine as answers; the ruleset's
  // linked questionnaire interprets them. Nothing is scored here.
  // -------------------------------------------------------------
  const t0 = Date.now();
  const answers = payload.answers || {};
  const detectedConditions = Array.isArray(payload.concerns) ? [...payload.concerns] : [];
  timings['stage1_form_ms'] = Date.now() - t0;

  // -------------------------------------------------------------
  // STAGE 2: CAPABILITY DISPATCH
  // -------------------------------------------------------------
  const t1 = Date.now();
  let dispatchedCaps: string[] = [];

  if (config.executionStrategy === 'dynamic_capability_dispatch') {
    dispatchedCaps = await clients.resolveRequiredCapabilities(detectedConditions, skinConditionsUrl);
  } else if (
    config.executionStrategy === 'parallel_late_fusion' ||
    config.executionStrategy === 'vision_only'
  ) {
    const allConditions = await clients.fetchSkinConditions(skinConditionsUrl);
    const allCaps = new Set<string>();
    allConditions.forEach((c) => {
      (c.visionCapabilities || []).forEach((cap) => allCaps.add(cap));
    });
    dispatchedCaps = Array.from(allCaps);
  }

  const visionDispatch = await clients.dispatchCapabilities({
    serviceUrl: config.vision.serviceUrl,
    timeoutMs: config.vision.timeoutMs,
    capabilities: dispatchedCaps,
    images: payload.images,
    apiKey: env.gatewayApiKey,
  });
  const visionSignals = visionDispatch.telemetry;

  timings['stage2_vision_ms'] = Date.now() - t1;

  // -------------------------------------------------------------
  // STAGE 3: SCORING (core-engine score engine, the configured ruleset)
  // -------------------------------------------------------------
  const t2 = Date.now();
  const pipelineNotes: string[] = [];
  if (Object.keys(visionSignals).length) {
    // The evaluate endpoint reads vision only from a photo it submits to the
    // ruleset's own vision provider; it takes no pre-computed readings.
    pipelineNotes.push(
      'PIPELINE: dispatched vision readings were not sent to the score engine; it reads vision only from a submitted photo.',
    );
  }
  const score = await clients.evaluateScore({
    url: config.scoring.serviceUrl,
    rulesetCode: config.scoring.rulesetCode,
    brandId: config.brandId,
    applicationId: config.applicationId,
    // vision_only scores from no form answers; the engine says if that leaves it nothing.
    answers: config.executionStrategy === 'vision_only' ? {} : answers,
    customerId: payload.customerId,
    dryRun: payload.dryRun,
    apiKey: env.gatewayApiKey,
    timeoutMs: config.scoring.timeoutMs,
  });
  timings['stage3_scoring_ms'] = Date.now() - t2;

  // -------------------------------------------------------------
  // STAGE 4: MATCH ENGINE & ROUTINE GENERATION
  // -------------------------------------------------------------
  const t3 = Date.now();
  const hasScores = Object.keys(score.dimensionScores).length > 0;
  // Routines come from the match engine, matched on the score engine's
  // result. Without scores there is nothing to match on, so it is not asked.
  const regimens = hasScores
    ? await clients.fetchRegimens({
        url: config.matching.serviceUrl,
        brandId: config.brandId,
        applicationId: config.applicationId,
        dimensionScores: score.dimensionScores,
        skinProfile: score.skinProfile,
        customerConditions: { ...score.customerConditions, ...payload.customerConditions },
        strategyId: config.matching.strategyId,
        timeoutMs: config.matching.timeoutMs,
      })
    : {
        amRoutine: [],
        pmRoutine: [],
        phases: {},
        warnings: [],
        error: 'Not requested: the score engine returned no scores to match on.',
      };

  timings['stage4_matching_ms'] = Date.now() - t3;
  timings['total_pipeline_ms'] = Date.now() - startTime;

  return {
    // Scored or not: a run whose scoring failed is not a success, whatever
    // the other stages did (each stage still carries its own error).
    success: !score.error,
    pipelineId: `pipe_run_${Date.now()}`,
    executionStrategy: config.executionStrategy,
    stages: {
      form: {
        answeredQuestions: Object.keys(answers),
        detectedConditions,
      },
      vision: {
        dispatchedCapabilities: dispatchedCaps,
        telemetrySignals: visionSignals,
        ...(Object.keys(visionDispatch.unavailable).length
          ? { unavailableCapabilities: visionDispatch.unavailable }
          : {}),
        ...(visionDispatch.missing.length ? { missingCapabilities: visionDispatch.missing } : {}),
        ...(visionDispatch.error ? { dispatchError: visionDispatch.error } : {}),
      },
      scoring: {
        ...(score.rulesetCode ? { rulesetCode: score.rulesetCode } : {}),
        fusedDimensionScores: score.dimensionScores,
        ...(score.skinProfile ? { skinProfile: score.skinProfile } : {}),
        ...(score.totalScore !== undefined ? { totalScore: score.totalScore } : {}),
        ...(Object.keys(score.breakdown).length ? { dimensionBreakdown: score.breakdown } : {}),
        ...(score.missingDimensions.length ? { missingDimensions: score.missingDimensions } : {}),
        ...(Object.keys(score.customerConditions).length ? { customerConditions: score.customerConditions } : {}),
        warnings: [...score.warnings, ...pipelineNotes],
        ...(score.error ? { scoreError: score.error } : {}),
      },
      matching: {
        amRoutine: regimens.amRoutine,
        pmRoutine: regimens.pmRoutine,
        contraindicationWarnings: regimens.warnings,
        ...(Object.keys(regimens.phases).length ? { phases: regimens.phases } : {}),
        ...(regimens.error ? { regimenError: regimens.error } : {}),
      },
    },
    timings,
  };
}
