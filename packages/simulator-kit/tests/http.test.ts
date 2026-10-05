import { describe, it, expect } from 'vitest';
import { call, classify, readResponse } from '@/lib/http';

describe('readResponse', () => {
  it('classifies an existing Response', async () => {
    const r = await readResponse(new Response('{"a":1}', { status: 201, headers: { 'content-type': 'application/json' } }), '/svc/core/core/colour-engine/catalog', performance.now());
    expect(r).toMatchObject({ ok: true, status: 201, kind: 'json', json: { a: 1 }, url: '/svc/core/core/colour-engine/catalog' });
  });
});

const res = (body: BodyInit | null, status: number, type?: string) =>
  new Response(body, { status, headers: type ? { 'content-type': type } : {} });

describe('classify', () => {
  it.each([
    ['application/json; charset=utf-8', 'json'], ['image/png', 'image'], ['model/gltf-binary', 'glb'],
    ['text/plain', 'text'], [null, 'text'],
    ['application/octet-stream', 'glb'], ['model/gltf-binary; charset=binary', 'glb'],
  ])('%s → %s', (ct, kind) => expect(classify(ct as string | null)).toBe(kind));
});

describe('call', () => {
  const req = { url: '/svc/core/health', init: { method: 'GET' } };
  it('parses JSON and keeps status', async () => {
    const r = await call(req, async () => res('{"status":"ok"}', 200, 'application/json'));
    expect(r).toMatchObject({ ok: true, status: 200, kind: 'json', json: { status: 'ok' } });
    expect(r.ms).toBeGreaterThanOrEqual(0);
  });
  it('returns error bodies without throwing', async () => {
    const r = await call(req, async () => res('{"error":"no_face_detected"}', 422, 'application/json'));
    expect(r).toMatchObject({ ok: false, status: 422, json: { error: 'no_face_detected' } });
  });
  it('falls back to text when JSON is malformed', async () => {
    const r = await call(req, async () => res('{oops', 200, 'application/json'));
    expect(r).toMatchObject({ kind: 'text', text: '{oops' });
  });
  it('204 is empty', async () => {
    const r = await call(req, async () => res(null, 204));
    expect(r.kind).toBe('empty');
  });
  it('network failure becomes networkError', async () => {
    const r = await call(req, async () => { throw new TypeError('fetch failed'); });
    expect(r).toMatchObject({ ok: false, status: 0, networkError: 'service at /svc/core/health unreachable: fetch failed' });
  });
  it('body read failure becomes networkError', async () => {
    const r = await call(req, async () => ({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: async () => { throw new Error('body read failed'); },
      blob: async () => { throw new Error('body read failed'); },
    } as unknown as Response));
    expect(r).toMatchObject({ ok: false, status: 200, networkError: 'service at /svc/core/health unreachable: body read failed' });
  });
  it('image/png blob response has size and blobUrl', async () => {
    const pngBytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
    const r = await call(req, async () => res(new Blob([pngBytes], { type: 'image/png' }), 200, 'image/png'));
    expect(r).toMatchObject({ ok: true, status: 200, kind: 'image', size: 8 });
    expect(r.blobUrl).toBeDefined();
  });
});

describe('readResponse hints', () => {
  it('flags the dev-proxy 500 for /svc/ as unreachable but keeps the status', async () => {
    const r = await readResponse(res('Internal Server Error', 500, 'text/plain'), '/svc/ref/health', performance.now());
    expect(r.status).toBe(500);
    expect(r.hint).toContain('/svc/ref/health looks unreachable');
  });
  it('also flags it when the proxy sends no content-type', async () => {
    const r = await readResponse(new Response(new Blob(['Internal Server Error']), { status: 500 }), '/svc/core/health', performance.now());
    expect(r.hint).toContain('looks unreachable');
  });
  it('gives a normal 500 JSON no hint', async () => {
    const r = await readResponse(res('{"error":"boom"}', 500, 'application/json'), '/svc/core/health', performance.now());
    expect(r.hint).toBeUndefined();
  });
});
