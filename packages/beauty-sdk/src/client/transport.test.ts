import { afterEach, describe, expect, it, vi } from 'vitest';
import { BeautyApiError } from './errors';
import { createBeautyClient } from './transport';

const ok = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } });

afterEach(() => vi.unstubAllGlobals());

describe('createBeautyClient', () => {
  it('in the browser, calls the SDK path under the proxy base url without scope or key', async () => {
    const fetch = vi.fn().mockResolvedValue(ok({ data: [] }));
    const c = createBeautyClient({ baseUrl: '/api/beauty', fetch });
    await c.call('forms.evaluate', { params: { code: 'quiz' }, body: { answers: {} } });
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe('/api/beauty/forms/quiz/evaluate');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({ answers: {} });
    expect(new Headers(init.headers).get('x-api-key')).toBeNull();
  });

  it('server-side with a key, calls the gateway path with scope and key', async () => {
    const fetch = vi.fn().mockResolvedValue(ok({}));
    const c = createBeautyClient({ baseUrl: 'https://gw.test', apiKey: 'k', brandId: 'b', applicationId: 'a', fetch });
    await c.call('face.head', { body: new FormData() });
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe('https://gw.test/core/vision-engine/face-architecture/b/a/head');
    expect(new Headers(init.headers).get('x-api-key')).toBe('k');
  });

  it('refuses an api key in a browser', () => {
    vi.stubGlobal('window', {});
    expect(() => createBeautyClient({ baseUrl: 'https://gw.test', apiKey: 'k', brandId: 'b', applicationId: 'a' })).toThrow(/server/);
  });

  it('appends the query string', async () => {
    const fetch = vi.fn().mockResolvedValue(ok({ data: [] }));
    await createBeautyClient({ baseUrl: '/api/beauty', fetch }).call('reference.products', { query: { brandId: 'x' } });
    expect(fetch.mock.calls[0][0]).toBe('/api/beauty/reference/products?brandId=x');
  });

  it('throws BeautyApiError for a failed response', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ detail: { code: 'no_face' } }), { status: 422 }));
    await expect(createBeautyClient({ baseUrl: '/api/beauty', fetch }).json('face.analyze', { body: new FormData() })).rejects.toMatchObject({
      name: 'BeautyApiError',
      code: 'no_face',
      status: 422,
    } satisfies Partial<BeautyApiError>);
  });

  it('returns binary bodies as ArrayBuffer', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(new Uint8Array([1, 2, 3]), { status: 200 }));
    const buf = await createBeautyClient({ baseUrl: '/api/beauty', fetch }).binary('face.head', { body: new FormData() });
    expect(new Uint8Array(buf)).toEqual(new Uint8Array([1, 2, 3]));
  });

  it('unwraps reference lists', async () => {
    const fetch = vi.fn().mockResolvedValue(ok({ success: true, data: [{ id: 'b1', code: 'MO', name: 'Make Over' }] }));
    expect(await createBeautyClient({ baseUrl: '/api/beauty', fetch }).reference.brands()).toEqual([{ id: 'b1', code: 'MO', name: 'Make Over' }]);
  });
});
