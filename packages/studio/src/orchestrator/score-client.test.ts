import { afterEach, describe, expect, it, vi } from 'vitest';
import { evaluateScore } from './score-client';

const base = {
  url: 'http://score.test/core/score-engine/evaluate',
  rulesetCode: 'rs 1',
  brandId: 'b1',
  applicationId: 'a1',
  answers: { Q1: 'B' },
  timeoutMs: 50,
};

function mockFetch(status: number, body: unknown) {
  const fn = vi.fn().mockResolvedValue({ ok: status >= 200 && status < 300, status, json: async () => body });
  vi.stubGlobal('fetch', fn);
  return fn;
}

afterEach(() => vi.unstubAllGlobals());

// Shaped like EvaluateV2Response; values are test data.
const ENGINE = {
  success: true,
  code: 'rs_1_v2',
  total_score: 55.5,
  dimensions: {
    dim_a: { scored: true, final_score: 55.5, axis: 'O' },
    dim_b: { scored: false, final_score: null, axis: null, reason: 'no source arrived' },
  },
  dimension_breakdown: {
    dim_a: { scored: true, score: 55.5, contributions: { form: { score: 55.5, weight: 1 } }, missing: [] },
    dim_b: { scored: false, contributions: {}, missing: ['form'], reason: 'no source arrived' },
  },
  skin_profile: { code: 'O', name: 'Oily', description: 'from the ruleset', complete: false, axis_values: { DIM_A: 'O' } },
  customer_condition: { is_pregnant: false },
  warnings: ['dim_b: not scored (no source arrived)'],
};

describe('evaluateScore', () => {
  it('posts the raw answers as multipart to the ruleset code', async () => {
    const fn = mockFetch(200, ENGINE);
    await evaluateScore({ ...base, customerId: 'c1', dryRun: true, apiKey: 'k' });
    const [url, init] = fn.mock.calls[0];
    expect(url).toBe('http://score.test/core/score-engine/evaluate/rs%201');
    const body = init.body as FormData;
    expect(body.get('brand_id')).toBe('b1');
    expect(body.get('application_id')).toBe('a1');
    expect(body.get('customer_id')).toBe('c1');
    expect(JSON.parse(String(body.get('data')))).toEqual({ Q1: 'B' });
    expect(init.headers['X-Dry-Run']).toBe('true');
    expect(init.headers['x-api-key']).toBe('k');
  });

  it('sends no dry-run header, key or customer unless given', async () => {
    const fn = mockFetch(200, ENGINE);
    await evaluateScore(base);
    const init = fn.mock.calls[0][1];
    expect(init.headers).toEqual({});
    expect((init.body as FormData).has('customer_id')).toBe(false);
  });

  it("maps the engine's result without adding to it", async () => {
    mockFetch(200, ENGINE);
    const r = await evaluateScore(base);
    expect(r).toEqual({
      rulesetCode: 'rs_1_v2',
      dimensionScores: { dim_a: 55.5 },
      totalScore: 55.5,
      skinProfile: { code: 'O', name: 'Oily', description: 'from the ruleset', complete: false, axisValues: { DIM_A: 'O' } },
      breakdown: ENGINE.dimension_breakdown,
      missingDimensions: ['dim_b'],
      customerConditions: { is_pregnant: false },
      warnings: ['dim_b: not scored (no source arrived)'],
    });
  });

  it('reports no total when no axis dimension was scored, rather than its 0', async () => {
    mockFetch(200, { ...ENGINE, total_score: 0, dimensions: { dim_c: { scored: true, final_score: 40, axis: null } } });
    const r = await evaluateScore(base);
    expect(r.totalScore).toBeUndefined();
    expect(r.dimensionScores).toEqual({ dim_c: 40 });
  });

  it('carries the engine refusal, with every problem it listed', async () => {
    mockFetch(400, { errors: ['customer_id is required', 'Q1 is required'] });
    const r = await evaluateScore(base);
    expect(r.dimensionScores).toEqual({});
    expect(r.skinProfile).toBeUndefined();
    expect(r.totalScore).toBeUndefined();
    expect(r.error).toBe('Score engine answered HTTP 400: customer_id is required; Q1 is required');
  });

  it('returns no scores when the engine is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNREFUSED')));
    const r = await evaluateScore(base);
    expect(r.dimensionScores).toEqual({});
    expect(r.error).toContain('ECONNREFUSED');
  });

  it('says so when the engine scored nothing', async () => {
    mockFetch(200, { ...ENGINE, total_score: 0, dimensions: {}, skin_profile: { code: '' } });
    const r = await evaluateScore(base);
    expect(r.skinProfile).toBeUndefined();
    expect(r.error).toMatch(/no dimension/);
  });

  it('refuses without an engine or a ruleset', async () => {
    const fn = mockFetch(200, ENGINE);
    expect((await evaluateScore({ ...base, url: '' })).error).toMatch(/SCORE_ENGINE_URL/);
    expect((await evaluateScore({ ...base, rulesetCode: '' })).error).toMatch(/ruleset/);
    expect(fn).not.toHaveBeenCalled();
  });
});
