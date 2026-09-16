import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createApiClient } from './api-client';

describe('ApiClient', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('attaches authorization headers and base URL correctly', async () => {
    const mockData = [{ id: 'col_1', name: 'Auth Service', type: 'proxy' }];
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockData,
    });
    global.fetch = mockFetch;

    const client = createApiClient({
      baseUrl: 'http://localhost:8080',
      getToken: () => 'test-jwt-token',
    });

    const result = await client.collections.list();
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/v1/collections',
      expect.objectContaining({
        headers: expect.any(Headers),
      })
    );
    expect(result).toEqual(mockData);
  });

  it('throws structured error on non-ok HTTP responses', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => JSON.stringify({ error: 'Unauthorized access' }),
    });
    global.fetch = mockFetch;

    const client = createApiClient({
      baseUrl: 'http://localhost:8080',
    });

    await expect(client.collections.list()).rejects.toThrow('API Request Error [401]');
  });
});
