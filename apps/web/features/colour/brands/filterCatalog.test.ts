import { describe, expect, it } from 'vitest';
import type { Catalog, CatalogShade } from '../types';
import { brandsInCatalog, filterCatalog } from './filterCatalog';

const shade = (productId: string, shadeId: string): CatalogShade => ({
  shadeId,
  productId,
  productName: productId,
  shadeName: shadeId,
  hexColor: '#000000',
  hueName: '',
  status: '',
  colourSource: 'swatch',
  mode: '',
});

const catalog: Catalog = {
  lip: [shade('p1', 's1'), shade('p1', 's2'), shade('p2', 's3')],
  blush: [shade('p3', 's4'), shade('p9', 's5')],
};
const brandOf = new Map([
  ['p1', 'mo'],
  ['p2', 'wd'],
  ['p3', 'mo'],
]);
const brands = [
  { id: 'wd', name: 'Wardah' },
  { id: 'mo', name: 'Make Over' },
  { id: 'omg', name: 'OMG' },
];

describe('brandsInCatalog', () => {
  it('lists only brands with products here, counting products not shades', () => {
    expect(brandsInCatalog(catalog, brands, brandOf)).toEqual([
      { id: 'mo', name: 'Make Over', products: 2 },
      { id: 'wd', name: 'Wardah', products: 1 },
    ]);
  });
});

describe('filterCatalog', () => {
  it('keeps one brand in every category', () => {
    const out = filterCatalog(catalog, 'mo', brandOf);
    expect(out.lip.map((s) => s.shadeId)).toEqual(['s1', 's2']);
    expect(out.blush.map((s) => s.shadeId)).toEqual(['s4']);
  });

  it('keeps everything for no brand, including products with no known brand', () => {
    expect(filterCatalog(catalog, '', brandOf)).toBe(catalog);
  });

  it('drops a product whose brand is unknown once a brand is picked', () => {
    expect(filterCatalog(catalog, 'mo', brandOf).blush.some((s) => s.productId === 'p9')).toBe(false);
  });
});
