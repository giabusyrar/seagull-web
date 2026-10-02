'use client';

import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { ScoreRangeInput, SeveritySelect } from '@gateway-experience/shared';
import type { VisualSeverityTier } from '../../types';

export interface SeverityTierTableProps {
  tiers: VisualSeverityTier[];
  onChange: (tiers: VisualSeverityTier[]) => void;
  disabled?: boolean;
  /** Show the short letter code per level (only used by the Combination Matrix profile strategy). */
  showValueCode?: boolean;
}

const SEV_LABEL: Record<string, string> = {
  optimal: 'Level 5 · Healthy',
  mild: 'Level 4 · Mild',
  moderate: 'Level 3 · Moderate',
  severe: 'Level 2 · Poor',
  critical: 'Level 1 · Critical',
};

const fieldCls =
  'h-8 rounded-md bg-muted/40 border border-border px-2.5 text-foreground text-xs outline-none focus:border-ring disabled:opacity-50';

// Fixed column widths (px) for the customize view — kept as inline styles so they
// don't depend on Tailwind scanning dynamically-built class names.
const W_RANGE = 160;
const W_SEVERITY = 160;
const W_CODE = 48;
const W_TAG = 112;
const W_DELETE = 28;

export const SeverityTierTable: React.FC<SeverityTierTableProps> = ({
  tiers,
  onChange,
  disabled = false,
  showValueCode = false,
}) => {
  const [customize, setCustomize] = useState(false);

  const update = (id: string, patch: Partial<VisualSeverityTier>) =>
    onChange(tiers.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const addLevel = () => {
    const last = tiers[tiers.length - 1];
    onChange([
      ...tiers,
      {
        id: `t_${Date.now()}`,
        minScore: last ? Math.min(100, last.maxScore + 1) : 0,
        maxScore: 100,
        valueCode: 'X',
        gradeName: `Level ${tiers.length + 1}`,
        severity: 'optimal',
        trait: 'Normal',
      },
    ]);
  };

  const rowMinWidth =
    W_RANGE + 140 + W_SEVERITY + (showValueCode ? W_CODE + 8 : 0) + W_TAG + W_DELETE + 4 * 8;

  return (
    <div className="rounded-md border border-border bg-card">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-[11px] font-semibold text-muted-foreground">Score &rarr; level</span>
        <button
          type="button"
          onClick={() => setCustomize((v) => !v)}
          className="text-[11px] text-muted-foreground hover:text-foreground underline"
        >
          {customize ? 'Done' : 'Customize levels'}
        </button>
      </div>

      {!customize && (
        <div className="divide-y divide-border">
          {tiers.map((tier) => (
            <div key={tier.id} className="flex items-center gap-3 px-3 py-2">
              <span className="w-16 shrink-0 text-xs tabular-nums text-muted-foreground">
                {tier.minScore}&ndash;{tier.maxScore}
              </span>
              <input
                type="text"
                disabled={disabled}
                value={tier.gradeName}
                onChange={(e) => update(tier.id, { gradeName: e.target.value })}
                placeholder="e.g. Balanced"
                className={`flex-1 min-w-0 ${fieldCls}`}
              />
              {showValueCode && (
                <span className="w-7 shrink-0 text-center text-xs font-semibold text-beak">
                  {tier.valueCode}
                </span>
              )}
              <span className="w-36 shrink-0 text-right text-[11px] text-muted-foreground">
                {SEV_LABEL[tier.severity] ?? tier.severity}
              </span>
            </div>
          ))}
        </div>
      )}

      {customize && (
        <div className="overflow-x-auto">
          <div style={{ minWidth: rowMinWidth }}>
            {/* header */}
            <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border bg-muted/20 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              <span className="shrink-0" style={{ width: W_RANGE }}>Range</span>
              <span className="flex-1 min-w-0">Label</span>
              <span className="shrink-0" style={{ width: W_SEVERITY }}>Severity</span>
              {showValueCode && (
                <span className="shrink-0 text-center" style={{ width: W_CODE }}>Code</span>
              )}
              <span className="shrink-0" style={{ width: W_TAG }}>Tag</span>
              <span className="shrink-0" style={{ width: W_DELETE }} aria-hidden="true" />
            </div>

            <div className="divide-y divide-border">
              {tiers.map((tier) => (
                <div key={tier.id} className="flex items-center gap-2 px-3 py-2">
                  <div className="shrink-0" style={{ width: W_RANGE }}>
                    <ScoreRangeInput
                      minScore={tier.minScore}
                      maxScore={tier.maxScore}
                      disabled={disabled}
                      onChange={(min, max) => update(tier.id, { minScore: min, maxScore: max })}
                    />
                  </div>
                  <input
                    type="text"
                    disabled={disabled}
                    value={tier.gradeName}
                    onChange={(e) => update(tier.id, { gradeName: e.target.value })}
                    placeholder="e.g. Balanced"
                    className={`flex-1 min-w-0 ${fieldCls}`}
                  />
                  <div className="shrink-0" style={{ width: W_SEVERITY }}>
                    <SeveritySelect
                      value={tier.severity}
                      disabled={disabled}
                      onChange={(sev) => update(tier.id, { severity: sev as VisualSeverityTier['severity'] })}
                    />
                  </div>
                  {showValueCode && (
                    <input
                      type="text"
                      disabled={disabled}
                      value={tier.valueCode}
                      onChange={(e) => update(tier.id, { valueCode: e.target.value.toUpperCase().slice(0, 2) })}
                      placeholder="D"
                      title="Short code for this level (Combination Matrix)"
                      className={`shrink-0 h-8 rounded-md bg-muted/40 border border-border px-1 text-center text-beak text-xs font-semibold outline-none focus:border-ring disabled:opacity-50`}
                      style={{ width: W_CODE }}
                    />
                  )}
                  <input
                    type="text"
                    disabled={disabled}
                    value={tier.trait}
                    onChange={(e) => update(tier.id, { trait: e.target.value })}
                    placeholder="tag"
                    title="Concern tag surfaced when this level is hit"
                    className={`shrink-0 ${fieldCls}`}
                    style={{ width: W_TAG }}
                  />
                  <button
                    type="button"
                    disabled={disabled || tiers.length <= 1}
                    onClick={() => tiers.length > 1 && onChange(tiers.filter((t) => t.id !== tier.id))}
                    className="shrink-0 flex h-7 items-center justify-center rounded text-muted-foreground hover:text-destructive disabled:opacity-30"
                    style={{ width: W_DELETE }}
                    title="Remove level"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {customize && (
        <div className="px-3 py-2 border-t border-border">
          <button
            type="button"
            disabled={disabled}
            onClick={addLevel}
            className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 disabled:opacity-50"
          >
            <Plus className="h-3 w-3" />
            Add level
          </button>
        </div>
      )}
    </div>
  );
};
