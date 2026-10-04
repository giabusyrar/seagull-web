import { describe, expect, it, vi } from 'vitest';
import { conflictsApi, fetchShadeAsset, listReferenceIngredients, productsApi, runMatch, shadesApi } from './api';

const routes = { reference: (r: string) => `/api/reference/${r}` };

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const fake = (body: unknown, status = 200) => vi.fn<typeof fetch>(async () => json(body, status));

describe('match api', () => {
  it('lists with the explicit all-tenant scope', async () => {
    const f = fake({ conflicts: [{ id: 'c1' }] });
    expect(await conflictsApi.list(f)).toEqual([{ id: 'c1' }]);
    expect(f).toHaveBeenCalledWith('/core/match-engine/api/matching/conflicts?brand_id=*&application_id=*');
  });

  it('resolves a list to null when the field is missing', async () => {
    expect(await productsApi.list(fake({ error: 'x' }))).toBeNull();
  });

  it('lists one brand or every brand of products', async () => {
    const f = fake({ products: [] });
    await productsApi.listForBrand('', f);
    await productsApi.listForBrand('b 1', f);
    expect(f.mock.calls.map((c) => c[0])).toEqual([
      '/core/match-engine/api/matching/products?brand_id=*',
      '/core/match-engine/api/matching/products?brand_id=b%201',
    ]);
  });

  it('lists shades by product, unscoped', async () => {
    const f = fake({ shades: [] });
    await shadesApi.list('p/1', f);
    expect(f).toHaveBeenCalledWith('/core/match-engine/api/matching/shades?product_id=p%2F1');
  });

  it('creates, updates and deletes against the collection path', async () => {
    const f = fake({});
    await conflictsApi.create({ id: 'c1' } as never, f);
    await conflictsApi.update({ id: 'c1' } as never, f);
    await conflictsApi.remove('c1', f);
    expect(f.mock.calls).toEqual([
      ['/core/match-engine/api/matching/conflicts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"id":"c1"}' }],
      ['/core/match-engine/api/matching/conflicts', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: '{"id":"c1"}' }],
      ['/core/match-engine/api/matching/conflicts?id=c1', { method: 'DELETE' }],
    ]);
  });

  it('returns a match result only for an ok response', async () => {
    expect(await runMatch({}, fake({ routine: 1 }))).toEqual({ routine: 1 });
    expect(await runMatch({}, fake({ error: 'x' }, 500))).toBeNull();
  });

  it('reads a shade asset', async () => {
    const f = fake({ asset: { colorMapUrl: 'u' } });
    expect(await fetchShadeAsset('a1', f)).toEqual({ colorMapUrl: 'u' });
    expect(f).toHaveBeenCalledWith('/core/match-engine/api/matching/shade-assets/a1');
  });

  it('normalises reference ingredients from either response shape', async () => {
    expect(await listReferenceIngredients(routes, fake({ ingredients: [{ name: 'Niacinamide' }] }))).toEqual([
      { code: 'Niacinamide', name: 'Niacinamide' },
    ]);
    expect(await listReferenceIngredients(routes, fake([{ code: 'r', name: 'Retinol' }]))).toEqual([{ code: 'r', name: 'Retinol' }]);
  });
});
