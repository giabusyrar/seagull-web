import { describe, it, expect } from 'vitest';
import { analyzeColour, faceArchitecture, faceHead, skinAnalyze, tryOn, groupShades, toggleShade } from '@/lib/photo';
import { catalogOf } from '@/lib/types/colour';

const img = (name: string) => new File([new Uint8Array([1, 2, 3])], name, { type: 'image/jpeg' });
const front = img('front.jpg');
const left = img('left.jpg');
const right = img('right.jpg');
const brand = { brandId: 'WARDAH', applicationId: 'skinverse' };
const form = (init: RequestInit) => init.body as FormData;

describe('analyzeColour', () => {
  it('posts image and bools as "true"/"false" to core colour-engine', () => {
    const { url, init } = analyzeColour(front, true, false);
    expect(url).toBe('/svc/core/core/colour-engine/analyze');
    expect(init.method).toBe('POST');
    const fd = form(init);
    expect(fd.get('image')).toBeInstanceOf(File);
    expect((fd.get('image') as File).name).toBe('front.jpg');
    expect(fd.get('hijab')).toBe('true');
    expect(fd.get('hairVisible')).toBe('false');
  });
  it('encodes the opposite answers', () => {
    const fd = form(analyzeColour(front, false, true).init);
    expect(fd.get('hijab')).toBe('false');
    expect(fd.get('hairVisible')).toBe('true');
  });
  it('sets no content-type header (browser adds the boundary)', () => {
    expect(analyzeColour(front, false, false).init.headers).toBeUndefined();
  });
});

describe('faceArchitecture', () => {
  it('puts brand and app in the path', () => {
    const { url, init } = faceArchitecture(front, brand);
    expect(url).toBe('/svc/core/core/face-architecture/WARDAH/skinverse');
    expect(init.method).toBe('POST');
    expect([...form(init).keys()]).toEqual(['image']);
  });
  it('encodes path segments', () => {
    expect(faceArchitecture(front, { brandId: 'A B', applicationId: 'x/y' }).url).toBe('/svc/core/core/face-architecture/A%20B/x%2Fy');
  });
  it('refuses an empty brand or app', () => {
    expect(() => faceArchitecture(front, { brandId: '', applicationId: 'skinverse' })).toThrow(/brand/);
    expect(() => faceArchitecture(front, { brandId: 'WARDAH', applicationId: ' ' })).toThrow(/application/);
  });
});

describe('faceHead', () => {
  it('sends front only when no side photos', () => {
    const { url, init } = faceHead({ front }, brand);
    expect(url).toBe('/svc/core/core/face-architecture/WARDAH/skinverse/head');
    expect([...form(init).keys()]).toEqual(['front']);
  });
  it('adds left and right when present', () => {
    const fd = form(faceHead({ front, left, right }, brand).init);
    expect([...fd.keys()]).toEqual(['front', 'left', 'right']);
    expect((fd.get('left') as File).name).toBe('left.jpg');
  });
});

describe('skinAnalyze', () => {
  it('sends image_front plus camelCase brand fields', () => {
    const { url, init } = skinAnalyze({ front }, brand);
    expect(url).toBe('/svc/core/core/vision-engine/analyze-image');
    const fd = form(init);
    expect([...fd.keys()]).toEqual(['image_front', 'brandId', 'applicationId']);
    expect(fd.get('brandId')).toBe('WARDAH');
    expect(fd.get('applicationId')).toBe('skinverse');
  });
  it('adds optional side photos', () => {
    const fd = form(skinAnalyze({ front, right }, brand).init);
    expect([...fd.keys()]).toEqual(['image_front', 'image_right', 'brandId', 'applicationId']);
  });
});

describe('tryOn', () => {
  it('sends the image and one shadeIds field per shade', () => {
    const { url, init } = tryOn(front, ['s2', 's1']);
    expect(url).toBe('/svc/core/core/colour-engine/tryon');
    const fd = form(init);
    expect(fd.get('image')).toBeInstanceOf(File);
    expect(fd.getAll('shadeIds')).toEqual(['s2', 's1']);
  });
  it('drops empty ids', () => {
    expect(form(tryOn(front, ['', 's1']).init).getAll('shadeIds')).toEqual(['s1']);
  });
});

const shade = (id: string) => ({ shadeId: id, productId: 'p', productName: 'P', shadeName: id, hexColor: '#aa0000', hueName: '', status: '' as const, colourSource: 'cube' as const, mode: '' });

describe('groupShades', () => {
  it('orders Complexion, Lip, Eye, Blush, Other and skips empty categories', () => {
    const catalog = { zzz: [shade('z')], blush: [shade('b')], lip: [shade('l')], brow: [shade('br')], eyeshadow: [shade('e')], complexion: [shade('c')], mascara: [] };
    const groups = groupShades(catalog);
    expect(groups.map((g) => g.label)).toEqual(['Complexion', 'Lip', 'Eye', 'Blush', 'Other']);
    expect(groupShades(catalog, 'id').map((g) => g.label).at(-1)).toBe('Lainnya');
    expect(groupShades(catalog, 'id')[1].categories[0].label).toBe('Lipstik');
    expect(groups[2].categories.map((c) => c.category)).toEqual(['eyeshadow', 'brow']);
    expect(groups[4].categories).toEqual([{ category: 'zzz', label: 'zzz', shades: [shade('z')] }]);
  });
  it('returns nothing for an empty or missing catalog', () => {
    expect(groupShades({})).toEqual([]);
    expect(groupShades(undefined)).toEqual([]);
  });
  it('ignores non-array entries', () => {
    expect(groupShades({ lip: null as unknown as [] })).toEqual([]);
  });
});

describe('toggleShade', () => {
  it('selects one shade per category', () => {
    let sel = toggleShade({}, 'lip', 'l1');
    expect(sel).toEqual({ lip: 'l1' });
    sel = toggleShade(sel, 'lip', 'l2');
    expect(sel).toEqual({ lip: 'l2' });
    sel = toggleShade(sel, 'blush', 'b1');
    expect(sel).toEqual({ lip: 'l2', blush: 'b1' });
  });
  it('unselects when the same shade is picked again', () => {
    expect(toggleShade({ lip: 'l1', blush: 'b1' }, 'lip', 'l1')).toEqual({ blush: 'b1' });
  });
  it('does not mutate the input', () => {
    const sel = { lip: 'l1' };
    toggleShade(sel, 'lip', 'l2');
    expect(sel).toEqual({ lip: 'l1' });
  });
});

describe('catalogOf', () => {
  it('prefers the catalog field', () => {
    expect(catalogOf({ catalog: { lip: [shade('l')] }, recommendations: { lip: [] } })).toEqual({ lip: [shade('l')] });
  });
  it('falls back to recommendations', () => {
    const { mode: _m, ...rec } = shade('l'); void _m;
    expect(catalogOf({ recommendations: { lip: [rec] } })).toEqual({ lip: [{ ...rec, mode: '' }] });
  });
  it('is empty for a missing or odd body', () => {
    expect(catalogOf(undefined)).toEqual({});
    expect(catalogOf({ recommendations: { lip: 'x' } } as never)).toEqual({});
  });
});
