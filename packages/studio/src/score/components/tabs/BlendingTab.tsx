'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Sliders, Check, AlertTriangle, Trash2, Plus, Info } from 'lucide-react';
import { EmptyState, Button, InfoTooltip } from '@gateway-experience/shared';
import type { ScoreRuleset, VisualAxisConfig, ThresholdBand, AxisInput, SourceSpec, SourceDirection } from '../../types';
import { decompileJDMToVisualComponents, compileVisualToJDM } from '../../utils/jdm-compiler';
import { validateBlend, WEIGHT_SUM_TOLERANCE } from '../../utils/blend';
import { FieldPicker } from '../reusable/ClinicalAxisCard';

const fieldCls =
  'h-8 rounded-md bg-muted/40 border border-border px-2.5 text-foreground text-xs outline-none focus:border-ring disabled:opacity-50';

/** A source name as core keys it: lowercase letters, digits, underscores. */
const SOURCE_NAME = /^[a-z][a-z0-9_]*$/;

interface BlendingTabProps {
  rulesets: ScoreRuleset[];
  selectedRuleset: ScoreRuleset | null;
  onSelectRuleset: (ruleset: ScoreRuleset) => void;
  onSaveRuleset: (updated: Partial<ScoreRuleset>) => Promise<void>;
}

type Decompiled = ReturnType<typeof decompileJDMToVisualComponents>;

