'use client';

import { useEffect, useState } from 'react';

export interface BrandOption {
  id: string;
  name: string;
}

interface State {
  brands: BrandOption[];
  /** productId → brandId, from reference-service's product master. */
  brandOf: Map<string, string>;
  ready: boolean;
}

const EMPTY: State = { brands: [], brandOf: new Map(), ready: false };

/**
 * Which brand each catalog product belongs to. The colour engine's catalog
 * carries no brand; its productIds are reference-service product ids
 * (ref_products is the product master), whose rows do. Read once from
 * GET /api/reference/brands and /api/reference/products. When either fails
 * the map stays empty and `ready` false, and callers show every product
 * rather than guess a brand.
 */
export function useProductBrands(): State {
  const [state, setState] = useState<State>(EMPTY);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [b, p] = await Promise.all([fetch('/api/reference/brands'), fetch('/api/reference/products')]);
        if (!b.ok || !p.ok) return;
        const brands = ((await b.json()).data ?? []) as { id: string; name: string }[];
        const products = ((await p.json()).data ?? []) as { id: string; brandId: string | null }[];
        if (cancelled) return;
        setState({
          brands: brands.map(({ id, name }) => ({ id, name })),
          brandOf: new Map(products.filter((x) => x.brandId).map((x) => [x.id, x.brandId as string])),
          ready: true,
        });
      } catch {
        // Unreachable reference service: no brand filter, every product shown.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
