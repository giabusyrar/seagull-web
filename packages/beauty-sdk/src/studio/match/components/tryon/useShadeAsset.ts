'use client';

import { useEffect, useState } from 'react';
import { resolveDynamicEndpoint } from '../../../../core/collection-resolver';
import type { Shade } from './ShadeAssetTypes';

export function useShadesForProduct(productId: string) {
  const [shades, setShades] = useState<Shade[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!productId) {
      setShades([]);
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    const endpoint = resolveDynamicEndpoint('match', `/api/matching/shades?product_id=${encodeURIComponent(productId)}`);
    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && Array.isArray(data.shades)) setShades(data.shades);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  return { shades, isLoading };
}
