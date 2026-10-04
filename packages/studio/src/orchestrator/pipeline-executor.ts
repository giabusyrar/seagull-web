import type { HostRoutes } from '@gateway-experience/shared';
import { AssessmentPayload, UnifiedAssessmentResponse, OrchestratorPipelineConfig } from './types';
import { resolveRequiredCapabilitiesFromDb, fetchSkinConditionsFromDb } from './capability-registry';
import { dispatchPyTorchCapabilities } from './pytorch-client';
import { fuseDimensionScores } from './score-fusion';
import { fetchRegimens, DEFAULT_MATCH_ENGINE_PATH } from './match-client';
import {
  DEFAULT_MODEL_SERVER_URL,
  DEFAULT_PIPELINE_SETTINGS,
  MODEL_DISPATCH_PATH,
  type PipelineSettings,
} from './pipeline-defaults';

/** Deployment values the pipeline reads from its environment. */
export interface PipelineEnv {
  /** worker-models origin; DEFAULT_MODEL_SERVER_URL when absent. */
  modelServerUrl?: string;
  /** Match engine origin; when absent the payload's baseUrl is used. */
  matchEngineUrl?: string;
  /** Sent to the model server. Server-side only. */
  gatewayApiKey?: string;
}

/**
 * The environment as `process.env` has it. In a browser bundle process.env is
 * empty, so the API key is simply absent there rather than shipped to one.
 */
export function pipelineEnvFromProcess(): PipelineEnv {
  return {
    modelServerUrl: process.env.MODEL_SERVER_URL,
    matchEngineUrl: process.env.MATCH_ENGINE_URL,
    gatewayApiKey: process.env.GATEWAY_API_KEY,
  };
}

