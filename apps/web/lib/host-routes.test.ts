import { afterEach, describe, expect, it, vi } from 'vitest';
import { STUDIO_HOST_ROUTES, referenceDataSource } from './host-routes';

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

describe('STUDIO_HOST_ROUTES', () => {
  it('names the routes the studio used to hardcode', () => {
    expect(['brands', 'conditions', 'dimensions', 'ingredients', 'severity-tier-groups'].map(STUDIO_HOST_ROUTES.reference)).toEqual([
      '/api/reference/brands',
      '/api/reference/conditions',
      '/api/reference/dimensions',
      '/api/reference/ingredients',
      '/api/reference/severity-tier-groups',
    ]);
    expect(STUDIO_HOST_ROUTES.skinConditions).toBe('/api/skin-conditions');
    expect(STUDIO_HOST_ROUTES.collections).toBe('/api/collections');
  });
});
