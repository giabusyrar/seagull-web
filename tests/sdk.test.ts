import { describe, it, expect } from 'vitest';
import { OPERATIONS } from '@gateway-experience/beauty-sdk/client';
import { SDK_OPS, sdkInit, withBrandHeaders, SIM_BRAND_HEADER, SIM_APP_HEADER } from '@/lib/sdk';
import { GROUPS } from '@/lib/groups';

const direct = new Map(GROUPS.flatMap((g) => g.endpoints).map((e) => [e.id, e]));

describe('SDK_OPS', () => {
  it('covers exactly the operations the built SDK exposes', () => {
    expect(SDK_OPS.map((o) => o.id).sort()).toEqual(OPERATIONS.map((o) => o.id).sort());
  });
  it('each maps to a direct endpoint with the same field names', () => {
    for (const op of SDK_OPS) {
      const d = direct.get(op.directId);
      expect(d, op.id).toBeDefined();
      const names = new Set(d!.fields.map((f) => f.name));
      for (const f of op.fields) expect(names.has(f.name), `${op.id}.${f.name}`).toBe(true);
    }
  });
});

describe('sdkInit', () => {
  it('multipart builds FormData with bools and files', () => {
    const op = SDK_OPS.find((o) => o.id === 'colour.analyze')!;
    const img = new File(['x'], 'a.jpg', { type: 'image/jpeg' });
    const init = sdkInit(op, { image: img, hijab: false, hairVisible: true });
    const fd = init.body as FormData;
    expect(fd.get('image')).toBeInstanceOf(File);
    expect(fd.get('hijab')).toBe('false');
    expect(fd.get('hairVisible')).toBe('true');
    expect(init.query).toBeUndefined();
  });
  it('GET puts fields in query and sends no body', () => {
    const op = SDK_OPS.find((o) => o.id === 'reference.products')!;
    expect(sdkInit(op, { brandId: 'brd-1' })).toEqual({ query: { brandId: 'brd-1' } });
    expect(sdkInit(op, {})).toEqual({});
  });
});

describe('withBrandHeaders', () => {
  it('adds brand and app headers and keeps existing ones', async () => {
    let seen: Headers | undefined;
    const f = withBrandHeaders({ brandId: 'wardah', applicationId: 'skinverse' }, async (_u, init) => { seen = new Headers(init?.headers); return new Response(null, { status: 204 }); });
    await f('/api/beauty/colour/catalog', { headers: { accept: 'application/json' } });
    expect(seen?.get(SIM_BRAND_HEADER)).toBe('wardah');
    expect(seen?.get(SIM_APP_HEADER)).toBe('skinverse');
    expect(seen?.get('accept')).toBe('application/json');
  });
});
