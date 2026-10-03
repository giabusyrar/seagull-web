import { describe, it, expect } from 'vitest';
import { call, classify } from '@/lib/http';

const res = (body: BodyInit | null, status: number, type?: string) =>
  new Response(body, { status, headers: type ? { 'content-type': type } : {} });

describe('classify', () => {
  it.each([
    ['application/json; charset=utf-8', 'json'], ['image/png', 'image'], ['model/gltf-binary', 'glb'],
    ['text/plain', 'text'], [null, 'text'],
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
});