/** The services each pipeline stage calls. */
export interface PipelineClients {
  resolveRequiredCapabilities: typeof resolveRequiredCapabilitiesFromDb;
  fetchSkinConditions: typeof fetchSkinConditionsFromDb;
  dispatchCapabilities: typeof dispatchPyTorchCapabilities;
  fuseScores: typeof fuseDimensionScores;
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

const defaultClients = (): PipelineClients => ({
  resolveRequiredCapabilities: resolveRequiredCapabilitiesFromDb,
  fetchSkinConditions: fetchSkinConditionsFromDb,
  dispatchCapabilities: dispatchPyTorchCapabilities,
  fuseScores: fuseDimensionScores,
  fetchRegimens,
});

/** The effective config: settings, plus service URLs from env, under the payload's override. */
export function resolvePipelineConfig(
  payload: AssessmentPayload,
  settings: PipelineSettings,
  env: PipelineEnv,
): OrchestratorPipelineConfig {
  return {
    ...settings,
    brandId: payload.brandId || settings.brandId,
    applicationId: payload.applicationId || settings.applicationId,
    executionStrategy: payload.configOverride?.executionStrategy || settings.executionStrategy,
    vision: {
      ...settings.vision,
      serviceUrl:
        payload.configOverride?.vision?.serviceUrl ||
        `${env.modelServerUrl || DEFAULT_MODEL_SERVER_URL}${MODEL_DISPATCH_PATH}`,
    },
    matching: {
      ...settings.matching,
      // The match engine origin when the pipeline runs on a server; otherwise
      // the app's own path, which the dashboard proxies to the gateway.
      serviceUrl: env.matchEngineUrl
        ? `${env.matchEngineUrl}${DEFAULT_MATCH_ENGINE_PATH}`
        : `${payload.baseUrl || ''}${DEFAULT_MATCH_ENGINE_PATH}`,
    },
    ...(payload.configOverride || {}),
  };
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
  // STAGE 1: FORM PARSING & CONCERN EXTRACTION
  // -------------------------------------------------------------
  const t0 = Date.now();
  const extractedDimensions: Record<string, number> = {};
  const detectedConditions: string[] = [];

  const answers = payload.answers || {};
  if (Array.isArray(answers.concerns)) {
    detectedConditions.push(...answers.concerns);
  }
  if (answers.skin_type) {
    if (answers.skin_type === 'oily') {
      detectedConditions.push('concern_oiliness');
      extractedDimensions['sebum'] = 75;
    } else if (answers.skin_type === 'dry') {
      detectedConditions.push('concern_dryness');
      extractedDimensions['hydration'] = 35;
    } else if (answers.skin_type === 'sensitive') {
      detectedConditions.push('concern_redness');
      extractedDimensions['sensitivity'] = 75;
    } else if (answers.skin_type === 'combination') {
      detectedConditions.push('concern_oiliness');
      extractedDimensions['sebum'] = 60;
      extractedDimensions['hydration'] = 50;
    }
  }

  for (const [ansKey, dimKey] of Object.entries(config.form.dimensionMappingRules)) {
    if (typeof answers[ansKey] === 'number') {
      extractedDimensions[dimKey] = answers[ansKey];
    }
  }

  timings['stage1_form_ms'] = Date.now() - t0;

  // -------------------------------------------------------------
  // STAGE 2: DYNAMIC PYTORCH CAPABILITY DISPATCH
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
  // STAGE 3: SCORE FUSION & DECISION MODEL
  // -------------------------------------------------------------
  const t2 = Date.now();
  const fusedScores = clients.fuseScores(
    config.executionStrategy === 'vision_only' ? {} : extractedDimensions,
    config.executionStrategy === 'form_only' ? {} : visionSignals,
    config.scoring.dimensionFusionWeights
  );

  // The four dimensions the Baumann code is built from. A dimension with no
  // score used to fall back to a fixed number (50 / 40 / 35 / 30), which
  // decided a letter of the code on no evidence at all. Missing is now
  // missing: the code is only computed when all four were scored.
  const CODE_DIMENSIONS = ['sebum', 'sensitivity', 'pigmentation', 'aging'] as const;
  const missingDimensions = CODE_DIMENSIONS.filter((d) => typeof fusedScores[d] !== 'number');
  const indeterminate = missingDimensions.length > 0;

  const sebumScore = fusedScores.sebum;
  const sensScore = fusedScores.sensitivity;
  const pigScore = fusedScores.pigmentation;
  const agingScore = fusedScores.aging;

  // Determine Baumann 4-letter Code: [O/D]-[S/R]-[P/N]-[W/T]
  const o_d = sebumScore !== undefined && sebumScore >= 55 ? 'O' : 'D';
  const s_r = sensScore !== undefined && sensScore >= 50 ? 'S' : 'R';
  const p_n = pigScore !== undefined && pigScore >= 50 ? 'P' : 'N';
  const w_t = agingScore !== undefined && agingScore >= 45 ? 'W' : 'T';
  const profileCode = indeterminate ? '' : `${o_d}${s_r}${p_n}${w_t}`;

  const profileNames: Record<string, string> = {
    OSNW: 'Oily Sensitive Non-Pigmented Wrinkle-Prone',
    OSNT: 'Oily Sensitive Non-Pigmented Tight',
    OSPW: 'Oily Sensitive Pigmented Wrinkle-Prone',
    OSPT: 'Oily Sensitive Pigmented Tight',
    ORNW: 'Oily Resistant Non-Pigmented Wrinkle-Prone',
    ORNT: 'Oily Resistant Non-Pigmented Tight',
    DSNW: 'Dry Sensitive Non-Pigmented Wrinkle-Prone',
    DSNT: 'Dry Sensitive Non-Pigmented Tight',
    DSPW: 'Dry Sensitive Pigmented Wrinkle-Prone',
    DSPT: 'Dry Sensitive Pigmented Tight',
    DRNW: 'Dry Resistant Non-Pigmented Wrinkle-Prone',
    DRNT: 'Dry Resistant Non-Pigmented Tight',
  };

  const skinProfile = indeterminate
    ? {
        code: '',
        name: 'Indeterminate',
        indeterminate: true,
        description: `No profile: ${missingDimensions.join(', ')} ${
          missingDimensions.length === 1 ? 'was' : 'were'
        } not scored by the form or the model server.`,
      }
    : {
        code: profileCode,
        name: profileNames[profileCode] || `Diagnostic Profile ${profileCode}`,
        category: o_d === 'O' ? 'Lipid Imbalanced' : 'Alipidic / Barrier Compromised',
        description: `Clinical diagnosis reflects ${o_d === 'O' ? 'elevated sebum shine' : 'reduced barrier moisture'} blended with ${s_r === 'S' ? 'reactive sensitivity' : 'resilient resistance'}.`,
      };

  // A tier is graded only for a dimension that was scored; an unscored one is
  // left out rather than graded against a stand-in.
  const severityTiers: Record<string, { gradeName: string; severity: string }> = {};
  if (sebumScore !== undefined) {
    severityTiers.sebum = {
      gradeName: sebumScore >= 70 ? 'High Shine / Hyper-Seborrhea' : sebumScore >= 40 ? 'Balanced Lipid' : 'Dry / Alipidic',
      severity: sebumScore >= 70 ? 'severe' : sebumScore >= 50 ? 'moderate' : 'optimal',
    };
  }
  if (sensScore !== undefined) {
    severityTiers.sensitivity = {
      gradeName: sensScore >= 65 ? 'Reactive Erythema' : 'Tolerant Resilient',
      severity: sensScore >= 65 ? 'severe' : 'optimal',
    };
  }
  if (pigScore !== undefined) {
    severityTiers.pigmentation = {
      gradeName: pigScore >= 60 ? 'Localized Melasma' : 'Uniform Tone',
      severity: pigScore >= 60 ? 'moderate' : 'optimal',
    };
  }

  // Averaged over the dimensions that were actually scored. Averaging a
  // stand-in 50 into the total was how an unmeasured dimension still moved
  // the number.
  const scoredValues = CODE_DIMENSIONS.map((d) => fusedScores[d]).filter(
    (v): v is number => typeof v === 'number',
  );
  const totalScore = scoredValues.length
    ? Math.round(scoredValues.reduce((a, b) => a + b, 0) / scoredValues.length)
    : 0;

  timings['stage3_scoring_ms'] = Date.now() - t2;

  // -------------------------------------------------------------
  // STAGE 4: MATCH ENGINE & ROUTINE GENERATION
  // -------------------------------------------------------------
  const t3 = Date.now();
  const isPregnant = payload.customerConditions?.is_pregnant ?? false;
  const usesRetinol = payload.customerConditions?.uses_retinol ?? false;
  const contraindicationWarnings: string[] = [];

  if (isPregnant) {
    contraindicationWarnings.push('Pregnancy safety constraint active: Retinoids, Salicylic Acid (>2%), and Hydroquinone excluded.');
  }
  if (usesRetinol) {
    contraindicationWarnings.push('Active retinoid user: High-concentration AHA/BHA exfoliants slotted exclusively for alternate night PM use.');
  }

  // Routines come from the match engine. They used to be literals in this
  // file — fixed product names and fixed scores dressed as engine output —
  // which meant the dashboard showed recommendations no catalogue had made.
  const regimens = await clients.fetchRegimens({
    url: config.matching.serviceUrl,
    brandId: config.brandId,
    applicationId: config.applicationId,
    dimensionScores: fusedScores,
    customerConditions: payload.customerConditions,
    timeoutMs: config.matching.timeoutMs,
  });
  const amRoutine = regimens.amRoutine;
  const pmRoutine = regimens.pmRoutine;
  contraindicationWarnings.push(...regimens.warnings);

  timings['stage4_matching_ms'] = Date.now() - t3;
  timings['total_pipeline_ms'] = Date.now() - startTime;

  return {
    success: true,
    pipelineId: `pipe_run_${Date.now()}`,
    executionStrategy: config.executionStrategy,
    stages: {
      form: {
        extractedDimensions,
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
        fusedDimensionScores: fusedScores,
        skinProfile,
        severityTiers,
        totalScore,
        ...(missingDimensions.length ? { missingDimensions: [...missingDimensions] } : {}),
      },
      matching: {
        amRoutine,
        pmRoutine,
        contraindicationWarnings,
        ...(Object.keys(regimens.phases).length ? { phases: regimens.phases } : {}),
        ...(regimens.error ? { regimenError: regimens.error } : {}),
      },
    },
    timings,
  };
}
