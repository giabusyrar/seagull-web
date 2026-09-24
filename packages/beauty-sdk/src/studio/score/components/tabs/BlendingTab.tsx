'use client';

import React, { useState, useEffect } from 'react';
import { Sliders, Check, AlertTriangle, Trash2, Plus } from 'lucide-react';
import { EmptyState, Button, InfoTooltip } from '@gateway-experience/shared';
import type { ScoreRuleset, VisualAxisConfig, ThresholdBand } from '../../types';
import { decompileJDMToVisualComponents, compileVisualToJDM } from '../../utils/jdm-compiler';
import { SourcePicker } from '../reusable/ClinicalAxisCard';

const fieldCls =
  'h-8 rounded-md bg-muted/40 border border-border px-2.5 text-foreground text-xs outline-none focus:border-ring disabled:opacity-50';

interface BlendingTabProps {
  rulesets: ScoreRuleset[];
  selectedRuleset: ScoreRuleset | null;
  onSelectRuleset: (ruleset: ScoreRuleset) => void;
  onSaveRuleset: (updated: Partial<ScoreRuleset>) => Promise<void>;
}

export const BlendingTab: React.FC<BlendingTabProps> = ({
  rulesets,
  selectedRuleset,
  onSelectRuleset,
  onSaveRuleset,
}) => {
  const activeRuleset = selectedRuleset || rulesets[0] || null;

  const [axes, setAxes] = useState<VisualAxisConfig[]>([]);
  const [profileConfig, setProfileConfig] = useState<ReturnType<typeof decompileJDMToVisualComponents>['profileConfig'] | null>(null);
  const [scoreRangeBands, setScoreRangeBands] = useState<ReturnType<typeof decompileJDMToVisualComponents>['scoreRangeBands'] | null>(null);
  const [severityBands, setSeverityBands] = useState<ReturnType<typeof decompileJDMToVisualComponents>['severityBands'] | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (activeRuleset && activeRuleset.schema) {
      try {
        const decompiled = decompileJDMToVisualComponents(activeRuleset.schema);
        setAxes(decompiled.axes);
        setProfileConfig(decompiled.profileConfig);
        setScoreRangeBands(decompiled.scoreRangeBands);
        setSeverityBands(decompiled.severityBands);
        setSaveError(null);
      } catch (err) {
        setSaveError('Could not read this ruleset: ' + (err instanceof Error ? err.message : 'invalid schema'));
      }
    }
  }, [activeRuleset]);

  const updateAxis = (id: string, patch: Partial<VisualAxisConfig>) =>
    setAxes((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));

  const handleSave = async () => {
    if (!activeRuleset || !profileConfig || !scoreRangeBands || !severityBands) return;
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);
    try {
      const updatedSchema = compileVisualToJDM(axes, profileConfig, scoreRangeBands, severityBands, activeRuleset.schema);
      await onSaveRuleset({
        id: activeRuleset.id,
        code: activeRuleset.code,
        title: activeRuleset.title,
        description: activeRuleset.description,
        brandId: activeRuleset.brandId,
        applicationId: activeRuleset.applicationId,
        status: activeRuleset.status,
        schema: updatedSchema,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save blending weights');
    } finally {
      setIsSaving(false);
    }
  };

  if (!activeRuleset) {
    return (
      <EmptyState
        icon={<Sliders className="h-6 w-6 text-muted-foreground" />}
        title="No grading model selected"
        description="Create or pick a grading model to set its blending weights."
        className="py-16 rounded-lg border border-border bg-card"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 min-w-0">
          <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
            Grading model
          </span>
          <select
            value={activeRuleset.id}
            onChange={(e) => {
              const r = rulesets.find((item) => item.id === e.target.value);
              if (r) onSelectRuleset(r);
            }}
            className="h-8 max-w-md w-full truncate rounded-md bg-muted/40 border border-border px-2.5 text-foreground text-xs outline-none focus:border-ring"
            style={{ colorScheme: 'dark' }}
          >
            {rulesets.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title} ({r.code} v{r.version})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {saveSuccess && (
            <span className="text-xs text-beak flex items-center gap-1">
              <Check className="h-3.5 w-3.5" />
              Saved
            </span>
          )}
          <Button variant="primary" size="sm" onClick={handleSave} isLoading={isSaving}>
            {isSaving ? 'Saving…' : 'Save blending'}
          </Button>
        </div>
      </div>

      {saveError && (
        <div className="p-3 rounded-md border border-destructive/40 bg-destructive/10 text-xs text-destructive flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card p-4 space-y-1">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-bold text-foreground">Per-dimension blend</h3>
          <InfoTooltip
            content="For each dimension, how much of its score comes from the questionnaire (form) vs. vision (camera analysis). Only applies once vision_signals is sent for that dimension — a form-only dimension with no matching vision_signals key ignores this and stays 100% form regardless of the slider."
            label="About blending"
          />
        </div>
        <p className="text-[11px] text-muted-foreground">
          e.g. set Sebum to 0% form / 100% vision to trust vision fully for that dimension.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card divide-y divide-border">
        {axes.length === 0 && (
          <div className="p-6 text-center text-xs text-muted-foreground italic">
            This ruleset has no dimensions yet — add some in Skin Grading first.
          </div>
        )}
        {axes.map((axis) => {
          const formW = axis.formWeight ?? 50;
          const composition =
            axis.inputComposition ||
            (axis.source ? 'single_source' : axis.formSource || axis.visionSource ? 'weighted_blend' : 'single_source');
          const singleOrigin = axis.source?.origin || 'form';
          const bands = axis.bands || [];

          const updateBand = (id: string, patch: Partial<ThresholdBand>) =>
            updateAxis(axis.id, { bands: bands.map((b) => (b.id === id ? { ...b, ...patch } : b)) });
          const addBand = () =>
            updateAxis(axis.id, { bands: [...bands, { id: `b_${Date.now()}`, min: 0, max: 100, letter: '' }] });
          const removeBand = (id: string) => updateAxis(axis.id, { bands: bands.filter((b) => b.id !== id) });

          return (
            <div key={axis.id} className="p-3.5 space-y-3">
              <span className="text-sm font-semibold text-foreground block">
                {axis.name || axis.dimensionKey.toUpperCase()}
              </span>

              <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-md border border-border w-fit">
                {(['single_source', 'weighted_blend'] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => updateAxis(axis.id, { inputComposition: c })}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                      composition === c ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {c === 'single_source' ? 'Single source' : 'Weighted blend'}
                  </button>
                ))}
              </div>

              {composition === 'single_source' ? (
                <SourcePicker
                  label="Sumber"
                  origin={singleOrigin}
                  onOriginChange={(o) => updateAxis(axis.id, { source: axis.source ? { ...axis.source, origin: o, fieldCode: '' } : { origin: o, fieldCode: '', label: '' } })}
                  value={axis.source}
                  onChange={(source) => updateAxis(axis.id, { source })}
                />
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-foreground">Form {formW}%</span>
                    <span className="text-muted-foreground">Vision {100 - formW}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={formW}
                    onChange={(e) => updateAxis(axis.id, { formWeight: Number(e.target.value) })}
                    className="w-full h-1.5 rounded appearance-none cursor-pointer bg-muted accent-[#d97706]"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <SourcePicker label="Form source" origin="form" value={axis.formSource} onChange={(source) => updateAxis(axis.id, { formSource: source })} />
                    <SourcePicker label="Vision source" origin="vision" value={axis.visionSource} onChange={(source) => updateAxis(axis.id, { visionSource: source })} />
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-border space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <label className="block text-[10px] font-semibold text-muted-foreground">Bands (axis & threshold)</label>
                  <InfoTooltip
                    content="Health-oriented (100 = optimal). Exactly 2 bands compiles to a simple threshold; 3+ compiles to a small rule table (e.g. Pore Severity's Smooth/Visible/Enlarged). Bands should be ordered and cover 0-100 with no gaps."
                    label="About bands"
                  />
                </div>
                {bands.map((b) => (
                  <div key={b.id} className="flex items-center gap-1.5">
                    <input type="number" min={0} max={100} value={b.min} onChange={(e) => updateBand(b.id, { min: Number(e.target.value) })} className={fieldCls + ' w-16 text-center'} />
                    <span className="text-muted-foreground text-[10px]">–</span>
                    <input type="number" min={0} max={100} value={b.max} onChange={(e) => updateBand(b.id, { max: Number(e.target.value) })} className={fieldCls + ' w-16 text-center'} />
                    <span className="text-muted-foreground text-[10px]">→</span>
                    <input type="text" maxLength={12} value={b.letter} onChange={(e) => updateBand(b.id, { letter: e.target.value.toUpperCase() })} placeholder="D" className={fieldCls + ' flex-1 min-w-0 text-center font-bold text-beak'} />
                    <button type="button" onClick={() => removeBand(b.id)} className="p-1 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addBand} className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground border border-border rounded">
                  <Plus className="h-3 w-3" />
                  Add band
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
