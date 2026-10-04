'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Trash2, ChevronRight, ChevronDown, Plus } from 'lucide-react';
import { DimensionSelect, InfoTooltip, useHostRoutes } from '@gateway-experience/shared';
import type { VisualAxisConfig, ThresholdBand } from '../../types';
import { FORM_SOURCE, VISION_SOURCE } from '../../types';
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

/** The field one source feeds an axis from. Form and vision pick from their
 *  registered catalogs (reference-service dimensions; ref_skin_conditions'
 *  visionCapabilities), never free text, so the ruleset stays a checkable
 *  spec. Any other declared source (a device, a lab) has no catalog here, so
 *  its field is named directly, as that source's signals name it. */
export const FieldPicker: React.FC<{
  source: string;
  field: string;
  onChange: (field: string, label: string) => void;
  disabled?: boolean;
}> = ({ source, field, onChange, disabled }) => {
  const visionFields = useVisionFields();
  if (source === FORM_SOURCE) {
    return (
      <DimensionSelect
        value={field}
        disabled={disabled}
        onChange={(code, meta) => onChange(code || '', meta?.name || code || '')}
        label=""
      />
    );
  }
  if (source === VISION_SOURCE) {
    const known = visionFields.some((f) => f.code === field);
    return (
      <select
        disabled={disabled}
        value={field}
        onChange={(e) => {
          const code = e.target.value;
          onChange(code, visionFields.find((f) => f.code === code)?.label || code);
        }}
        className={fieldCls}
      >
        <option value="">— pick a CV field (ref_skin_conditions) —</option>
        {field && !known && <option value={field}>{field}</option>}
        {visionFields.map((f) => (
          <option key={`${f.code}:${f.label}`} value={f.code}>
            {f.label}
          </option>
        ))}
      </select>
    );
  }
  return (
    <input
      type="text"
      disabled={disabled}
      value={field}
      placeholder={`${source} field, e.g. its signal name`}
      onChange={(e) => onChange(e.target.value.trim(), e.target.value.trim())}
      className={fieldCls + ' font-mono'}
    />
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
            How this axis's number is computed (its sources and their weights) and turned into a
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
