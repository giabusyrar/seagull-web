'use client';

import React from 'react';
import { cn } from '@gateway-experience/shared';

export type YesNo = 'yes' | 'no' | '';

/** A required yes/no question; '' until answered. */
export function YesNoField({ label, value, onChange }: { label: string; value: YesNo; onChange: (v: YesNo) => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <span className="text-foreground">{label}</span>
      <div className="flex gap-1 rounded-xl border border-border bg-secondary/50 p-1">
        {(['yes', 'no'] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={cn(
              'px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer',
              value === v ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {v === 'yes' ? 'Ya' : 'Tidak'}
          </button>
        ))}
      </div>
    </div>
  );
}
