import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('./api-client', () => ({
  apiClient: {
    collections: {
      list: vi.fn(),
      update: vi.fn(),
    },
  },
}));
vi.mock('./router-registry', () => ({ rebuildRouter: vi.fn() }));

import { apiClient } from './api-client';
import { rebuildRouter } from './router-registry';
import { runHealthCheck } from './poller';

const originalFetch = global.fetch;

describe('runHealthCheck', () => {
  beforeEach(() => {
    vi.mocked(apiClient.collections.list).mockReset();
    vi.mocked(apiClient.collections.update).mockReset().mockResolvedValue({} as any);
    vi.mocked(rebuildRouter).mockReset().mockResolvedValue(undefined);
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('marks a collection healthy when its health check responds ok', async () => {
    vi.mocked(apiClient.collections.list).mockResolvedValue([
      {
        id: 'col-1',
        name: 'Inventory',
        type: 'proxy',
        healthCheckPath: '/health',
        status: 'unknown',
        activeEnvironmentId: 'env-1',
        environments: [{ id: 'env-1', targetHost: 'https://backend.internal' }],
      } as any,
    ]);
    global.fetch = vi.fn().mockResolvedValue({ ok: true } as unknown as Response);

    await runHealthCheck();

    expect(global.fetch).toHaveBeenCalledWith('https://backend.internal/health', expect.any(Object));
    expect(apiClient.collections.update).toHaveBeenCalledWith('col-1', { status: 'healthy' });
    expect(rebuildRouter).toHaveBeenCalled();
  });

  it('marks a collection unhealthy when the fetch fails', async () => {
    vi.mocked(apiClient.collections.list).mockResolvedValue([
      {
        id: 'col-1',
        name: 'Inventory',
        type: 'proxy',
        healthCheckPath: '/health',
        status: 'healthy',
        activeEnvironmentId: 'env-1',
        environments: [{ id: 'env-1', targetHost: 'https://backend.internal' }],
      } as any,
    ]);
    global.fetch = vi.fn().mockRejectedValue(new Error('connection refused'));

    await runHealthCheck();

    expect(apiClient.collections.update).toHaveBeenCalledWith('col-1', { status: 'unhealthy' });
  });

  it('skips a collection with no active environment', async () => {
    vi.mocked(apiClient.collections.list).mockResolvedValue([
      {
        id: 'col-1',
        name: 'Inventory',
        type: 'proxy',
        healthCheckPath: '/health',
        status: 'unknown',
        activeEnvironmentId: null,
      } as any,
    ]);
    global.fetch = vi.fn();

    await runHealthCheck();

    expect(global.fetch).not.toHaveBeenCalled();
    expect(apiClient.collections.update).not.toHaveBeenCalled();
  });
});
