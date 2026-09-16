'use client';

import React, { useState } from 'react';
import { Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import { DimensionSelect, InfoTooltip } from '@gateway-experience/shared';
import type { VisualAxisConfig } from '../../types';
import { defaultConcernLabel } from '../../utils/jdm-compiler';

export interface ClinicalDimensionCardProps {
  axis: VisualAxisConfig;
  index: number;
  onUpdate: (updated: VisualAxisConfig) => void;
  onDelete: () => void;
  canDelete?: boolean;
  disabled?: boolean;
  defaultOpen?: boolean;
  /** Sum of every dimension's weight — used to show this one's effective share. */
  siblingWeightTotal?: number;
}

const fieldCls =
  'w-full h-8 rounded-md bg-muted/40 border border-border px-2.5 text-foreground text-xs outline-none focus:border-ring disabled:opacity-50';

export const ClinicalDimensionCard: React.FC<ClinicalDimensionCardProps> = ({
  axis,
  index,
  onUpdate,
  onDelete,
  canDelete = true,
  disabled = false,
  defaultOpen = false,
  siblingWeightTotal,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const [fusionOpen, setFusionOpen] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);
  const formW = axis.formWeight ?? 100;
  const codeLow = axis.axisCodeLow ?? '';
  const codeHigh = axis.axisCodeHigh ?? '';
  const codeThreshold = axis.axisCodeThreshold ?? 50;
  const hasBipolar = !!(codeLow.trim() && codeHigh.trim());

  const share =
    typeof siblingWeightTotal === 'number' && siblingWeightTotal > 0
      ? Math.round((axis.weight / siblingWeightTotal) * 100)
      : null;

  const concern = axis.concernLabel || defaultConcernLabel(axis.dimensionKey);

  const handleDimensionChange = (dimKey: string, dimMeta?: { code: string; name: string }) => {
    const wasDefault = !axis.concernLabel || axis.concernLabel === defaultConcernLabel(axis.dimensionKey);
    onUpdate({
      ...axis,
      dimensionKey: dimKey,
      axisCode: dimKey.toUpperCase(),
      name: dimMeta?.name || dimKey.toUpperCase(),
      concernLabel: wasDefault ? defaultConcernLabel(dimKey) : axis.concernLabel,
    });
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* collapsed summary row */}
      <div className="flex items-center gap-2 px-3 py-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex flex-1 items-center gap-2 text-left"
        >
          {open ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
          <span className="text-sm font-semibold text-foreground">
            {axis.name || axis.dimensionKey.toUpperCase()}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {share !== null ? `≈${share}% of overall` : `weight ${axis.weight}`}
          </span>
          <span className="text-[11px] text-muted-foreground">· {concern}</span>
        </button>

        {canDelete && (
          <button
            type="button"
            disabled={disabled}
            onClick={onDelete}
            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-muted/40 rounded transition-colors disabled:opacity-30"
            title="Remove dimension"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && (
        <div className="border-t border-border p-3 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DimensionSelect
              value={axis.dimensionKey}
              disabled={disabled}
              onChange={handleDimensionChange}
              label="Dimension"
            />
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <label className="block text-[11px] font-semibold text-muted-foreground">Weight</label>
                <InfoTooltip
                  content={
                    share !== null
                      ? `Relative to the other dimensions — counts as ≈${share}% of the overall score.`
                      : 'Relative to the other dimensions.'
                  }
                  label="About weight"
                  iconClassName="h-3 w-3"
                />
              </div>
              <input
                type="number"
                min={0}
                step={1}
                disabled={disabled}
                value={axis.weight}
                onChange={(e) => onUpdate({ ...axis, weight: Number(e.target.value) })}
                className={fieldCls}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <label className="block text-[11px] font-semibold text-muted-foreground">
                Concern label
              </label>
              <InfoTooltip
                content="Shown when this dimension is the customer’s dominant concern."
                label="About concern label"
                iconClassName="h-3 w-3"
              />
            </div>
            <input
              type="text"
              disabled={disabled}
              value={axis.concernLabel ?? concern}
              onChange={(e) => onUpdate({ ...axis, concernLabel: e.target.value })}
              placeholder={defaultConcernLabel(axis.dimensionKey)}
              className={fieldCls}
            />
          </div>

          {/* Form / Vision blend — collapsed; the vision half only applies once
              camera analysis is live. */}
          <div className="rounded-md border border-border bg-muted/20">
            <button
              type="button"
              onClick={() => setFusionOpen((v) => !v)}
              className="flex w-full items-center justify-between gap-2 px-3 py-2 text-[11px] font-semibold text-muted-foreground hover:text-foreground"
            >
              <span>
                Form / Vision blend
                {formW !== 100 && (
                  <span className="ml-2 text-foreground">
                    {formW}% / {100 - formW}%
                  </span>
                )}
              </span>
              {fusionOpen ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </button>
            {fusionOpen && (
              <div className="border-t border-border px-3 py-3 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-foreground">
                    Form {formW}%
                    <InfoTooltip
                      content="Applied only when camera analysis is enabled. Default is 100% form."
                      label="About Form / Vision blend"
                      iconClassName="h-3 w-3"
                    />
                  </span>
                  <span className="text-muted-foreground">Vision {100 - formW}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  disabled={disabled}
                  value={formW}
                  onChange={(e) => onUpdate({ ...axis, formWeight: Number(e.target.value) })}
                  className="w-full h-1.5 rounded appearance-none cursor-pointer bg-muted accent-[#d97706] disabled:opacity-50"
                />
              </div>
            )}
          </div>

          {/* Bipolar code (Baumann) — collapsed. When both letters are set the
              engine tags this dimension with one of the two letters by
              threshold instead of the Optimal/Sedang/Perlu initial. */}
          <div className="rounded-md border border-border bg-muted/20">
            <button
              type="button"
              onClick={() => setCodeOpen((v) => !v)}
              className="flex w-full items-center justify-between gap-2 px-3 py-2 text-[11px] font-semibold text-muted-foreground hover:text-foreground"
            >
              <span>
                Bipolar code (Baumann)
                {hasBipolar && (
                  <span className="ml-2 text-foreground">
                    &lt;{codeThreshold} → {codeLow.toUpperCase()} · ≥{codeThreshold} → {codeHigh.toUpperCase()}
                  </span>
                )}
              </span>
              {codeOpen ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </button>
            {codeOpen && (
              <div className="border-t border-border px-3 py-3 space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-muted-foreground mb-1">
                      Below threshold
                    </label>
                    <input
                      type="text"
                      maxLength={2}
                      disabled={disabled}
                      value={codeLow}
                      onChange={(e) =>
                        onUpdate({ ...axis, axisCodeLow: e.target.value.toUpperCase().replace(/[^A-Z]/g, '') })
                      }
                      placeholder="D"
                      className={fieldCls + ' text-center font-bold text-beak'}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-muted-foreground mb-1">
                      At / above
                    </label>
                    <input
                      type="text"
                      maxLength={2}
                      disabled={disabled}
                      value={codeHigh}
                      onChange={(e) =>
                        onUpdate({ ...axis, axisCodeHigh: e.target.value.toUpperCase().replace(/[^A-Z]/g, '') })
                      }
                      placeholder="O"
                      className={fieldCls + ' text-center font-bold text-beak'}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <label className="block text-[10px] font-semibold text-muted-foreground">
                        Threshold
                      </label>
                      <InfoTooltip
                        content="Scores are health-oriented (100 = optimal), so at/above the threshold is the healthier side — e.g. sebum threshold 50: below → O (Oily), at/above → D (Dry). Leave both letters blank to fall back to the Score Range initial (O / S / P)."
                        label="About bipolar code threshold"
                        iconClassName="h-3 w-3"
                      />
                    </div>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={1}
                      disabled={disabled}
                      value={codeThreshold}
                      onChange={(e) =>
                        onUpdate({
                          ...axis,
                          axisCodeThreshold: Math.max(0, Math.min(100, Number(e.target.value) || 0)),
                        })
                      }
                      className={fieldCls + ' text-center'}
                    />
                  </div>
                </div>
                {(codeLow.trim() ? 1 : 0) + (codeHigh.trim() ? 1 : 0) === 1 && (
                  <p className="text-[10px] text-destructive">
                    Set both letters, or clear both — one letter alone is ignored.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Backwards compatibility alias
export const ClinicalAxisCard = ClinicalDimensionCard;
export type ClinicalAxisCardProps = ClinicalDimensionCardProps;
