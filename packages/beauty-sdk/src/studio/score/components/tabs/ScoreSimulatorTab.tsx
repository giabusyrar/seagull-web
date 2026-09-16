'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';
import { SeverityBadge, InfoTooltip } from '@gateway-experience/shared';
import type { ScoreRuleset, RulesetSimulationResponse } from '../../types';

interface ScoreSimulatorTabProps {
  rulesets: ScoreRuleset[];
  selectedRuleset: ScoreRuleset | null;
  onSelectRuleset: (ruleset: ScoreRuleset) => void;
  conditions?: { code: string; name: string; description?: string }[];
}

const card = 'rounded-lg border border-border bg-card p-4';
const sliderCls =
  'w-full h-1.5 rounded appearance-none cursor-pointer bg-muted accent-[#d97706]';

export const ScoreSimulatorTab: React.FC<ScoreSimulatorTabProps> = ({
  rulesets,
  selectedRuleset,
  onSelectRuleset,
}) => {
  const activeRuleset = selectedRuleset || rulesets[0] || null;

  // Dimensions to expose as sliders — read from the selected ruleset's schema
  // (dimension_weights / concern_labels / axis_codes keys) so the simulator
  // always matches the model under test.
  const rulesetDims = useMemo<string[]>(() => {
    if (!activeRuleset?.schema) return [];
    try {
      const s = JSON.parse(activeRuleset.schema);
      const keys = new Set<string>([
        ...Object.keys(s.dimension_weights || {}),
        ...Object.keys(s.concern_labels || {}),
        ...Object.keys(s.axis_codes || {}),
      ]);
      return Array.from(keys);
    } catch {
      return [];
    }
  }, [activeRuleset]);

  const [dimensionScores, setDimensionScores] = useState<Record<string, number>>({
    sebum: 65,
    sensitivity: 70,
    pigmentation: 45,
    aging: 30,
    barrier: 80,
  });

  // Re-seed the sliders whenever the ruleset (and thus its dimensions) changes.
  useEffect(() => {
    if (rulesetDims.length === 0) return;
    setDimensionScores((prev) => {
      const next: Record<string, number> = {};
      for (const d of rulesetDims) next[d] = prev[d] ?? 50;
      return next;
    });
  }, [rulesetDims]);

  const [enableVision, setEnableVision] = useState(false);
  const [visionSignals, setVisionSignals] = useState<Record<string, number>>({
    sebum: 85,
    pigmentation: 60,
  });

  const [selectedConditions, setSelectedConditions] = useState<Record<string, boolean>>({
    is_pregnant: false,
    uses_retinol: true,
  });

  const [simResponse, setSimResponse] = useState<RulesetSimulationResponse | null>(null);
  const [copiedReq, setCopiedReq] = useState(false);

  const SIMULATE_PATH = '/core/score-engine/simulate';

  // The exact body this tab POSTs — offered as a copy so the same run can be
  // replayed from the API client / Workbench or shared with the team.
  const requestBody = useMemo(
    () =>
      JSON.stringify(
        {
          schema: activeRuleset?.schema ?? '',
          dimension_scores: dimensionScores,
          ...(enableVision ? { vision_signals: visionSignals } : {}),
          customer_condition: selectedConditions,
        },
        null,
        2,
      ),
    [activeRuleset, dimensionScores, enableVision, visionSignals, selectedConditions],
  );

  const copyRequest = () => {
    navigator.clipboard?.writeText(requestBody);
    setCopiedReq(true);
    setTimeout(() => setCopiedReq(false), 1500);
  };

  const runSimulation = useCallback(async () => {
    if (!activeRuleset?.schema) return;
    try {
      const res = await fetch(SIMULATE_PATH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schema: activeRuleset.schema,
          dimension_scores: dimensionScores,
          vision_signals: enableVision ? visionSignals : undefined,
          customer_condition: selectedConditions,
        }),
      });
      if (res.ok) setSimResponse(await res.json());
    } catch (err) {
      console.error('Simulation request failed', err);
    }
  }, [activeRuleset, dimensionScores, enableVision, visionSignals, selectedConditions]);

  useEffect(() => {
    const timer = setTimeout(runSimulation, 250);
    return () => clearTimeout(timer);
  }, [runSimulation]);

  const axisValues = simResponse?.result?.axis_values || {};
  const traits = simResponse?.result?.traits || {};
  const scoreRange: string = (simResponse?.result?.score_range as string) || '';
  const severityLevel: string = (simResponse?.result?.severity_level as string) || '';
  const skinConcern = simResponse?.result?.skin_concern as
    | { dimension?: string; label?: string; score?: number }
    | undefined;

  const generatedCode = useMemo(() => {
    const order = ['OILINESS', 'SENSITIVITY', 'PIGMENTATION', 'AGING', 'BARRIER'];
    return order.map((k) => axisValues[k]).filter(Boolean).join('') || 'CUSTOM';
  }, [axisValues]);

  const traitsList = useMemo(() => Object.values(traits).filter(Boolean), [traits]);

  const profile = simResponse?.result?.skin_profile;
  const profileCode = profile?.code || generatedCode;
  const profileName = profile?.name || traitsList.join(' · ') || 'Answer to see a profile';
  const totalScore = Math.round(simResponse?.result?.total_score || 0);

  return (
    <div className="flex flex-col lg:flex-row gap-5 items-start">
      {/* Inputs — fixed ~20rem on the left */}
      <div className="w-full lg:w-80 lg:shrink-0 space-y-3 min-w-0">
        <div className={card + ' space-y-2'}>
          <span className="block text-xs font-semibold text-muted-foreground">Grading model</span>
          <select
            value={activeRuleset?.id || ''}
            onChange={(e) => {
              const r = rulesets.find((item) => item.id === e.target.value);
              if (r) onSelectRuleset(r);
            }}
            className="w-full h-9 rounded-md bg-muted/40 border border-border px-3 text-foreground text-xs outline-none focus:border-ring"
            style={{ colorScheme: 'dark' }}
          >
            {rulesets.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title} ({r.code} v{r.version})
              </option>
            ))}
          </select>
        </div>

        <div className={card + ' space-y-3'}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Dimension scores (0–100)</h3>
            <span className="text-[11px] text-muted-foreground font-mono">
              overall {totalScore}
            </span>
          </div>
          <div className="space-y-3">
            {Object.keys(dimensionScores).map((dimKey) => (
              <div key={dimKey}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-foreground">{dimKey}</span>
                  <span className="text-beak font-semibold font-mono">
                    {dimensionScores[dimKey]}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={dimensionScores[dimKey]}
                  onChange={(e) =>
                    setDimensionScores((p) => ({ ...p, [dimKey]: Number(e.target.value) }))
                  }
                  className={sliderCls}
                />
              </div>
            ))}
          </div>
        </div>

        <div className={card + ' space-y-3'}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-foreground">Vision signals</h3>
              <InfoTooltip
                content="Optional — blended with the dimension scores when on."
                label="About vision signals"
              />
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enableVision}
                onChange={(e) => setEnableVision(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 rounded-full bg-muted peer-checked:bg-beak transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-background after:transition-all peer-checked:after:translate-x-full" />
            </label>
          </div>
          {enableVision &&
            Object.entries(visionSignals).map(([key, val]) => (
              <div key={key}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-foreground">{key}</span>
                  <span className="text-beak font-semibold font-mono">{val}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={val}
                  onChange={(e) =>
                    setVisionSignals((p) => ({ ...p, [key]: Number(e.target.value) }))
                  }
                  className={sliderCls}
                />
              </div>
            ))}
        </div>

        <div className={card + ' space-y-2'}>
          <h3 className="text-sm font-bold text-foreground">Safety flags</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(selectedConditions).map(([key, isChecked]) => (
              <button
                key={key}
                type="button"
                onClick={() =>
                  setSelectedConditions((p) => ({ ...p, [key]: !p[key] }))
                }
                className={`p-2.5 rounded-md border text-left transition-colors flex items-center justify-between ${
                  isChecked
                    ? 'border-beak/50 bg-beak/10 text-beak'
                    : 'border-border bg-muted/40 text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>{key}</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isChecked ? 'bg-beak' : 'bg-border'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result — fills the rest */}
      <div className="w-full lg:flex-1 space-y-3 min-w-0">
        <div className={card}>
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-foreground">Result</h3>
            <div className="flex items-center gap-2">
              {simResponse?.performance && (
                <span className="text-[11px] text-muted-foreground font-mono">
                  {simResponse.performance}
                </span>
              )}
              <button
                type="button"
                onClick={copyRequest}
                title={`POST ${SIMULATE_PATH}`}
                className="flex items-center gap-1 rounded border border-border bg-muted/40 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:border-beak/50"
              >
                {copiedReq ? (
                  <Check className="h-3 w-3 text-beak" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                {copiedReq ? 'Copied' : 'Copy request'}
              </button>
            </div>
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground font-mono">POST {SIMULATE_PATH}</p>

          <div className="mt-3 rounded-md border border-border bg-muted/20 p-4 text-center">
            {profile?.category && (
              <span className="text-[10px] font-semibold text-muted-foreground">
                {profile.category}
              </span>
            )}
            <div className="text-2xl font-black tracking-tight text-foreground font-mono my-1">
              {profileCode}
            </div>
            <div className="text-xs font-semibold text-foreground">{profileName}</div>
            {profile?.description && (
              <p className="text-[11px] text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                {profile.description}
              </p>
            )}
            {traitsList.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 pt-3 border-t border-border">
                {traitsList.map((t) => (
                  <span
                    key={String(t)}
                    className="text-[11px] text-muted-foreground bg-card px-2 py-0.5 rounded border border-border"
                  >
                    {String(t)}
                  </span>
                ))}
              </div>
            )}
          </div>

          {Object.keys(axisValues).length > 0 && (
            <div className="mt-4">
              <h4 className="text-[11px] font-semibold text-muted-foreground mb-2">
                Axis codes
              </h4>
              <div className="flex flex-wrap gap-2 text-xs">
                {Object.entries(axisValues).map(([axis, val]) => (
                  <div
                    key={axis}
                    className="min-w-[4.5rem] flex-1 rounded-md border border-border bg-muted/20 p-2.5 text-center"
                  >
                    <div className="text-muted-foreground text-[10px] truncate">{axis}</div>
                    <div className="text-sm font-bold text-beak font-mono mt-0.5">
                      {String(val)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <div className="min-w-[8rem] flex-1 rounded-md border border-border bg-muted/20 p-2.5">
              <div className="text-[10px] text-muted-foreground">Overall score</div>
              <div className="text-sm font-bold text-foreground font-mono mt-0.5">{totalScore}</div>
              <div className="text-[10px] text-muted-foreground">100 = optimal</div>
            </div>
            <div className="min-w-[8rem] flex-1 rounded-md border border-border bg-muted/20 p-2.5">
              <div className="text-[10px] text-muted-foreground">Score Range</div>
              <div className="text-sm font-semibold text-foreground mt-0.5">{scoreRange || '—'}</div>
            </div>
            <div className="min-w-[8rem] flex-1 rounded-md border border-border bg-muted/20 p-2.5">
              <div className="text-[10px] text-muted-foreground">Severity Level</div>
              <div className="text-sm font-semibold text-beak mt-0.5">{severityLevel || '—'}</div>
            </div>
          </div>

          <div className="mt-3 rounded-md border border-border bg-muted/20 p-2.5 text-xs">
            <div className="text-[10px] text-muted-foreground mb-0.5">Skin Concern</div>
            {skinConcern ? (
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">{skinConcern.label}</span>
                <span className="text-muted-foreground font-mono">
                  {skinConcern.dimension} · {Math.round(skinConcern.score ?? 0)}
                </span>
              </div>
            ) : (
              <span className="text-muted-foreground">No dominant concern (optimal)</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
