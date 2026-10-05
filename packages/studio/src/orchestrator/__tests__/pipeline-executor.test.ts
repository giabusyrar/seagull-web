import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../capability-registry', () => ({
  resolveRequiredCapabilitiesFromDb: vi.fn(async () => ['cap_sebum']),
  fetchSkinConditionsFromDb: vi.fn(async () => [
    { visionCapabilities: ['cap_a', 'cap_b'] },
    { visionCapabilities: ['cap_b'] },
  ]),
}));
vi.mock('../pytorch-client', () => ({
  dispatchPyTorchCapabilities: vi.fn(async () => ({ telemetry: {}, unavailable: {}, missing: [] })),
}));
// Test data shaped like the score engine's answer; not a real ruleset's output.
const SCORED = {
  rulesetCode: 'rs_test',
  dimensionScores: { dim_a: 62.5 },
  totalScore: 62.5,
  skinProfile: { code: 'XY', name: 'Test Profile', complete: true },
  breakdown: { dim_a: { scored: true, score: 62.5, contributions: { form: { score: 62.5, weight: 1 } }, missing: [] } },
  missingDimensions: [],
  customerConditions: { cond_from_answers: true },
  warnings: ['engine warning'],
};
vi.mock('../score-client', () => ({
  DEFAULT_SCORE_ENGINE_PATH: '/core/score-engine/evaluate',
  evaluateScore: vi.fn(async () => SCORED),
}));
vi.mock('../match-client', () => ({
  DEFAULT_MATCH_ENGINE_PATH: '/core/match-engine/evaluate',
  fetchRegimens: vi.fn(async () => ({ amRoutine: [], pmRoutine: [], phases: {}, warnings: [] })),
}));

import { fetchSkinConditionsFromDb, resolveRequiredCapabilitiesFromDb } from '../capability-registry';
import { dispatchPyTorchCapabilities } from '../pytorch-client';
import { evaluateScore } from '../score-client';
import { fetchRegimens } from '../match-client';
import { executeAssessmentPipeline, PipelineInputError } from '../pipeline-executor';
import { DEFAULT_PIPELINE_SETTINGS } from '../pipeline-defaults';

const ENV_KEYS = ['MATCH_ENGINE_URL', 'SCORE_ENGINE_URL', 'GATEWAY_API_KEY'] as const;
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

const basePayload = { brandId: 'b', applicationId: 'a', rulesetCode: 'rs', answers: {}, baseUrl: 'http://app' };
// The host route the pipeline calls back into; resolved against baseUrl.
const routes = { skinConditions: '/api/skin-conditions' };

describe('executeAssessmentPipeline: what it will not guess', () => {
  it.each([
    ['brandId', { brandId: '' }],
    ['applicationId', { applicationId: '' }],
    ['rulesetCode', { rulesetCode: undefined }],
  ])('refuses to run without %s', async (name, patch) => {
    const run = executeAssessmentPipeline({ ...basePayload, ...patch }, { routes });
    await expect(run).rejects.toBeInstanceOf(PipelineInputError);
    await expect(run).rejects.toMatchObject({ missing: [name] });
    expect(evaluateScore).not.toHaveBeenCalled();
    expect(fetchRegimens).not.toHaveBeenCalled();
  });

  it('takes the tenant and ruleset from a configOverride', async () => {
    await executeAssessmentPipeline(
      {
        ...basePayload,
        brandId: '',
        applicationId: '',
        rulesetCode: undefined,
        configOverride: { brandId: 'ob', applicationId: 'oa', scoring: { rulesetCode: 'ors' } },
      },
      { routes },
    );
    expect(evaluateScore).toHaveBeenCalledWith(
      expect.objectContaining({ brandId: 'ob', applicationId: 'oa', rulesetCode: 'ors' }),
    );
  });
});

