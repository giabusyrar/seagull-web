import type { Catalog } from '../types';
import type { BrandOption } from './useProductBrands';

export interface BrandCount extends BrandOption {
  /** Products of this brand in the catalog. */
  products: number;
}

/** The brands that have products in this catalog, with their product counts, by name. */
export function brandsInCatalog(catalog: Catalog, brands: BrandOption[], brandOf: Map<string, string>): BrandCount[] {
  const products = new Map<string, Set<string>>();
  for (const shades of Object.values(catalog)) {
    for (const s of shades) {
      const b = brandOf.get(s.productId);
      if (!b) continue;
      if (!products.has(b)) products.set(b, new Set());
      products.get(b)!.add(s.productId);
    }
  }
  return brands
    .filter((b) => products.has(b.id))
    .map((b) => ({ ...b, products: products.get(b.id)!.size }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** The catalog narrowed to one brand; '' keeps every product. */
export function filterCatalog(catalog: Catalog, brandId: string, brandOf: Map<string, string>): Catalog {
  if (!brandId) return catalog;
  const out: Catalog = {};
  for (const [category, shades] of Object.entries(catalog)) {
    out[category] = shades.filter((s) => brandOf.get(s.productId) === brandId);
  }
  return out;
}
