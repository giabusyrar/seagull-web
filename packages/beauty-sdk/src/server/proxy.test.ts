import { describe, expect, it, vi } from 'vitest';
import { createBeautyProxy } from './proxy';

const ctx = (...path: string[]) => ({ params: Promise.resolve({ path }) });
const base = { gatewayUrl: 'https://gw.test', apiKey: 'secret', brandId: 'brd', applicationId: 'app' };

describe('createBeautyProxy', () => {
  it('answers 404 for anything outside the allowlist, without calling the gateway', async () => {
    const fetch = vi.fn();
    const { GET } = createBeautyProxy({ ...base, fetch });
    const res = await GET(new Request('https://brand.test/api/beauty/core/admin'), ctx('core', 'admin'));
    expect(res.status).toBe(404);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('writes scope into the gateway path and adds the key server-side', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(new Uint8Array([7]), { headers: { 'content-type': 'model/gltf-binary' } }));
    const { POST } = createBeautyProxy({ ...base, fetch });
    const fd = new FormData();
    fd.set('front', new Blob([new Uint8Array([1])], { type: 'image/jpeg' }), 'f.jpg');
    const res = await POST(new Request('https://brand.test/api/beauty/face/head', { method: 'POST', body: fd }), ctx('face', 'head'));
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe('https://gw.test/core/vision-engine/face-architecture/brd/app/head');
    expect(new Headers(init.headers).get('x-api-key')).toBe('secret');
    expect(res.headers.get('content-type')).toBe('model/gltf-binary');
    expect(new Uint8Array(await res.arrayBuffer())).toEqual(new Uint8Array([7]));
  });

  it('overwrites brand/application in JSON bodies', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('{}'));
    const { POST } = createBeautyProxy({ ...base, fetch });
    await POST(
      new Request('https://brand.test/api/beauty/forms/quiz/evaluate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ answers: { a: 1 }, brand_id: 'spoofed' }),
      }),
      ctx('forms', 'quiz', 'evaluate'),
    );
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ answers: { a: 1 }, brand_id: 'brd', application_id: 'app' });
  });

  it('overwrites brand/application in multipart bodies', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('{}'));
    const { POST } = createBeautyProxy({ ...base, fetch });
    const fd = new FormData();
    fd.set('brandId', 'spoofed');
    await POST(new Request('https://brand.test/api/beauty/skin/analyze', { method: 'POST', body: fd }), ctx('skin', 'analyze'));
    const sent = fetch.mock.calls[0][1].body as FormData;
    expect(sent.get('brandId')).toBe('brd');
    expect(sent.get('applicationId')).toBe('app');
  });

  it('answers 400 invalid_body for unparseable JSON, without calling the gateway', async () => {
    const fetch = vi.fn();
    const { POST } = createBeautyProxy({ ...base, fetch });
    const res = await POST(
      new Request('https://brand.test/api/beauty/forms/quiz/evaluate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{not json',
      }),
      ctx('forms', 'quiz', 'evaluate'),
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ detail: { code: 'invalid_body' } });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('answers 400 invalid_body for a non-multipart body on a multipart operation', async () => {
    const fetch = vi.fn();
    const { POST } = createBeautyProxy({ ...base, fetch });
    const res = await POST(
      new Request('https://brand.test/api/beauty/skin/analyze', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ a: 1 }),
      }),
      ctx('skin', 'analyze'),
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ detail: { code: 'invalid_body' } });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('refuses customer routes without authorize', async () => {
    const fetch = vi.fn();
    const { GET } = createBeautyProxy({ ...base, fetch });
    const res = await GET(new Request('https://brand.test/api/beauty/assessments/history'), ctx('assessments', 'history'));
    expect(res.status).toBe(401);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('uses the customer from authorize', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('[]'));
    const { GET } = createBeautyProxy({ ...base, fetch, authorize: () => ({ customerId: 'cus-1' }) });
    await GET(new Request('https://brand.test/api/beauty/assessments/history'), ctx('assessments', 'history'));
    expect(fetch.mock.calls[0][0]).toBe('https://gw.test/core/assessments/customers/cus-1');
  });

  it('returns the Response authorize gives to refuse', async () => {
    const fetch = vi.fn();
    const { POST } = createBeautyProxy({ ...base, fetch, authorize: () => new Response('no', { status: 403 }) });
    const res = await POST(new Request('https://brand.test/api/beauty/colour/analyze', { method: 'POST', body: new FormData() }), ctx('colour', 'analyze'));
    expect(res.status).toBe(403);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('passes upstream status and error bodies through and never echoes the key', async () => {
    const fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ detail: { code: 'no_face' } }), { status: 422, headers: { 'content-type': 'application/json', 'set-cookie': 'x=1' } }),
    );
    const { POST } = createBeautyProxy({ ...base, fetch });
    const res = await POST(new Request('https://brand.test/api/beauty/face/analyze', { method: 'POST', body: new FormData() }), ctx('face', 'analyze'));
    expect(res.status).toBe(422);
    expect(await res.json()).toEqual({ detail: { code: 'no_face' } });
    expect(res.headers.get('set-cookie')).toBeNull();
    expect([...res.headers.values()].join(' ')).not.toContain('secret');
  });

  it('answers 504 with a timeout code when the gateway is too slow', async () => {
    const fetch = vi.fn((_: unknown, init?: RequestInit) => new Promise<Response>((_r, reject) => {
      init!.signal!.addEventListener('abort', () => reject(new DOMException('timeout', 'TimeoutError')));
    }));
    const { GET } = createBeautyProxy({ ...base, fetch, timeouts: { 'colour.catalog': 10 } });
    const res = await GET(new Request('https://brand.test/api/beauty/colour/catalog'), ctx('colour', 'catalog'));
    expect(res.status).toBe(504);
    expect(await res.json()).toEqual({ detail: { code: 'timeout' } });
  });

  it('answers 502 when the gateway is unreachable', async () => {
    const fetch = vi.fn().mockRejectedValue(new TypeError('fetch failed'));
    const { GET } = createBeautyProxy({ ...base, fetch });
    const res = await GET(new Request('https://brand.test/api/beauty/colour/catalog'), ctx('colour', 'catalog'));
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ detail: { code: 'gateway_unreachable' } });
  });
});