describe('executeAssessmentPipeline: scoring is core-engine', () => {
  it('sends the raw answers to the score engine for the named ruleset', async () => {
    const answers = { Q1: 'B', Q2: ['A', 'C'] };
    await executeAssessmentPipeline(
      { ...basePayload, answers, customerId: 'c1', dryRun: true },
      { routes },
    );
    expect(evaluateScore).toHaveBeenCalledWith({
      url: 'http://app/core/score-engine/evaluate',
      rulesetCode: 'rs',
      brandId: 'b',
      applicationId: 'a',
      answers,
      customerId: 'c1',
      dryRun: true,
      apiKey: undefined,
      timeoutMs: DEFAULT_PIPELINE_SETTINGS.scoring.timeoutMs,
    });
  });

  it('invents no dimension from a skin_type answer', async () => {
    const res = await executeAssessmentPipeline(
      { ...basePayload, answers: { skin_type: 'oily' } },
      { routes },
    );
    expect(res.stages.form).toEqual({ answeredQuestions: ['skin_type'], detectedConditions: [] });
    expect(resolveRequiredCapabilitiesFromDb).toHaveBeenCalledWith([], 'http://app/api/skin-conditions');
  });

  it("reports the engine's result as the scoring stage", async () => {
    const res = await executeAssessmentPipeline(basePayload, { routes });
    expect(res.stages.scoring).toEqual({
      rulesetCode: 'rs_test',
      fusedDimensionScores: { dim_a: 62.5 },
      skinProfile: { code: 'XY', name: 'Test Profile', complete: true },
      totalScore: 62.5,
      dimensionBreakdown: SCORED.breakdown,
      customerConditions: { cond_from_answers: true },
      warnings: ['engine warning'],
    });
  });

  it("matches on the engine's scores and profile, with its conditions plus the caller's", async () => {
    await executeAssessmentPipeline(
      { ...basePayload, customerConditions: { caller_flag: true } },
      { routes },
    );
    expect(fetchRegimens).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://app/core/match-engine/evaluate',
        brandId: 'b',
        applicationId: 'a',
        dimensionScores: { dim_a: 62.5 },
        skinProfile: SCORED.skinProfile,
        customerConditions: { cond_from_answers: true, caller_flag: true },
        timeoutMs: DEFAULT_PIPELINE_SETTINGS.matching.timeoutMs,
      }),
    );
  });

  it('returns no scores and no regimen when the engine cannot score, and says why', async () => {
    vi.mocked(evaluateScore).mockResolvedValueOnce({
      dimensionScores: {},
      breakdown: {},
      missingDimensions: [],
      customerConditions: {},
      warnings: [],
      error: 'Score engine could not be reached: ECONNREFUSED',
    });
    const res = await executeAssessmentPipeline(basePayload, { routes });
    expect(res.stages.scoring).toEqual({
      fusedDimensionScores: {},
      warnings: [],
      scoreError: 'Score engine could not be reached: ECONNREFUSED',
    });
    expect(res.stages.scoring.totalScore).toBeUndefined();
    expect(res.stages.scoring.skinProfile).toBeUndefined();
    expect(fetchRegimens).not.toHaveBeenCalled();
    expect(res.stages.matching.regimenError).toMatch(/no scores/);
  });

  it('says so when dispatched vision readings were not passed to the engine', async () => {
    vi.mocked(dispatchPyTorchCapabilities).mockResolvedValueOnce({
      telemetry: { cap_sebum: 70 },
      unavailable: {},
      missing: [],
    });
    const res = await executeAssessmentPipeline(basePayload, { routes });
    expect(res.stages.vision.telemetrySignals).toEqual({ cap_sebum: 70 });
    expect(res.stages.scoring.warnings.some((w) => w.startsWith('PIPELINE:'))).toBe(true);
  });

  it('sends no answers for vision_only', async () => {
    await executeAssessmentPipeline(
      { ...basePayload, answers: { Q1: 'A' }, configOverride: { executionStrategy: 'vision_only' } },
      { routes },
    );
    expect(evaluateScore).toHaveBeenCalledWith(expect.objectContaining({ answers: {} }));
  });
});

