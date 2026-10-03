'use client';

import { useEffect, useState } from 'react';
import { shadesApi } from '../../api';
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
    shadesApi
      .list(productId)
      .then((list) => {
        if (!cancelled && list) setShades(list);
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
