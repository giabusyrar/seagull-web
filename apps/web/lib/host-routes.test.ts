import { afterEach, describe, expect, it, vi } from 'vitest';
import { referenceDataSource } from './host-routes';

afterEach(() => vi.unstubAllGlobals());

describe('referenceDataSource', () => {
  it('reads the same routes the shared selects used to fetch', async () => {
    const f = vi.fn<typeof fetch>(async () => new Response('{"data":[]}'));
    vi.stubGlobal('fetch', f);
    expect(await referenceDataSource.brands()).toEqual({ data: [] });
    await referenceDataSource.applications();
    await referenceDataSource.dimensions();
    expect(f.mock.calls.map((c) => c[0])).toEqual(['/api/brands', '/api/applications', '/api/dimensions']);
  });
});
