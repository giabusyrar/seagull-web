'use client';

import React from 'react';
import { useShadesForProduct } from './useShadeAsset';
import type { Shade } from './ShadeAssetTypes';

interface ShadeSelectorProps {
  productId: string;
  selectedShadeId?: string;
  onSelect: (shade: Shade) => void;
}

export const ShadeSelector: React.FC<ShadeSelectorProps> = ({ productId, selectedShadeId, onSelect }) => {
  const { shades, isLoading } = useShadesForProduct(productId);

  if (isLoading) {
    return <p className="text-xs text-muted-foreground">Loading shades...</p>;
  }

  if (shades.length === 0) {
    return <p className="text-xs text-muted-foreground">No shades defined for this product yet.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {shades.map((shade) => {
        const isReady = shade.extractionStatus === 'ready';
        const isSelected = shade.id === selectedShadeId;
        return (
          <button
            key={shade.id}
            type="button"
            disabled={!isReady}
            onClick={() => onSelect(shade)}
            title={isReady ? shade.name : `${shade.name} (${shade.extractionStatus})`}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition ${
              isSelected ? 'border-primary ring-2 ring-primary/40' : 'border-border'
            } ${isReady ? 'cursor-pointer hover:border-primary/60' : 'opacity-40 cursor-not-allowed'}`}
          >
            <span
              className="h-4 w-4 rounded-full border border-black/10 shrink-0"
              style={{ backgroundColor: shade.hexColor }}
            />
            <span>{shade.name}</span>
            {!isReady && <span className="text-[10px] text-muted-foreground">({shade.extractionStatus})</span>}
          </button>
        );
      })}
    </div>
  );
};
