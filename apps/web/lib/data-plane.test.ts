import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { environmentHosts, normalizeHost, resetDataPlaneCache, resolveDataPlane } from './data-plane';
import { DATA_PLANE_COOKIE } from './data-plane-cookie';

const ENVS = {
  success: true,
  environments: [
    { id: 'dev', variables: [{ key: 'host', value: 'http://127.0.0.1:9080/', enabled: true }] },
    { id: 'stg', variables: [{ key: 'host', value: 'https://staging.gw.test', enabled: true }, { key: 'other', value: 'https://x.test' }] },
    { id: 'off', variables: [{ key: 'host', value: 'https://disabled.gw.test', enabled: false }] },
  ],
};

const req = (host?: string) => ({
  cookies: { get: (name: string) => (name === DATA_PLANE_COOKIE && host !== undefined ? { name, value: encodeURIComponent(host) } : undefined) },
}) as never;

const gateway = () => vi.fn().mockResolvedValue(new Response(JSON.stringify(ENVS), { status: 200 }));

beforeEach(() => {
  resetDataPlaneCache();
  vi.stubEnv('GATEWAY_PROXY_URL', 'http://from-env-file:9080');
});
afterEach(() => vi.unstubAllEnvs());

describe('resolveDataPlane', () => {
  it('uses the selected environment’s host when the gateway stores it', async () => {
    const f = gateway();
    expect(await resolveDataPlane(req('https://staging.gw.test/'), 'Bearer s', f)).toEqual({ url: 'https://staging.gw.test', source: 'environment' });
    expect(f.mock.calls[0][1].headers).toEqual({ authorization: 'Bearer s' });
  });

  it('falls back to .env for a host the gateway does not store, so the browser cannot pick any host', async () => {
    expect(await resolveDataPlane(req('https://evil.test'), 'Bearer s', gateway())).toEqual({ url: 'http://from-env-file:9080', source: 'env-file' });
  });

  it('ignores a disabled host variable', async () => {
    expect((await resolveDataPlane(req('https://disabled.gw.test'), undefined, gateway())).source).toBe('env-file');
  });

  it('falls back to .env with no selection, without asking the gateway', async () => {
    const f = gateway();
    expect(await resolveDataPlane(req(), undefined, f)).toEqual({ url: 'http://from-env-file:9080', source: 'env-file' });
    expect(f).not.toHaveBeenCalled();
  });

  it('falls back to .env when the gateway cannot list environments', async () => {
    const f = vi.fn().mockResolvedValue(new Response('{}', { status: 401 }));
    expect((await resolveDataPlane(req('https://staging.gw.test'), undefined, f)).source).toBe('env-file');
  });

  it('reads the gateway’s environments once for a burst of calls', async () => {
    const f = gateway();
    await resolveDataPlane(req('https://staging.gw.test'), undefined, f);
    await resolveDataPlane(req('http://127.0.0.1:9080'), undefined, f);
    expect(f).toHaveBeenCalledTimes(1);
  });
});

describe('helpers', () => {
  it('normalises hosts and refuses what is not an http(s) URL', () => {
    expect(normalizeHost(' https://a.test/// ')).toBe('https://a.test');
    expect(normalizeHost('javascript:alert(1)')).toBeNull();
    expect(normalizeHost('')).toBeNull();
  });

  it('collects the enabled host of every environment', () => {
    expect([...environmentHosts(ENVS)].sort()).toEqual(['http://127.0.0.1:9080', 'https://staging.gw.test']);
    expect(environmentHosts({ error: 'x' }).size).toBe(0);
  });
});
