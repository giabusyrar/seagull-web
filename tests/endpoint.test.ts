import { describe, it, expect } from 'vitest';
import { buildRequest, type EndpointDef } from '@/lib/endpoint';

const brand = { brandId: 'wardah', applicationId: 'skinverse' };
const def = (d: Partial<EndpointDef>): EndpointDef => ({ id: 'x', title: 'x', service: 'core', method: 'GET', path: '/p', body: 'none', brand: 'none', fields: [], ...d });

describe('buildRequest', () => {
  it('GET puts fields and snake brand in query', () => {
    const r = buildRequest(def({ path: '/core/form-engine/survey', brand: 'snake', fields: [{ name: 'limit', kind: 'number' }] }), { limit: 5 }, brand);
    expect(r.url).toBe('/svc/core/core/form-engine/survey?limit=5&brand_id=wardah&application_id=skinverse');
    expect(r.init.method).toBe('GET');
  });
  it('substitutes path params and brand path style', () => {
    const r = buildRequest(def({ method: 'POST', body: 'multipart', path: '/core/vision-engine/face-architecture/:brandId/:applicationId', brand: 'path', fields: [] }), {}, brand);
    expect(r.url).toBe('/svc/core/core/vision-engine/face-architecture/wardah/skinverse');
  });
  it('JSON body converts kinds and skips empty', () => {
    const r = buildRequest(def({ method: 'POST', body: 'json', brand: 'snake', fields: [
      { name: 'code', kind: 'text' }, { name: 'n', kind: 'number' }, { name: 'b', kind: 'bool' }, { name: 'data', kind: 'json' }, { name: 'empty', kind: 'text' },
    ] }), { code: 'q1', n: '3', b: true, data: '{"a":1}', empty: '' }, brand);
    expect(JSON.parse(r.init.body as string)).toEqual({ code: 'q1', n: 3, b: true, data: { a: 1 }, brand_id: 'wardah', application_id: 'skinverse' });
    expect((r.init.headers as Record<string, string>)['Content-Type']).toBe('application/json');
  });
  it('invalid JSON field throws a readable error', () => {
    expect(() => buildRequest(def({ method: 'POST', body: 'json', fields: [{ name: 'data', kind: 'json' }] }), { data: '{bad' }, brand)).toThrow(/data: invalid JSON/);
  });
  it('multipart: bools, files, repeat, camel brand', () => {
    const f1 = new File(['a'], 'a.jpg', { type: 'image/jpeg' });
    const f2 = new File(['b'], 'b.jpg', { type: 'image/jpeg' });
    const r = buildRequest(def({ method: 'POST', body: 'multipart', brand: 'camel', fields: [
      { name: 'image', kind: 'file' }, { name: 'hijab', kind: 'bool' }, { name: 'shadeIds', kind: 'text', repeat: true }, { name: 'more', kind: 'files' },
    ] }), { image: f1, hijab: false, shadeIds: 's1, s2', more: [f1, f2] }, brand);
    const fd = r.init.body as FormData;
    expect(fd.get('hijab')).toBe('false');
    expect(fd.getAll('shadeIds')).toEqual(['s1', 's2']);
    expect(fd.getAll('more')).toHaveLength(2);
    expect(fd.get('brandId')).toBe('wardah');
    expect(r.init.headers).toBeUndefined();
  });
  it('raw body sends the file with its type', () => {
    const f = new File(['x'], 'p.png', { type: 'image/png' });
    const r = buildRequest(def({ method: 'POST', body: 'raw', service: 'conv', path: '/conversation/sessions/:id/photo', fields: [{ name: 'id', kind: 'text' }, { name: 'photo', kind: 'file' }], headers: { 'X-Session-Owner': 't' } }), { id: 's1', photo: f }, brand);
    expect(r.url).toBe('/svc/conv/conversation/sessions/s1/photo');
    expect(r.init.body).toBe(f);
    expect(r.init.headers).toEqual({ 'X-Session-Owner': 't', 'Content-Type': 'image/png' });
  });
  it('explicit value beats brand context', () => {
    const r = buildRequest(def({ brand: 'snake', fields: [{ name: 'brand_id', kind: 'text' }] }), { brand_id: 'makeover' }, brand);
    expect(r.url).toContain('brand_id=makeover');
    expect(r.url).not.toContain('brand_id=wardah');
  });
  it('brand key override even when not a declared field', () => {
    const r = buildRequest(def({ brand: 'snake', fields: [] }), { brand_id: 'makeover' }, brand);
    expect(r.url).toContain('brand_id=makeover');
    expect(r.url).not.toContain('brand_id=wardah');
  });
  it('declared but empty brand field falls back to context', () => {
    const r = buildRequest(def({ brand: 'snake', fields: [{ name: 'brand_id', kind: 'text' }] }), { brand_id: '' }, brand);
    expect(r.url).toContain('brand_id=wardah');
    expect((r.url.match(/brand_id=/g) || []).length).toBe(1);
  });
});
