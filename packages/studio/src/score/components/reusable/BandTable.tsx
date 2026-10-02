'use client';

import React from 'react';
import type { VisualBand } from '../../types';

export interface BandTableProps {
  bands: VisualBand[];
  onChange: (bands: VisualBand[]) => void;
  disabled?: boolean;
  /** Fixed row count — bands can be re-labelled and re-bounded but not added/removed. */
  fixed?: boolean;
  idPrefix?: string;
}

/**
 * Editor for a set of contiguous score bands (0..100, health-oriented — 100 = optimal).
 * Each row owns an upper bound `max`; the lower bound is the previous row's
 * `max + 1` (0 for the first row). Editing a `max` keeps the list sorted.
 */
export const BandTable: React.FC<BandTableProps> = ({
  bands,
  onChange,
  disabled = false,
  fixed = false,
  idPrefix = 'band',
}) => {
  const setMax = (idx: number, raw: number) => {
    const next = bands.map((b) => ({ ...b }));
    const lower = idx === 0 ? 0 : next[idx - 1].max + 1;
    const upper = idx === next.length - 1 ? 100 : next[idx + 1].max - 1;
    next[idx].max = Math.max(lower, Math.min(upper, Math.round(raw)));
    onChange(next);
  };

  const setLabel = (idx: number, label: string) => {
    const next = bands.map((b) => ({ ...b }));
    next[idx].label = label;
    onChange(next);
  };

  const addRow = () => {
    const last = bands[bands.length - 1];
    const prev = bands[bands.length - 2];
    const mid = prev ? Math.round((prev.max + last.max) / 2) : Math.max(1, last.max - 1);
    const inserted: VisualBand = { id: `${idPrefix}_${Date.now()}`, max: mid, label: 'New band' };
    onChange([...bands.slice(0, -1), inserted, last]);
  };

  const removeRow = (idx: number) => {
    if (bands.length <= 2) return;
    onChange(bands.filter((_, i) => i !== idx));
  };

  return (
    <div className="rounded-md border border-border bg-card divide-y divide-border">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/20 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        <span className="w-24 shrink-0">Score</span>
        <span className="flex-1">Label</span>
        {!fixed && <span className="w-6 shrink-0" aria-hidden="true" />}
      </div>
      {bands.map((b, idx) => {
        const lower = idx === 0 ? 0 : bands[idx - 1].max + 1;
        return (
          <div key={b.id} className="flex items-center gap-2 px-3 py-2">
            <div className="flex w-24 shrink-0 items-center gap-1 text-xs tabular-nums text-muted-foreground">
              <span className="w-6 text-right">{lower}</span>
              <span>–</span>
              <input
                type="number"
                min={lower}
                max={100}
                disabled={disabled || idx === bands.length - 1}
                value={b.max}
                onChange={(e) => setMax(idx, Number(e.target.value))}
                className="w-12 h-7 rounded bg-muted/40 border border-border px-1 text-center text-foreground text-xs outline-none focus:border-ring disabled:opacity-60"
              />
            </div>
            <input
              type="text"
              disabled={disabled}
              value={b.label}
              onChange={(e) => setLabel(idx, e.target.value)}
              placeholder="e.g. Optimal"
              className="flex-1 min-w-0 h-7 rounded-md bg-muted/40 border border-border px-2.5 text-foreground text-xs outline-none focus:border-ring disabled:opacity-50"
            />
            {!fixed && (
              <button
                type="button"
                disabled={disabled || bands.length <= 2}
                onClick={() => removeRow(idx)}
                className="w-6 shrink-0 text-muted-foreground hover:text-destructive disabled:opacity-30 text-sm"
                title="Remove band"
              >
                ×
              </button>
            )}
          </div>
        );
      })}
      {!fixed && (
        <div className="px-3 py-1.5">
          <button
            type="button"
            disabled={disabled}
            onClick={addRow}
            className="text-[11px] text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            + Add band
          </button>
        </div>
      )}
    </div>
  );
};
