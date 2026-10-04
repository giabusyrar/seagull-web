import { afterEach, describe, expect, it, vi } from 'vitest';
import { deleteRuleset, fetchTenantSurveys, listRulesets, saveRuleset, simulateRuleset, surveyList } from './api';

const respond = (body: unknown, status = 200) => {
  const f = vi.fn<typeof fetch>(async () => new Response(JSON.stringify(body), { status }));
  vi.stubGlobal('fetch', f);
  return f;
};
afterEach(() => vi.unstubAllGlobals());

describe('score api', () => {
  it('lists every tenant’s rulesets', async () => {
    const f = respond({ rulesets: [{ id: 'r' }] });
    expect(await listRulesets()).toEqual([{ id: 'r' }]);
    expect(f).toHaveBeenCalledWith('/core/score-engine/rulesets?brand_id=*&application_id=*');
  });

  it('creates without an id and updates with one', async () => {
    const f = respond({});
    await saveRuleset({ code: 'c' });
    await saveRuleset({ id: 'r1', code: 'c' });
    expect(f.mock.calls.map(([u, i]) => [u, i?.method])).toEqual([
      ['/core/score-engine/rulesets', 'POST'],
      ['/core/score-engine/rulesets/r1', 'PUT'],
    ]);
  });

  it('throws the engine error, or a fallback', async () => {
    respond({ error: 'code taken' }, 409);
    await expect(saveRuleset({})).rejects.toThrow('code taken');
    respond({}, 500);
    await expect(deleteRuleset('r1')).rejects.toThrow('Failed to delete ruleset');
  });

  it('simulates, returning null on an error status', async () => {
    respond({ result: {} });
    expect(await simulateRuleset({ schema: '{}', form_scores: {}, vision_scores: {}, customer_condition: {} })).toEqual({ result: {} });
    respond({}, 400);
    expect(await simulateRuleset({ schema: '{}', form_scores: {}, vision_scores: {}, customer_condition: {} })).toBeNull();
  });

  it('fetches tenant surveys, null on an error status', async () => {
    const f = respond([{ code: 's' }]);
    expect(await fetchTenantSurveys('b 1', 'a')).toEqual([{ code: 's' }]);
    expect(f).toHaveBeenCalledWith('/core/form-engine/survey?brand_id=b%201&application_id=a');
    respond({}, 404);
    expect(await fetchTenantSurveys('b', 'a')).toBeNull();
  });

  it('reads any survey response shape as a list', () => {
    expect(surveyList([{ code: 'a' }])).toEqual([{ code: 'a' }]);
    expect(surveyList({ surveys: [{ code: 'b' }] })).toEqual([{ code: 'b' }]);
    expect(surveyList({ code: 'c' })).toEqual([{ code: 'c' }]);
    expect(surveyList(null)).toEqual([]);
  });
});
