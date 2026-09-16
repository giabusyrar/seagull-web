import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./api-client', () => ({
  apiClient: {
    raw: vi.fn(),
  },
}));

import { apiClient } from './api-client';
import { resolveCollectionVariables, resolveGlobalSecretValue } from './collection-variables';

describe('resolveCollectionVariables', () => {
  beforeEach(() => {
    vi.mocked(apiClient.raw).mockReset();
  });

  it("returns values for this collection's own variables and secrets", async () => {
    vi.mocked(apiClient.raw).mockImplementation((async (url: string) => {
      if (url.includes('global-variables')) {
        return [{ key: 'region', value: 'us-east' }];
      }
      if (url.includes('secrets')) {
        return [{ name: 'auth_token', value: 'super-secret-key' }];
      }
      return [];
    }) as any);

    const result = await resolveCollectionVariables('col-1');
    expect(result).toEqual({
      region: 'us-east',
      auth_token: 'super-secret-key',
    });
  });

  it('lets a per-collection variable override a same-named global secret', async () => {
    vi.mocked(apiClient.raw).mockImplementation((async (url: string) => {
      if (url.includes('global-variables')) {
        return [{ key: 'shared', value: 'local-value' }];
      }
      if (url.includes('secrets')) {
        return [{ name: 'shared', value: 'global-value' }];
      }
      return [];
    }) as any);

    const result = await resolveCollectionVariables('col-1');
    expect(result).toEqual({ shared: 'local-value' });
  });
});

describe('resolveGlobalSecretValue', () => {
  beforeEach(() => {
    vi.mocked(apiClient.raw).mockReset();
  });

  it('returns the secret value by id', async () => {
    vi.mocked(apiClient.raw).mockResolvedValue([
      { id: 'secret-1', name: 'api_key', value: 'the-real-key' },
    ]);
    expect(await resolveGlobalSecretValue('secret-1')).toBe('the-real-key');
  });

  it('returns null when the secret does not exist', async () => {
    vi.mocked(apiClient.raw).mockResolvedValue([]);
    expect(await resolveGlobalSecretValue('missing')).toBeNull();
  });
});
