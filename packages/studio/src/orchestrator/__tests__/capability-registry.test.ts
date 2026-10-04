import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  resolveRequiredCapabilities,
  invalidateSkinConditionCache,
  type DbSkinConditionRecord,
} from '../capability-registry';

// The registry has no built-in mapping: capabilities come only from the
// skin_conditions records the endpoint returns. These fixtures stand in for
// that endpoint; the codes are test data, not a catalog.
const RECORDS: DbSkinConditionRecord[] = [
  {
    id: 'sc-1',
    code: 'concern_oiliness',
    name: 'Oiliness',
    dimensionCode: 'sebum',
    visionCapabilities: ['sebum_shine_detector'],
    triggerKeys: ['skin_shine'],
  },
  {
    id: 'sc-2',
    code: 'concern_acne',
    name: 'Acne',
    dimensionCode: 'acne',
    visionCapabilities: ['comedone_pore_detector'],
    triggerKeys: [],
  },
];

const BASE_URL = 'http://registry.test';
const SKIN_CONDITIONS_URL = `${BASE_URL}/api/skin-conditions`;

function mockEndpoint(response: Response | Error) {
  const fetchMock = vi.fn(async () => {
    if (response instanceof Error) throw response;
    return response;
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

describe('CapabilityRegistry', () => {
  beforeEach(() => {
    invalidateSkinConditionCache();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('maps a condition code to its capabilities', async () => {
    const fetchMock = mockEndpoint(json({ items: RECORDS }));
    const caps = await resolveRequiredCapabilities(['concern_acne'], SKIN_CONDITIONS_URL);
    expect(caps).toEqual(['comedone_pore_detector']);
    expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/api/skin-conditions`, expect.anything());
  });

  it('matches through trigger keys and de-duplicates capabilities', async () => {
    mockEndpoint(json({ items: RECORDS }));
    const caps = await resolveRequiredCapabilities(['concern_oiliness', 'skin_shine'], SKIN_CONDITIONS_URL);
    expect(caps).toEqual(['sebum_shine_detector']);
  });

  it('returns nothing for an unrecognized condition', async () => {
    mockEndpoint(json({ items: RECORDS }));
    expect(await resolveRequiredCapabilities(['unknown_item'], SKIN_CONDITIONS_URL)).toEqual([]);
  });

  it('returns nothing, rather than a fallback mapping, when the endpoint is unreachable', async () => {
    mockEndpoint(new TypeError('network down'));
    expect(await resolveRequiredCapabilities(['concern_acne'], SKIN_CONDITIONS_URL)).toEqual([]);
  });

  it('returns nothing when the endpoint answers with an error status', async () => {
    mockEndpoint(json({ error: 'boom' }, 500));
    expect(await resolveRequiredCapabilities(['concern_acne'], SKIN_CONDITIONS_URL)).toEqual([]);
  });

  it('serves repeat lookups from the cache', async () => {
    const fetchMock = mockEndpoint(json({ items: RECORDS }));
    await resolveRequiredCapabilities(['concern_acne'], SKIN_CONDITIONS_URL);
    await resolveRequiredCapabilities(['concern_oiliness'], SKIN_CONDITIONS_URL);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
