import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./api-client', () => ({
  apiClient: {
    collections: {
      list: vi.fn(),
    },
  },
}));

import { apiClient } from './api-client';
import { rebuildRouter, matchRoute, validateRoutePattern } from './router-registry';

const collectionFixture = {
  id: 'col-1',
  type: 'proxy',
  originalPrefix: '/inventory',
  healthCheckPath: '/health',
  status: 'healthy',
  activeEnvironmentId: 'env-1',
  environments: [{ id: 'env-1', targetHost: 'https://backend.internal:8080' }],
  routes: [
    {
      id: 'route-1',
      collectionId: 'col-1',
      method: 'GET',
      originalPattern: '/items/:id',
      targetPattern: '/v2/items/:id',
      groupId: null,
    },
  ],
};

describe('rebuildRouter + matchRoute', () => {
  beforeEach(() => {
    vi.mocked(apiClient.collections.list).mockReset();
  });

  it('registers a route under the collection prefix and matches it', async () => {
    vi.mocked(apiClient.collections.list).mockResolvedValue([collectionFixture] as any);

    await rebuildRouter();
    const match = matchRoute('GET', '/inventory/items/42');

    expect(match).not.toBeNull();
    expect(match?.route.collectionId).toBe('col-1');
    expect(match?.route.targetHost).toBe('https://backend.internal:8080');
    expect(match?.route.targetPattern).toBe('/v2/items/:id');
    expect(match?.params).toEqual({ id: '42' });
  });

  it('does not match a path outside any registered pattern', async () => {
    vi.mocked(apiClient.collections.list).mockResolvedValue([collectionFixture] as any);

    await rebuildRouter();
    expect(matchRoute('GET', '/inventory/unrelated')).toBeNull();
  });

  it('skips a collection with no active environment configured', async () => {
    vi.mocked(apiClient.collections.list).mockResolvedValue([
      { ...collectionFixture, activeEnvironmentId: null },
    ] as any);

    await rebuildRouter();
    expect(matchRoute('GET', '/inventory/items/1')).toBeNull();
  });

  it('registers ANY method routes for every HTTP verb', async () => {
    vi.mocked(apiClient.collections.list).mockResolvedValue([
      {
        ...collectionFixture,
        routes: [
          {
            id: 'route-any',
            collectionId: 'col-1',
            method: 'ANY',
            originalPattern: '/anything',
            targetPattern: null,
            groupId: null,
          },
        ],
      },
    ] as any);

    await rebuildRouter();
    expect(matchRoute('POST', '/inventory/anything')).not.toBeNull();
    expect(matchRoute('DELETE', '/inventory/anything')).not.toBeNull();
  });
});

describe('validateRoutePattern', () => {
  it('accepts a candidate pattern', async () => {
    const result = await validateRoutePattern([{ method: 'GET', pattern: '/inventory/items/:id' }]);
    expect(result.ok).toBe(true);
  });
});
