import { describe, expect, it, vi } from 'vitest';
import { ColourApiError, colourTryOn, conflictsApi, fetchColourCatalog, listReferenceIngredients, productsApi, runMatch, shadesApi } from './api';

const routes = { reference: (r: string) => `/api/reference/${r}` };

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const fake = (body: unknown, status = 200) => vi.fn<typeof fetch>(async () => json(body, status));

describe('match api', () => {
  it('lists conflict rules from reference-service, every brand and application', async () => {
    const f = fake({ data: [{ id: 'c1' }], success: true });
    expect(await conflictsApi.list(routes, f)).toEqual([{ id: 'c1' }]);
    expect(f).toHaveBeenCalledWith('/api/reference/ingredient-conflict-rules');
  });

  it('resolves a list to null when the field is missing', async () => {
    expect(await productsApi.list(fake({ error: 'x' }))).toBeNull();
  });

  it('lists one brand or every brand of products', async () => {
    const f = fake({ products: [] });
    await productsApi.listForBrand('', f);
    await productsApi.listForBrand('b 1', f);
    expect(f.mock.calls.map((c) => c[0])).toEqual([
      '/core/match-engine/products?brand_id=*',
      '/core/match-engine/products?brand_id=b%201',
    ]);
  });

  it('lists shades of one product from reference-service', async () => {
    const f = fake({ data: [{ id: 's1' }], success: true });
    expect(await shadesApi.list(routes, 'p/1', f)).toEqual([{ id: 's1' }]);
    expect(f).toHaveBeenCalledWith('/api/reference/shades?productId=p%2F1');
  });

  it('resolves a reference list to null when data is missing', async () => {
    expect(await shadesApi.list(routes, 'p1', fake({ shades: [] }))).toBeNull();
  });

  it('creates, updates and deletes (id in the path) against reference-service', async () => {
    const f = fake({ success: true });
    await shadesApi.create(routes, { id: 's1' } as never, f);
    await shadesApi.update(routes, { id: 's1' } as never, f);
    await shadesApi.remove(routes, 's/1', f);
    expect(f.mock.calls).toEqual([
      ['/api/reference/shades', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"id":"s1"}' }],
      ['/api/reference/shades', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: '{"id":"s1"}' }],
      ['/api/reference/shades/s%2F1', { method: 'DELETE' }],
    ]);
  });

  it('throws the service error when a save is refused', async () => {
    const f = fake({ error: 'invalid reference: hexColor "#A92" is not #RRGGBB' }, 400);
    await expect(shadesApi.create(routes, { id: 's1' } as never, f)).rejects.toThrow('is not #RRGGBB');
    await expect(conflictsApi.remove(routes, 'c1', fake({ error: 'not found' }, 404))).rejects.toMatchObject({
      name: 'ReferenceApiError',
      status: 404,
    });
  });

  it('posts to the engine evaluate route and maps its snake_case result', async () => {
    const step = {
      step_number: 1,
      step_name: 'Step 1: Cleanser',
      category: 'Cleanser',
      recommended_texture: 'Gel',
      primary_product: { id: 'p1', name: 'Gel Wash', brand: 'b1', category: 'Cleanser', texture: 'Gel', match_score: 87.5, why_selected: ['oil control'] },
    };
    const f = fake({
      success: true,
      match_id: 'match-1',
      brand_id: 'b1',
      application_id: 'app',
      profile_summary: { skin_type: 'Oily', profile_code: 'OSNW', skin_type_source: 'score_engine.skin_profile', primary_concerns: ['sebum'] },
      regimens: {
        phases: { morning: [step] },
        unfilled_slots: { night: [{ slot_id: 's2', category: 'Serum', required: true, reason: 'nothing passed' }] },
      },
      clinical_conflict_matrix: { conflicts_detected: 0, layering_rules_applied: null },
      evaluated_at: '2026-10-06T01:00:00Z',
    });
    const r = await runMatch({ brand_id: 'b1' }, f);
    expect(f.mock.calls[0][0]).toBe('/core/match-engine/evaluate');
    expect(r).toEqual({
      matchId: 'match-1',
      brandId: 'b1',
      applicationId: 'app',
      profileSummary: { skinType: 'Oily', profileCode: 'OSNW', skinTypeSource: 'score_engine.skin_profile', primaryConcerns: ['sebum'] },
      regimens: {
        phases: {
          morning: [
            {
              stepNumber: 1,
              stepName: 'Step 1: Cleanser',
              category: 'Cleanser',
              recommendedTexture: 'Gel',
              primaryProduct: { id: 'p1', name: 'Gel Wash', brand: 'b1', category: 'Cleanser', texture: 'Gel', matchScore: 87.5, whySelected: ['oil control'] },
            },
          ],
        },
        unfilledSlots: { night: [{ slotId: 's2', category: 'Serum', required: true, reason: 'nothing passed' }] },
      },
      clinicalConflictMatrix: { conflictsDetected: 0 },
      evaluatedAt: '2026-10-06T01:00:00Z',
    });
  });

  it('leaves a field the engine did not send absent, never a stand-in', async () => {
    const r = await runMatch({}, fake({ brand_id: 'b1', profile_summary: { skin_type: '', skin_type_unavailable: 'no skin_profile' }, regimens: {}, clinical_conflict_matrix: {} }));
    expect(r.profileSummary).toEqual({ skinTypeUnavailable: 'no skin_profile' });
    expect('matchId' in r).toBe(false);
    expect('conflictsDetected' in r.clinicalConflictMatrix).toBe(false);
    expect(r.regimens).toEqual({});
  });

  it("throws the engine's validation errors", async () => {
    // core-engine's JSONError body; ValidationErrors joins the problems with "; "
    const f = fake({ success: false, error: 'brand_id is required; dimension_scores is required: match diagnoses from them and has no defaults' }, 400);
    await expect(runMatch({}, f)).rejects.toMatchObject({
      name: 'MatchApiError',
      status: 400,
      message: 'brand_id is required; dimension_scores is required: match diagnoses from them and has no defaults',
    });
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
    // reference-service's own shape
    expect(await listReferenceIngredients(routes, fake({ data: [{ code: '1,2-hexanediol', name: '1,2-Hexanediol' }], success: true }))).toEqual([
      { code: '1,2-hexanediol', name: '1,2-Hexanediol' },
    ]);
  });
});
