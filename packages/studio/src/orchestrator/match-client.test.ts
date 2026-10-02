import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchRegimens } from './match-client';

const base = {
  url: 'http://match.test/core/match-engine/evaluate',
  brandId: 'b1',
  applicationId: 'a1',
  dimensionScores: { sebum: 70 },
  timeoutMs: 50,
};

function mockFetch(status: number, body: unknown) {
  const fn = vi.fn().mockResolvedValue({ ok: status >= 200 && status < 300, status, json: async () => body });
  vi.stubGlobal('fetch', fn);
  return fn;
}

afterEach(() => vi.unstubAllGlobals());

describe('fetchRegimens', () => {
  it('maps the engine regimen onto routine steps', async () => {
    mockFetch(200, {
      success: true,
      regimens: {
        am_routine: [
          {
            step_number: 1,
            step_name: 'Cleanse',
            primary_product: { name: 'Real Cleanser', match_score: 88.5, why_selected: ['low comedogenicity', 'in catalogue'] },
          },
        ],
        pm_routine: [],
      },
      clinical_conflict_matrix: { warnings: ['retinoid + AHA on the same night'] },
    });

    const r = await fetchRegimens(base);
    expect(r.amRoutine).toEqual([
      { step: 'Cleanse', productName: 'Real Cleanser', matchScore: 88.5, reason: 'low comedogenicity; in catalogue' },
    ]);
    expect(r.warnings).toEqual(['retinoid + AHA on the same night']);
    expect(r.error).toBeUndefined();
  });

  it('sends the dimension scores the engine matches on', async () => {
    const fn = mockFetch(200, { regimens: {} });
    await fetchRegimens(base);
    const body = JSON.parse(fn.mock.calls[0][1].body);
    expect(body).toMatchObject({ brand_id: 'b1', application_id: 'a1', dimension_scores: { sebum: 70 } });
  });

  it('maps brand-defined phases, which the engine sends instead of AM/PM', async () => {
    mockFetch(200, {
      success: true,
      regimens: {
        phases: {
          morning_protection: [{ step_name: 'Shield', primary_product: { name: 'SPF 50', match_score: 90, why_selected: [] } }],
          night_restoration: null,
        },
      },
    });
    const r = await fetchRegimens(base);
    expect(Object.keys(r.phases)).toEqual(['morning_protection']);
    expect(r.phases.morning_protection[0].productName).toBe('SPF 50');
    expect(r.error).toBeUndefined();
  });

  it('says so when the engine answers with no regimen at all', async () => {
    mockFetch(200, { success: true, regimens: { phases: { morning_protection: null } } });
    const r = await fetchRegimens(base);
    expect(r.amRoutine).toEqual([]);
    expect(r.error).toMatch(/no regimen/i);
  });

  it('drops a step the engine returned without a product', async () => {
    mockFetch(200, { regimens: { am_routine: [{ step_name: 'Cleanse', primary_product: null }] } });
    expect((await fetchRegimens(base)).amRoutine).toEqual([]);
  });

  it('recommends nothing when the engine errors, and says why', async () => {
    mockFetch(500, {});
    const r = await fetchRegimens(base);
    expect(r.amRoutine).toEqual([]);
    expect(r.pmRoutine).toEqual([]);
    expect(r.error).toContain('500');
  });

  it('recommends nothing when the engine is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNREFUSED')));
    const r = await fetchRegimens(base);
    expect(r.amRoutine).toEqual([]);
    expect(r.error).toContain('ECONNREFUSED');
  });

  it('recommends nothing when no engine is configured', async () => {
    const r = await fetchRegimens({ ...base, url: '' });
    expect(r.error).toMatch(/MATCH_ENGINE_URL/);
  });
});