describe('executeAssessmentPipeline: services and dispatch', () => {
  it('uses the app origin when no engine URL is configured', async () => {
    await executeAssessmentPipeline(basePayload, { routes });
    // No dispatch service by default: the model registry was retired.
    expect(dispatchPyTorchCapabilities).toHaveBeenCalledWith(
      expect.objectContaining({ serviceUrl: '', timeoutMs: DEFAULT_PIPELINE_SETTINGS.vision.timeoutMs, apiKey: undefined }),
    );
  });

  it('reads service URLs and the API key from the environment', async () => {
    process.env.MATCH_ENGINE_URL = 'http://match';
    process.env.SCORE_ENGINE_URL = 'http://score';
    process.env.GATEWAY_API_KEY = 'k';
    await executeAssessmentPipeline(basePayload, { routes });
    expect(dispatchPyTorchCapabilities).toHaveBeenCalledWith(expect.objectContaining({ apiKey: 'k' }));
    expect(evaluateScore).toHaveBeenCalledWith(
      expect.objectContaining({ url: 'http://score/core/score-engine/evaluate', apiKey: 'k' }),
    );
    expect(fetchRegimens).toHaveBeenCalledWith(
      expect.objectContaining({ url: 'http://match/core/match-engine/evaluate' }),
    );
  });

  it('dispatches the capabilities of the conditions the caller named', async () => {
    await executeAssessmentPipeline({ ...basePayload, concerns: ['cond_x'] }, { routes });
    expect(resolveRequiredCapabilitiesFromDb).toHaveBeenCalledWith(['cond_x'], 'http://app/api/skin-conditions');
  });

  it('dispatches every known capability for parallel late fusion', async () => {
    const res = await executeAssessmentPipeline(
      { ...basePayload, configOverride: { executionStrategy: 'parallel_late_fusion' } },
      { routes },
    );
    expect(fetchSkinConditionsFromDb).toHaveBeenCalledWith('http://app/api/skin-conditions');
    expect(res.stages.vision.dispatchedCapabilities).toEqual(['cap_a', 'cap_b']);
  });

  it('lets a configOverride replace part of a section', async () => {
    await executeAssessmentPipeline(
      { ...basePayload, configOverride: { matching: { serviceUrl: 'http://override', timeoutMs: 1 } } },
      { routes },
    );
    expect(fetchRegimens).toHaveBeenCalledWith(expect.objectContaining({ url: 'http://override', timeoutMs: 1 }));
  });
});

describe('executeAssessmentPipeline (injected dependencies)', () => {
  it('uses injected env instead of process.env', async () => {
    process.env.MATCH_ENGINE_URL = 'http://from-process';
    await executeAssessmentPipeline(basePayload, {
      routes,
      env: { matchEngineUrl: 'http://m', scoreEngineUrl: 'http://s', gatewayApiKey: 'x' },
    });
    expect(dispatchPyTorchCapabilities).toHaveBeenCalledWith(expect.objectContaining({ apiKey: 'x' }));
    expect(evaluateScore).toHaveBeenCalledWith(expect.objectContaining({ url: 'http://s/core/score-engine/evaluate' }));
    expect(fetchRegimens).toHaveBeenCalledWith(expect.objectContaining({ url: 'http://m/core/match-engine/evaluate' }));
  });

  it('uses injected defaults where the payload is silent', async () => {
    await executeAssessmentPipeline(basePayload, {
      routes,
      defaults: { ...DEFAULT_PIPELINE_SETTINGS, scoring: { timeoutMs: 7 } },
    });
    expect(evaluateScore).toHaveBeenCalledWith(expect.objectContaining({ timeoutMs: 7 }));
  });

  it('calls injected clients instead of the HTTP ones', async () => {
    const fetchRegimensFake = vi.fn(async () => ({ amRoutine: [], pmRoutine: [], phases: {}, warnings: ['w'] }));
    const res = await executeAssessmentPipeline(basePayload, {
      routes,
      clients: {
        resolveRequiredCapabilities: async () => [],
        dispatchCapabilities: async () => ({ telemetry: {}, unavailable: {}, missing: [] }),
        evaluateScore: async () => SCORED,
        fetchRegimens: fetchRegimensFake,
      },
    });
    expect(resolveRequiredCapabilitiesFromDb).not.toHaveBeenCalled();
    expect(dispatchPyTorchCapabilities).not.toHaveBeenCalled();
    expect(evaluateScore).not.toHaveBeenCalled();
    expect(fetchRegimens).not.toHaveBeenCalled();
    expect(res.stages.matching.contraindicationWarnings).toEqual(['w']);
  });
});
