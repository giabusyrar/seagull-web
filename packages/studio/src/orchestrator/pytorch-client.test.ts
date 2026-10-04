import { afterEach, describe, expect, it, vi } from 'vitest';
import { dispatchPyTorchCapabilities } from './pytorch-client';

const CAPS = ['sebum_shine_detector', 'wrinkle_depth_estimator'];

function mockFetch(status: number, body: unknown) {
  const fn = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
  vi.stubGlobal('fetch', fn);
  return fn;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('dispatchPyTorchCapabilities', () => {
  it('maps a scored capability onto its display metrics', async () => {
    mockFetch(200, { telemetry: { sebum_shine_detector: 81.2 } });
    const r = await dispatchPyTorchCapabilities({ serviceUrl: 'http://models.test', timeoutMs: 100, capabilities: CAPS });
    expect(r.telemetry).toEqual({ sebum: 81.2 });
  });

  it('invents nothing for a capability the server did not score', async () => {
    mockFetch(200, { telemetry: { sebum_shine_detector: 81.2 } });
    const r = await dispatchPyTorchCapabilities({ serviceUrl: 'http://models.test', timeoutMs: 100, capabilities: CAPS });
    expect(r.telemetry).not.toHaveProperty('aging');
    expect(r.missing).toEqual(['wrinkle_depth_estimator']);
  });

  it('carries the reason a capability was unavailable, and does not call it missing', async () => {
    mockFetch(200, {
      telemetry: {},
      unavailableCapabilities: { sebum_shine_detector: 'model failed to load' },
    });
    const r = await dispatchPyTorchCapabilities({ serviceUrl: 'http://models.test', timeoutMs: 100, capabilities: CAPS });
    expect(r.unavailable).toEqual({ sebum_shine_detector: 'model failed to load' });
    expect(r.missing).toEqual(['wrinkle_depth_estimator']);
    expect(r.telemetry).toEqual({});
  });

  it('returns no readings when the server errors, and says so', async () => {
    mockFetch(503, {});
    const r = await dispatchPyTorchCapabilities({ serviceUrl: 'http://models.test', timeoutMs: 100, capabilities: CAPS });
    expect(r.telemetry).toEqual({});
    expect(r.error).toContain('503');
    expect(r.missing).toEqual(CAPS);
  });

  it('returns no readings when the request throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNREFUSED')));
    const r = await dispatchPyTorchCapabilities({ serviceUrl: 'http://models.test', timeoutMs: 100, capabilities: CAPS });
    expect(r.telemetry).toEqual({});
    expect(r.error).toContain('ECONNREFUSED');
  });

  it('refuses to answer without a model server, instead of standing in for one', async () => {
    const r = await dispatchPyTorchCapabilities({ serviceUrl: '', timeoutMs: 100, capabilities: CAPS });
    expect(r.telemetry).toEqual({});
    expect(r.error).toMatch(/model registry/);
  });

  it('asks nothing when no capability was requested', async () => {
    const fn = mockFetch(200, {});
    const r = await dispatchPyTorchCapabilities({ serviceUrl: 'http://models.test', timeoutMs: 100, capabilities: [] });
    expect(fn).not.toHaveBeenCalled();
    expect(r).toEqual({ telemetry: {}, unavailable: {}, missing: [] });
  });
});

describe('the data-plane key', () => {
  it('travels with the dispatch when the caller supplies one', async () => {
    const fn = mockFetch(200, { telemetry: {} });
    await dispatchPyTorchCapabilities({
      serviceUrl: 'http://models.test',
      timeoutMs: 100,
      capabilities: CAPS,
      apiKey: 'k',
    });
    expect(fn.mock.calls[0][1].headers['x-api-key']).toBe('k');
  });

  it('is absent when the caller has none, rather than sent empty', async () => {
    const fn = mockFetch(200, { telemetry: {} });
    await dispatchPyTorchCapabilities({ serviceUrl: 'http://models.test', timeoutMs: 100, capabilities: CAPS });
    expect(fn.mock.calls[0][1].headers['x-api-key']).toBeUndefined();
  });
});
