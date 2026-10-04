'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Trash2, ChevronRight, ChevronDown, Plus } from 'lucide-react';
import { DimensionSelect, InfoTooltip, useHostRoutes } from '@gateway-experience/shared';
import type { VisualAxisConfig, InputSource, ThresholdBand } from '../../types';
import { defaultConcernLabel } from '../../utils/jdm-compiler';
import { listSkinConditions } from '../../api';

/** One selectable CV capability, flattened from ref_skin_conditions —
 *  a condition can list several (e.g. "wrinkle" -> score_wrinkle), each
 *  becomes its own option. Registered in reference-service, same pattern as
 *  DimensionSelect's dimensions -- never a hardcoded list in this bundle. */
export function useVisionFields() {
  const [conditions, setConditions] = useState<
    Array<{ code: string; name: string; visionCapabilities?: string[] }>
  >([]);
  const hostRoutes = useHostRoutes();
  useEffect(() => {
    listSkinConditions(hostRoutes)
      .then(setConditions)
      .catch(() => {});
  }, [hostRoutes]);
  return useMemo(
    () =>
      conditions.flatMap((c) =>
        (c.visionCapabilities || []).map((cap) => ({ code: cap, label: `${c.name} (${cap})` })),
      ),
    [conditions],
  );
}

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

/** One input source picker. Always a registered catalog entry — a
 *  reference-service dimension for 'form', or ref_skin_conditions'
 *  visionCapabilities for 'vision' — never free text, so a ruleset's
 *  field_mapping stays a real, checkable spec instead of a typo-prone
 *  string. Lives here but is also used by BlendingTab, which owns the
 *  actual per-axis rule editor (composition + bands) — this card just
 *  shows weight/concern label. */
export const SourcePicker: React.FC<{
  label: string;
  origin: 'form' | 'vision';
  onOriginChange?: (origin: 'form' | 'vision') => void;
  value?: InputSource;
  onChange: (source: InputSource | undefined) => void;
  disabled?: boolean;
}> = ({ label, origin, onOriginChange, value, onChange, disabled }) => {
  const visionFields = useVisionFields();
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-[10px] font-semibold text-muted-foreground">{label}</label>
        {onOriginChange && (
          <div className="flex gap-1">
            {(['form', 'vision'] as const).map((o) => (
              <button
                key={o}
                type="button"
                disabled={disabled}
                onClick={() => onOriginChange(o)}
                className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${
                  origin === o ? 'border-beak bg-beak/10 text-beak' : 'border-border text-muted-foreground'
                }`}
              >
                {o}
              </button>
            ))}
          </div>
        )}
      </div>
      {origin === 'form' ? (
        <DimensionSelect
          value={value?.fieldCode || ''}
          disabled={disabled}
          onChange={(code, meta) => onChange(code ? { origin: 'form', fieldCode: code, label: meta?.name || code } : undefined)}
          label=""
        />
      ) : (
        <select
          disabled={disabled}
          value={value?.fieldCode || ''}
          onChange={(e) => {
            const code = e.target.value;
            const meta = visionFields.find((f) => f.code === code);
            onChange(code ? { origin: 'vision', fieldCode: code, label: meta?.label || code } : undefined);
          }}
          className={fieldCls}
        >
          <option value="">— pilih field CV (dari ref_skin_conditions) —</option>
          {visionFields.map((f) => (
            <option key={f.code} value={f.code}>
              {f.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

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

          <p className="text-[10px] text-muted-foreground italic">
            How this axis's number is computed (form/vision source, blend %) and turned into a
            letter (bands) is set in the Blending tab, not here.
          </p>
        </div>
      )}
    </div>
  );
};

// Backwards compatibility alias
export const ClinicalAxisCard = ClinicalDimensionCard;
export type ClinicalAxisCardProps = ClinicalDimensionCardProps;
