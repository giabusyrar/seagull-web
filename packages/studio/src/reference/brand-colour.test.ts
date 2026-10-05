import { describe, expect, it } from 'vitest';
import { getBrandColorTheme } from '@gateway-experience/shared';

// getBrandColorTheme is the shared brand colour helper (brandColour in
// packages/shared/src/components/brand-colour.ts) as exported today.
describe('brand colour', () => {
  it('is deterministic for an id', () => {
    expect(getBrandColorTheme('brand_a')).toBe(getBrandColorTheme('brand_a'));
  });

  it('ignores case and surrounding space', () => {
    expect(getBrandColorTheme('  Brand_A ')).toBe(getBrandColorTheme('brand_a'));
  });

  it('gives every id, including an empty one, a palette entry with a hex swatch', () => {
    for (const id of ['', 'x', 'brand_a', 'another-brand', 'zzz']) {
      expect(getBrandColorTheme(id).hex).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it('derives the colour from the id alone, with no per-brand table', () => {
    // Any id is hashed the same way: the same string gives the same entry,
    // and a set of ids spreads across more than one palette entry.
    const ids = Array.from({ length: 40 }, (_, i) => `tenant_${i}`);
    const distinct = new Set(ids.map((id) => getBrandColorTheme(id).hex));
    expect(distinct.size).toBeGreaterThan(1);
  });
});
