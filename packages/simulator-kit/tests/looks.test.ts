import { describe, expect, it } from 'vitest';
import { listLooks, notRenderedHeader, resolveLook, tryOnLook } from '@/lib/looks';

const brand = { brandId: 'MAKEOVER', applicationId: 'skinverse' };
const photo = new File(['x'], 'front.jpg', { type: 'image/jpeg' });

describe('looks requests', () => {
  it('lists the brand and application looks', () => {
    expect(listLooks(brand).url).toBe('/svc/core/core/colour-engine/looks?brand_id=MAKEOVER&application_id=skinverse');
  });

  it('resolves and renders from the photo, with the colourway only when picked', () => {
    const r = resolveLook(brand, 'soft glam', photo, { colourway: 'warm', hijab: true, hairVisible: false });
    expect(r.url).toBe('/svc/core/core/colour-engine/looks/soft%20glam/resolve?brand_id=MAKEOVER&application_id=skinverse');
    const fd = r.init.body as FormData;
    expect([fd.get('brand_id'), fd.get('application_id'), fd.get('colourway'), fd.get('hijab'), fd.get('hairVisible')]).toEqual(['MAKEOVER', 'skinverse', 'warm', 'true', 'false']);
    expect(fd.get('image')).toBeInstanceOf(File);
    const t = tryOnLook(brand, 'x', photo, { hijab: false, hairVisible: true });
    expect(t.url).toMatch(/\/looks\/x\/tryon\?brand_id=MAKEOVER&application_id=skinverse$/);
    expect((t.init.body as FormData).has('colourway')).toBe(false);
  });

  it('reads X-Not-Rendered when the browser can, else nothing', () => {
    expect(notRenderedHeader([['X-Not-Rendered', '{"lip":"no_shade_suits"}']])).toEqual({ lip: 'no_shade_suits' });
    expect(notRenderedHeader([['content-type', 'image/png']])).toBeNull();
    expect(notRenderedHeader([['x-not-rendered', 'not json']])).toBeNull();
  });
});
