import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../capability-registry', () => ({
  resolveRequiredCapabilitiesFromDb: vi.fn(async () => ['cap_sebum']),
  fetchSkinConditionsFromDb: vi.fn(async () => [
    { visionCapabilities: ['cap_a', 'cap_b'] },
    { visionCapabilities: ['cap_b'] },
  ]),
}));
vi.mock('../pytorch-client', () => ({
  dispatchPyTorchCapabilities: vi.fn(async () => ({
    telemetry: { sensitivity: 60, pigmentation: 40, aging: 50 },
    unavailable: {},
    missing: [],
  })),
}));
vi.mock('../match-client', () => ({
  DEFAULT_MATCH_ENGINE_PATH: '/core/match-engine/evaluate',
  fetchRegimens: vi.fn(async () => ({ amRoutine: [], pmRoutine: [], phases: {}, warnings: [] })),
}));

import { fetchSkinConditionsFromDb, resolveRequiredCapabilitiesFromDb } from '../capability-registry';
import { dispatchPyTorchCapabilities } from '../pytorch-client';
import { fetchRegimens } from '../match-client';
import { executeAssessmentPipeline } from '../pipeline-executor';
import { DEFAULT_PIPELINE_SETTINGS } from '../pipeline-defaults';

const ENV_KEYS = ['MODEL_SERVER_URL', 'MATCH_ENGINE_URL', 'GATEWAY_API_KEY'] as const;
const savedEnv: Record<string, string | undefined> = {};

beforeEach(() => {
  vi.clearAllMocks();
  for (const k of ENV_KEYS) {
    savedEnv[k] = process.env[k];
    delete process.env[k];
  }
});
afterEach(() => {
  for (const k of ENV_KEYS) {
    if (savedEnv[k] === undefined) delete process.env[k];
    else process.env[k] = savedEnv[k];
  }
});

const basePayload = { brandId: '', applicationId: '', answers: {}, baseUrl: 'http://app' };

describe('executeAssessmentPipeline (default config)', () => {
  it('falls back to the default brand, application and service URLs', async () => {
    await executeAssessmentPipeline(basePayload);
    expect(dispatchPyTorchCapabilities).toHaveBeenCalledWith(
      expect.objectContaining({
        serviceUrl: 'http://127.0.0.1:8096/api/v1/models/dispatch-capabilities',
        timeoutMs: 3000,
        apiKey: undefined,
      }),
    );
    expect(fetchRegimens).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://app/core/match-engine/evaluate',
        brandId: 'brand_wardah',
        applicationId: 'app_kiosk',
        timeoutMs: 5000,
      }),
    );
  });

  it('reads service URLs and the API key from the environment', async () => {
    process.env.MODEL_SERVER_URL = 'http://models';
    process.env.MATCH_ENGINE_URL = 'http://match';
    process.env.GATEWAY_API_KEY = 'k';
    await executeAssessmentPipeline({ ...basePayload, brandId: 'b', applicationId: 'a' });
    expect(dispatchPyTorchCapabilities).toHaveBeenCalledWith(
      expect.objectContaining({ serviceUrl: 'http://models/api/v1/models/dispatch-capabilities', apiKey: 'k' }),
    );
    expect(fetchRegimens).toHaveBeenCalledWith(
      expect.objectContaining({ url: 'http://match/core/match-engine/evaluate', brandId: 'b', applicationId: 'a' }),
    );
  });

  it('maps answers to dimensions and fuses them with the default weights', async () => {
    const res = await executeAssessmentPipeline({
      ...basePayload,
      answers: { skin_type: 'oily', concerns: ['concern_acne'], q_sensitivity: 20 },
    });
    expect(resolveRequiredCapabilitiesFromDb).toHaveBeenCalledWith(['concern_acne', 'concern_oiliness'], 'http://app');
    expect(res.stages.form.extractedDimensions).toEqual({ sebum: 75, sensitivity: 20 });
    // sebum: form only. sensitivity: 0.6*20 + 0.4*60 = 36.
    expect(res.stages.scoring.fusedDimensionScores).toMatchObject({ sebum: 75, sensitivity: 36, pigmentation: 40, aging: 50 });
    expect(res.stages.scoring.skinProfile.code).toBe('ORNW');
    expect(res.stages.scoring.totalScore).toBe(50);
  });

  it('dispatches every known capability for parallel late fusion', async () => {
    const res = await executeAssessmentPipeline({
      ...basePayload,
      configOverride: { executionStrategy: 'parallel_late_fusion' },
    });
    expect(fetchSkinConditionsFromDb).toHaveBeenCalledWith('http://app');
    expect(res.stages.vision.dispatchedCapabilities).toEqual(['cap_a', 'cap_b']);
  });

  it('lets a configOverride replace a whole section', async () => {
    await executeAssessmentPipeline({
      ...basePayload,
      configOverride: {
        matching: {
          serviceUrl: 'http://override',
          timeoutMs: 1,
          minEfficacyScore: 0,
          strictContraindications: false,
          maxAmRoutineSteps: 1,
          maxPmRoutineSteps: 1,
        },
      },
    });
    expect(fetchRegimens).toHaveBeenCalledWith(expect.objectContaining({ url: 'http://override', timeoutMs: 1 }));
  });
});

describe('executeAssessmentPipeline (injected dependencies)', () => {
  it('uses injected env instead of process.env', async () => {
    process.env.MODEL_SERVER_URL = 'http://from-process';
    await executeAssessmentPipeline(basePayload, {
      env: { modelServerUrl: 'http://injected', matchEngineUrl: 'http://m', gatewayApiKey: 'x' },
    });
    expect(dispatchPyTorchCapabilities).toHaveBeenCalledWith(
      expect.objectContaining({ serviceUrl: 'http://injected/api/v1/models/dispatch-capabilities', apiKey: 'x' }),
    );
    expect(fetchRegimens).toHaveBeenCalledWith(expect.objectContaining({ url: 'http://m/core/match-engine/evaluate' }));
  });

  it('uses injected defaults where the payload is silent', async () => {
    const res = await executeAssessmentPipeline(
      { ...basePayload, answers: { q_sensitivity: 20 } },
      {
        defaults: {
          ...DEFAULT_PIPELINE_SETTINGS,
          brandId: 'brand_x',
          scoring: { rulesetCode: 'r', dimensionFusionWeights: { sensitivity: { formWeight: 1, visionWeight: 0 } } },
        },
      },
    );
    expect(fetchRegimens).toHaveBeenCalledWith(expect.objectContaining({ brandId: 'brand_x', applicationId: 'app_kiosk' }));
    expect(res.stages.scoring.fusedDimensionScores.sensitivity).toBe(20);
  });

  it('calls injected clients instead of the HTTP ones', async () => {
    const fetchRegimensFake = vi.fn(async () => ({ amRoutine: [], pmRoutine: [], phases: {}, warnings: ['w'] }));
    const res = await executeAssessmentPipeline(basePayload, {
      clients: {
        resolveRequiredCapabilities: async () => [],
        dispatchCapabilities: async () => ({ telemetry: {}, unavailable: {}, missing: [] }),
        fetchRegimens: fetchRegimensFake,
      },
    });
    expect(resolveRequiredCapabilitiesFromDb).not.toHaveBeenCalled();
    expect(dispatchPyTorchCapabilities).not.toHaveBeenCalled();
    expect(fetchRegimens).not.toHaveBeenCalled();
    expect(res.stages.matching.contraindicationWarnings).toEqual(['w']);
  });
});