export const BlendingTab: React.FC<BlendingTabProps> = ({
  rulesets,
  selectedRuleset,
  onSelectRuleset,
  onSaveRuleset,
}) => {
  const activeRuleset = selectedRuleset || rulesets[0] || null;

  const [axes, setAxes] = useState<VisualAxisConfig[]>([]);
  const [sources, setSources] = useState<Record<string, SourceSpec>>({});
  const [loaded, setLoaded] = useState<Decompiled | null>(null);
  const [newSource, setNewSource] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (activeRuleset && activeRuleset.schema) {
      try {
        const decompiled = decompileJDMToVisualComponents(activeRuleset.schema);
        setLoaded(decompiled);
        setAxes(decompiled.axes);
        setSources(decompiled.sources);
        setSaveError(null);
      } catch (err) {
        setSaveError('Could not read this ruleset: ' + (err instanceof Error ? err.message : 'invalid schema'));
      }
    }
  }, [activeRuleset]);

  const problems = useMemo(() => validateBlend(sources, axes), [sources, axes]);
  const usedSources = useMemo(() => new Set(axes.flatMap((a) => (a.inputs || []).map((i) => i.source))), [axes]);
  const sourceNames = Object.keys(sources);

  const updateAxis = (id: string, patch: Partial<VisualAxisConfig>) =>
    setAxes((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));

  const updateSource = (name: string, patch: Partial<SourceSpec>) =>
    setSources((prev) => ({ ...prev, [name]: { ...prev[name], ...patch } }));

  const addSource = () => {
    const name = newSource.trim();
    if (!SOURCE_NAME.test(name) || sources[name]) return;
    // No scale or direction is assumed: both start empty and the source is invalid until set.
    setSources((prev) => ({ ...prev, [name]: { scale: [NaN, NaN], direction: '' as SourceDirection } }));
    setNewSource('');
  };

  const removeSource = (name: string) =>
    setSources((prev) => Object.fromEntries(Object.entries(prev).filter(([n]) => n !== name)));

  const handleSave = async () => {
    if (!activeRuleset || !loaded || problems.length > 0) return;
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);
    try {
      const updatedSchema = compileVisualToJDM(axes, loaded.profileConfig, loaded.scoreRangeBands, loaded.severityBands, activeRuleset.schema, sources);
      await onSaveRuleset({
        id: activeRuleset.id,
        code: activeRuleset.code,
        title: activeRuleset.title,
        description: activeRuleset.description,
        brandId: activeRuleset.brandId,
        applicationId: activeRuleset.applicationId,
        status: activeRuleset.status,
        // Core's update replaces the whole row, so leaving the version out reset it to 0.
        version: activeRuleset.version,
        schema: updatedSchema,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save blending');
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
          <Button variant="primary" size="sm" onClick={handleSave} isLoading={isSaving} disabled={problems.length > 0}>
            {isSaving ? 'Saving…' : 'Save blending'}
          </Button>
        </div>
      </div>

      {saveError && (
        <div className="p-3 rounded-md border border-destructive/40 bg-destructive/10 text-xs text-destructive flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span className="break-words">{saveError}</span>
        </div>
      )}

      {loaded?.convertedBlend && (
        <div className="p-3 rounded-md border border-border bg-muted/30 text-[11px] text-muted-foreground flex items-start gap-2">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            This ruleset uses the old form/vision blend. It is shown here converted to sources, the way the
            engine reads it today; saving stores it in the new format with the same scores.
          </span>
        </div>
      )}

      {problems.length > 0 && (
        <div className="p-3 rounded-md border border-amber-500/40 bg-amber-500/10 text-[11px] text-amber-700 dark:text-amber-300 space-y-0.5">
          <div className="font-semibold flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" />
            Fix before saving — the engine would refuse:
          </div>
          <ul className="list-disc pl-5">
            {problems.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Sources */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-bold text-foreground">Sources</h3>
          <InfoTooltip
            content="Each kind of signal a dimension can be scored from, and how to read its raw values: the scale they arrive on and whether higher means worse (concern) or better (health). The engine turns every input into 0-100 concern before blending."
            label="About sources"
          />
        </div>
        {sourceNames.length === 0 && <p className="text-[11px] text-muted-foreground italic">No sources declared yet.</p>}
        {sourceNames.map((name) => {
          const s = sources[name];
          const scale = s.scale || [NaN, NaN];
          const num = (v: number) => (Number.isFinite(v) ? v : '');
          return (
            <div key={name} className="flex flex-wrap items-center gap-2">
              <span className="w-24 truncate font-mono text-xs font-semibold text-foreground">{name}</span>
              <label className="flex items-center gap-1 text-[10px] text-muted-foreground">
                scale
                <input type="number" value={num(scale[0])} onChange={(e) => updateSource(name, { scale: [e.target.value === '' ? NaN : Number(e.target.value), scale[1]] })} className={fieldCls + ' w-20 text-center'} aria-label={`${name} scale minimum`} />
                –
                <input type="number" value={num(scale[1])} onChange={(e) => updateSource(name, { scale: [scale[0], e.target.value === '' ? NaN : Number(e.target.value)] })} className={fieldCls + ' w-20 text-center'} aria-label={`${name} scale maximum`} />
              </label>
              <select value={s.direction || ''} onChange={(e) => updateSource(name, { direction: e.target.value as SourceDirection })} className={fieldCls} aria-label={`${name} direction`}>
                <option value="">— direction —</option>
                <option value="concern">concern (higher = worse)</option>
                <option value="health">health (higher = better)</option>
              </select>
              <button
                type="button"
                onClick={() => removeSource(name)}
                disabled={usedSources.has(name)}
                title={usedSources.has(name) ? 'Used by a dimension — remove it there first' : 'Remove source'}
                className="p-1 text-muted-foreground hover:text-destructive disabled:opacity-30 disabled:hover:text-muted-foreground"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={newSource}
            onChange={(e) => setNewSource(e.target.value.toLowerCase())}
            onKeyDown={(e) => { if (e.key === 'Enter') addSource(); }}
            placeholder="new source, e.g. device"
            className={fieldCls + ' w-48 font-mono'}
          />
          <button
            type="button"
            onClick={addSource}
            disabled={!SOURCE_NAME.test(newSource.trim()) || !!sources[newSource.trim()]}
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground border border-border rounded disabled:opacity-40"
          >
            <Plus className="h-3 w-3" />
            Add source
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4 space-y-1">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-bold text-foreground">Per-dimension blend</h3>
          <InfoTooltip
            content="For each dimension, which sources its score comes from and how much each counts. Weights must add up to 100%. When a source does not arrive (e.g. no photo), its weight is shared among the ones that did; a dimension missing a required source, or every source, is not scored."
            label="About blending"
          />
        </div>
        <p className="text-[11px] text-muted-foreground">
          e.g. Sebum: form 30%, vision 50%, device 20%.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card divide-y divide-border">
        {axes.length === 0 && (
          <div className="p-6 text-center text-xs text-muted-foreground italic">
            This ruleset has no dimensions yet — add some in Skin Grading first.
          </div>
        )}
        {axes.map((axis) => {
          const inputs = axis.inputs || [];
          const required = axis.required || [];
          const bands = axis.bands || [];
          const sum = inputs.reduce((s, i) => s + (typeof i.weight === 'number' && Number.isFinite(i.weight) ? i.weight : 0), 0);
          const sumOk = Math.abs(sum / 100 - 1) <= WEIGHT_SUM_TOLERANCE;
          const free = sourceNames.filter((n) => !inputs.some((i) => i.source === n));

          const setInputs = (next: AxisInput[]) =>
            updateAxis(axis.id, { inputs: next, required: required.filter((r) => next.some((i) => i.source === r)) });
          const updateInput = (idx: number, patch: Partial<AxisInput>) =>
            setInputs(inputs.map((i, j) => (j === idx ? { ...i, ...patch } : i)));
          // A new row takes no weight on its own: the gap shows in the sum until it is set.
          const addInput = () => free.length > 0 && setInputs([...inputs, { source: free[0], field: '', weight: undefined }]);
          const toggleRequired = (src: string) =>
            updateAxis(axis.id, { required: required.includes(src) ? required.filter((r) => r !== src) : [...required, src] });

          const updateBand = (id: string, patch: Partial<ThresholdBand>) =>
            updateAxis(axis.id, { bands: bands.map((b) => (b.id === id ? { ...b, ...patch } : b)) });
          const addBand = () =>
            updateAxis(axis.id, { bands: [...bands, { id: `b_${Date.now()}`, min: 0, max: 100, letter: '' }] });
          const removeBand = (id: string) => updateAxis(axis.id, { bands: bands.filter((b) => b.id !== id) });

          return (
            <div key={axis.id} className="p-3.5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-foreground">
                  {axis.name || axis.dimensionKey.toUpperCase()}
                </span>
                {inputs.length > 0 ? (
                  <span className={`text-[11px] font-semibold tabular-nums ${sumOk ? 'text-muted-foreground' : 'text-destructive'}`}>
                    {Math.round(sum * 100) / 100}% {sumOk ? '' : '— must be 100%'}
                  </span>
                ) : (
                  <span className="text-[11px] text-amber-700 dark:text-amber-300">No inputs — this dimension is not scored</span>
                )}
              </div>

              {inputs.length > 0 && (
                <div className="space-y-1.5">
                  <div className="grid grid-cols-[7rem_1fr_5rem_4.5rem_1.5rem] gap-2 text-[10px] font-semibold text-muted-foreground">
                    <span>Source</span>
                    <span>Field</span>
                    <span className="text-center">Weight %</span>
                    <span className="text-center">Required</span>
                    <span />
                  </div>
                  {inputs.map((inp, idx) => (
                    <div key={`${inp.source}-${idx}`} className="grid grid-cols-[7rem_1fr_5rem_4.5rem_1.5rem] items-center gap-2">
                      <select
                        value={inp.source}
                        onChange={(e) => updateInput(idx, { source: e.target.value, field: '', label: '' })}
                        className={fieldCls + ' font-mono'}
                        aria-label="Source"
                      >
                        {[inp.source, ...free].filter((n, i, a) => a.indexOf(n) === i).map((n) => (
                          <option key={n} value={n}>
                            {n}
                            {sources[n] ? '' : ' (undeclared)'}
                          </option>
                        ))}
                      </select>
                      <FieldPicker source={inp.source} field={inp.field} onChange={(field, label) => updateInput(idx, { field, label })} />
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={1}
                        value={typeof inp.weight === 'number' && Number.isFinite(inp.weight) ? inp.weight : ''}
                        onChange={(e) => updateInput(idx, { weight: e.target.value === '' ? undefined : Number(e.target.value) })}
                        className={fieldCls + ' text-center tabular-nums'}
                        aria-label={`${inp.source} weight percent`}
                      />
                      <label className="flex justify-center">
                        <input type="checkbox" checked={required.includes(inp.source)} onChange={() => toggleRequired(inp.source)} aria-label={`${inp.source} required`} />
                      </label>
                      <button type="button" onClick={() => setInputs(inputs.filter((_, j) => j !== idx))} className="p-1 text-muted-foreground hover:text-destructive" aria-label={`Remove ${inp.source}`}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={addInput}
                disabled={free.length === 0}
                title={free.length === 0 ? 'Every declared source is already an input; declare another above' : undefined}
                className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground border border-border rounded disabled:opacity-40"
              >
                <Plus className="h-3 w-3" />
                Add input
              </button>

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
