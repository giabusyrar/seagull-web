import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { handleApiProxy } from './proxy-handler';

const GATEWAY = 'http://gateway.test:9080';

function call(path: string, init?: { method?: string }) {
  const request = new NextRequest(`http://web.test/backend-api/${path}`, init);
  return handleApiProxy(request, { params: Promise.resolve({ path: path.split('/') }) });
}

describe('handleApiProxy reference routing', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.stubEnv('GATEWAY_PROXY_URL', GATEWAY);
    vi.stubEnv('GATEWAY_API_KEY', 'test-data-plane-key');
    vi.stubEnv('REFERENCE_SERVICE_URL', 'http://reference.test:8086');
    fetchMock = vi.fn().mockResolvedValue(new Response('[]', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it.each([
    ['api/reference/brands', `${GATEWAY}/reference/brands`],
    ['api/reference/brands/abc', `${GATEWAY}/reference/brands/abc`],
    ['api/reference', `${GATEWAY}/reference`],
    ['reference-api/dimensions', `${GATEWAY}/reference/dimensions`],
    ['api/dimensions', `${GATEWAY}/reference/dimensions`],
  ])('sends /%s through the gateway as %s', async (path, target) => {
    await call(path);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(target);
    expect(init.headers['x-api-key']).toBe('test-data-plane-key');
  });

  it('never calls reference-service directly', async () => {
    await call('api/reference/products', { method: 'GET' });
    expect(fetchMock.mock.calls[0][0]).not.toContain('reference.test');
  });

  it('keeps the query string', async () => {
    const request = new NextRequest('http://web.test/backend-api/api/reference/brands?limit=5');
    await handleApiProxy(request, { params: Promise.resolve({ path: ['api', 'reference', 'brands'] }) });
    expect(fetchMock.mock.calls[0][0]).toBe(`${GATEWAY}/reference/brands?limit=5`);
  });
});
