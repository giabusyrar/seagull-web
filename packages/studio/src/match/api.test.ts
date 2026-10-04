import { describe, expect, it, vi } from 'vitest';
import { ColourApiError, colourTryOn, conflictsApi, fetchColourCatalog, listReferenceIngredients, productsApi, runMatch, shadesApi } from './api';

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

  it('reads the colour catalog through the colour collection', async () => {
    const shade = { shadeId: 's1', productId: 'p1', productName: 'P', shadeName: 'Ruby', hexColor: '#aa0000', hueName: 'red', status: '', colourSource: 'swatch', mode: '' };
    const f = fake({ catalog: { lip: [shade] }, configVersion: 'v1' });
    expect(await fetchColourCatalog(f)).toEqual({ lip: [shade] });
    expect(f).toHaveBeenCalledWith('/core/colour-engine/catalog');
  });

  it('posts the photo and every shade id as multipart to /tryon and returns the PNG', async () => {
    const png = new Blob([new Uint8Array([137, 80, 78, 71])], { type: 'image/png' });
    const f = vi.fn<typeof fetch>(async () => new Response(png, { status: 200, headers: { 'Content-Type': 'image/png' } }));
    const photo = new File([new Uint8Array([1, 2, 3])], 'face.jpg', { type: 'image/jpeg' });

    const out = await colourTryOn(photo, ['lip-1', '', 'blush-2'], f);

    expect(out.type).toBe('image/png');
    expect(out.size).toBe(4);
    const [url, init] = f.mock.calls[0];
    expect(url).toBe('/core/colour-engine/tryon');
    expect(init?.method).toBe('POST');
    const body = init?.body as FormData;
    expect(body).toBeInstanceOf(FormData);
    expect((body.get('image') as File).name).toBe('face.jpg');
    expect(body.getAll('shadeIds')).toEqual(['lip-1', 'blush-2']);
    // The browser sets the multipart boundary; a manual Content-Type would break it.
    expect(init?.headers).toBeUndefined();
  });

  it("throws the engine's error message from a failed colour call", async () => {
    const err = await colourTryOn(new Blob(['x']), ['s1'], fake({ error: 'no face detected', code: 'no_face_detected' }, 422)).catch((e) => e);
    expect(err).toBeInstanceOf(ColourApiError);
    expect(err).toMatchObject({ status: 422, code: 'no_face_detected', message: 'no face detected' });

    const plain = vi.fn<typeof fetch>(async () => new Response('bad gateway', { status: 502 }));
    await expect(fetchColourCatalog(plain)).rejects.toMatchObject({ status: 502, code: '', message: 'bad gateway' });
  });

  it('normalises reference ingredients from either response shape', async () => {
    expect(await listReferenceIngredients(routes, fake({ ingredients: [{ name: 'Niacinamide' }] }))).toEqual([
      { code: 'Niacinamide', name: 'Niacinamide' },
    ]);
    expect(await listReferenceIngredients(routes, fake([{ code: 'r', name: 'Retinol' }]))).toEqual([{ code: 'r', name: 'Retinol' }]);
  });
});
