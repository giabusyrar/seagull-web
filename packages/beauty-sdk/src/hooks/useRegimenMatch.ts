'use client';
import { useState, useCallback } from 'react';
import type { RecommendedProduct } from '@gateway-experience/contracts';

export function useRegimenMatch() {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const toggleProduct = useCallback((sku: string) => {
    setSelectedProducts((prev) =>
      prev.includes(sku) ? prev.filter((s) => s !== sku) : [...prev, sku]
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedProducts([]);
  }, []);

  return {
    selectedProducts,
    toggleProduct,
    clearSelection,
  };
}
