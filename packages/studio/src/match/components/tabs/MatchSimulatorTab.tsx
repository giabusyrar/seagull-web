'use client';

import React, { useEffect, useState } from 'react';
import { Play, Sparkles, AlertTriangle, ShieldCheck, Sun, Moon, Zap, Layers, Tag } from 'lucide-react';
import { EmptyState, BrandSelect, useHostRoutes } from '@gateway-experience/shared';
import type { ClinicalMatchResult, RegimenStep } from '../../types';
import { getDimensions, getSafetyFlags, type DimensionRow, type SafetyFlagRow } from '../../../form/api';

/** The 0-100 dimension score scale the match engine takes (health space). */
const SLIDER_MIN = 0;
const SLIDER_MAX = 100;
const SLIDER_MIDPOINT = (SLIDER_MIN + SLIDER_MAX) / 2;

interface MatchSimulatorTabProps {
  simBrand: string;
  setSimBrand: (b: string) => void;
  /** Skin profile code to match against; empty = not sent. */
  simSkinType: string;
  setSimSkinType: (st: string) => void;
  /** Dimension scores to send, by reference dimension code; a dimension not here is not sent. */
  simScores: Record<string, number>;
  setSimScores: (s: Record<string, number>) => void;
  /** Customer conditions (reference safety flags) that are on. */
  simConditions: Record<string, boolean>;
  setSimConditions: (c: Record<string, boolean>) => void;
  onRunSimulator: () => void;
  isSimulating: boolean;
  simResult: ClinicalMatchResult | null;
}

/**
 * The match engine simulator's inputs. Dimensions and safety flags come from
 * reference data, nothing is preset: a dimension counts only once it is
 * included, so no score reaches the engine that nobody chose.
 */
export const MatchSimulatorTab: React.FC<MatchSimulatorTabProps> = ({
  simBrand,
  setSimBrand,
  simSkinType,
  setSimSkinType,
  simScores,
  setSimScores,
  simConditions,
  setSimConditions,
  onRunSimulator,
  isSimulating,
  simResult,
}) => {
  const hostRoutes = useHostRoutes();
  const [dimensions, setDimensions] = useState<DimensionRow[] | null>(null);
  const [flags, setFlags] = useState<SafetyFlagRow[] | null>(null);
  useEffect(() => {
    let alive = true;
    getDimensions(hostRoutes).then((rows) => alive && setDimensions(rows.filter((d) => d?.code && !d.parentCode)));
    getSafetyFlags(hostRoutes).then((rows) => alive && setFlags(rows.filter((f) => f?.code)));
    return () => {
      alive = false;
    };
  }, [hostRoutes]);

  const toggleDimension = (code: string, on: boolean) => {
    const next = { ...simScores };
    // A dimension just included starts at the scale's midpoint, shown on its slider; nothing is sent until it is included.
    if (on) next[code] = next[code] ?? SLIDER_MIDPOINT;
    else delete next[code];
    setSimScores(next);
  };

  const getPhaseIcon = (phaseKey: string) => {
    const lower = phaseKey.toLowerCase();
    if (lower.includes('morning') || lower.includes('am') || lower.includes('sun') || lower.includes('day')) {
      return <Sun className="h-4 w-4 text-amber-400" />;
    }
    if (lower.includes('night') || lower.includes('pm') || lower.includes('evening') || lower.includes('restoration')) {
      return <Moon className="h-4 w-4 text-sky-400" />;
    }
    if (lower.includes('prep') || lower.includes('base') || lower.includes('complexion') || lower.includes('makeup')) {
      return <Sparkles className="h-4 w-4 text-purple-400" />;
    }
    if (lower.includes('shave') || lower.includes('grooming')) {
      return <Layers className="h-4 w-4 text-teal-400" />;
    }
    return <Zap className="h-4 w-4 text-emerald-400" />;
  };

  const formatPhaseTitle = (phaseKey: string) => {
    return phaseKey
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Extract phases or fallback to legacy AM/PM
  const routinePhases: { key: string; title: string; steps: RegimenStep[] }[] = [];
  if (simResult?.regimens?.phases && Object.keys(simResult.regimens.phases).length > 0) {
    for (const [phaseKey, steps] of Object.entries(simResult.regimens.phases)) {
      if (Array.isArray(steps) && steps.length > 0) {
        routinePhases.push({
          key: phaseKey,
          title: formatPhaseTitle(phaseKey),
          steps,
        });
      }
    }
  } else if (simResult?.regimens) {
    if (simResult.regimens.amRoutine && simResult.regimens.amRoutine.length > 0) {
      routinePhases.push({
        key: 'morning_protection',
        title: 'Morning Routine (AM Protocol)',
        steps: simResult.regimens.amRoutine,
      });
    }
    if (simResult.regimens.pmRoutine && simResult.regimens.pmRoutine.length > 0) {
      routinePhases.push({
        key: 'night_restoration',
        title: 'Evening Routine (PM Protocol)',
        steps: simResult.regimens.pmRoutine,
      });
    }
  }

  const unfilled = Object.entries(simResult?.regimens?.unfilledSlots ?? {}).flatMap(([phase, slots]) =>
    slots.map((slot) => ({ phase, slot })),
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Simulator Inputs */}
      <div className="lg:col-span-4 space-y-4">
        <div className="bg-card border border-border rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="font-bold text-foreground text-sm">Consumer Clinical Profile</h3>
            <span className="text-[10px] bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 px-2 py-0.5 rounded font-mono font-bold">
              2-Tier Engine
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-muted-foreground">Brand Scope:</label>
              <BrandSelect value={simBrand} onChange={setSimBrand} includeUniversal label="" />
            </div>

            <div className="space-y-1">
              <label className="text-muted-foreground">Skin profile code (optional):</label>
              <input
                value={simSkinType}
                onChange={(e) => setSimSkinType(e.target.value.toUpperCase().trim())}
                placeholder="as the ruleset's profile mapping names it"
                className="w-full bg-muted/40 border border-border rounded px-3 py-2 text-foreground font-mono"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-border">
              <label className="text-muted-foreground font-bold block">Dimension scores (0-100, include to send):</label>
              {dimensions === null ? (
                <p className="text-muted-foreground italic">Loading dimensions…</p>
              ) : dimensions.length === 0 ? (
                <p className="text-amber-500">Dimensions could not be loaded from reference data.</p>
              ) : (
                dimensions.map((d) => {
                  const included = typeof simScores[d.code] === 'number';
                  return (
                    <div key={d.code} className="space-y-1">
                      <label className="flex items-center justify-between gap-2 text-muted-foreground cursor-pointer">
                        <span className="flex items-center gap-2">
                          <input type="checkbox" checked={included} onChange={(e) => toggleDimension(d.code, e.target.checked)} />
                          {d.name || d.code}
                        </span>
                        <span className="font-mono text-foreground font-bold">{included ? simScores[d.code] : 'not sent'}</span>
                      </label>
                      {included && (
                        <input
                          type="range"
                          min={SLIDER_MIN}
                          max={SLIDER_MAX}
                          value={simScores[d.code]}
                          onChange={(e) => setSimScores({ ...simScores, [d.code]: Number(e.target.value) })}
                          className="w-full accent-amber-400"
                        />
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-2 border-t border-border space-y-2">
              <label className="text-muted-foreground font-bold block">Safety flags:</label>
              {flags === null ? (
                <p className="text-muted-foreground italic">Loading safety flags…</p>
              ) : flags.length === 0 ? (
                <p className="text-amber-500">Safety flags could not be loaded from reference data.</p>
              ) : (
                flags.map((f) => (
                  <label key={f.code} className="flex items-center gap-2 p-2 bg-muted/40 border border-border rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!simConditions[f.code]}
                      onChange={(e) => setSimConditions({ ...simConditions, [f.code]: e.target.checked })}
                      className="accent-rose-400 rounded"
                    />
                    <span className="text-foreground">{f.name || f.code}</span>
                  </label>
                ))
              )}
            </div>

            <button
              onClick={onRunSimulator}
              disabled={isSimulating}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 mt-4 cursor-pointer disabled:opacity-50"
            >
              <Play className="h-4 w-4 fill-black" />
              <span>{isSimulating ? 'Evaluating 2-Tier Rules...' : 'Run Regimen Matching'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Simulator Results */}
      <div className="lg:col-span-8 space-y-6">
        {simResult ? (
          <>
            {/* Summary Top Banner */}
            <div className="bg-card border border-border rounded-lg p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  {simResult.profileSummary.skinType && (
                    <span className="bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 text-xs font-mono font-bold px-2 py-0.5 rounded">
                      {simResult.profileSummary.skinType}
                    </span>
                  )}
                  <h3 className="font-bold text-foreground text-base">Personalized Prescription</h3>
                </div>
                {!simResult.profileSummary.skinType && simResult.profileSummary.skinTypeUnavailable && (
                  <p className="text-xs text-muted-foreground mt-1">No skin type: {simResult.profileSummary.skinTypeUnavailable}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  {(simResult.profileSummary.primaryConcerns ?? []).map((c, i) => (
                    <span key={i} className="text-[10px] bg-muted text-foreground px-2 py-0.5 rounded border border-border">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* The match engine stopped sending overallSuitabilityScore: it
                  was the constant 94.5 for every request, which is not a match
                  quality. Shown only if a real one ever arrives. */}
              {typeof simResult.profileSummary.overallSuitabilityScore === 'number' && (
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Clinical Match</span>
                  <span className="text-3xl font-black text-emerald-400 font-mono">
                    {simResult.profileSummary.overallSuitabilityScore}%
                  </span>
                </div>
              )}
            </div>

            {/* Contraindication Matrix Warnings */}
            {(simResult.clinicalConflictMatrix.layeringRulesApplied?.length ?? 0) > 0 && (
              <div className="bg-amber-950/20 border border-amber-800/40 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <AlertTriangle className="h-4 w-4" />
                  <span>
                    Clinical Conflict Matrix Directives
                    {typeof simResult.clinicalConflictMatrix.conflictsDetected === 'number' && ` (${simResult.clinicalConflictMatrix.conflictsDetected} detected)`}
                  </span>
                </div>
                <ul className="space-y-1 text-xs text-amber-200/90 pl-6 list-disc">
                  {(simResult.clinicalConflictMatrix.layeringRulesApplied ?? []).map((rule, idx) => (
                    <li key={idx}>{rule}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Dynamic Routine Phases */}
            {routinePhases.map((phase) => (
              <div key={phase.key} className="space-y-3">
                <h4 className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-2">
                  {getPhaseIcon(phase.key)}
                  <span>{phase.title}</span>
                </h4>

                <div className="space-y-2">
                  {phase.steps.flatMap((step) => (step.primaryProduct ? [{ ...step, primaryProduct: step.primaryProduct }] : [])).map((step) => (
                    <div key={step.stepNumber} className="bg-card border border-border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="w-5 h-5 rounded-full bg-muted text-amber-300 text-[10px] font-bold flex items-center justify-center font-mono shrink-0">
                            {step.stepNumber}
                          </span>
                          <span className="font-bold text-foreground text-sm">{step.primaryProduct.name}</span>
                          <span className="bg-muted text-amber-400 text-[10px] px-1.5 py-0.5 rounded font-medium border border-border">
                            {step.primaryProduct.brand}
                          </span>
                        </div>

                        <div className="text-xs text-muted-foreground flex items-center gap-3 pl-7">
                          <span>Category: <strong className="text-foreground">{step.category}</strong></span>
                          <span>Texture: <strong className="text-foreground">{step.recommendedTexture || step.primaryProduct.texture}</strong></span>
                        </div>

                        {/* Clinical Why Selected and Key Actives Tags */}
                        {step.primaryProduct.whySelected && step.primaryProduct.whySelected.length > 0 && (
                          <div className="pl-7 flex flex-wrap gap-1.5 pt-1">
                            {step.primaryProduct.whySelected.map((reason, rIdx) => (
                              <span key={rIdx} className="text-[10px] bg-emerald-950/40 text-emerald-300 border border-emerald-800/30 px-2 py-0.5 rounded flex items-center gap-1">
                                <Tag className="h-2.5 w-2.5" />
                                {reason}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0 sm:pl-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-border">
                        <div className="font-mono text-emerald-400 font-bold text-sm">
                          {step.primaryProduct.matchScore} pts
                        </div>
                        <span className="text-[10px] text-emerald-400 flex items-center justify-end gap-1">
                          <ShieldCheck className="h-3 w-3" /> Zero Contraindications
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Slots nothing filled, with the engine's reason */}
            {unfilled.length > 0 && (
              <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-2">
                <div className="font-bold text-foreground text-xs uppercase tracking-wider">Unfilled slots ({unfilled.length})</div>
                <ul className="space-y-1 text-xs text-muted-foreground pl-5 list-disc">
                  {unfilled.map(({ phase, slot }, idx) => (
                    <li key={`${phase}-${slot.slotId ?? idx}`}>
                      <strong className="text-foreground">{formatPhaseTitle(phase)}</strong>
                      {slot.category && ` · ${slot.category}`}
                      {slot.required && ' (required)'}
                      {slot.reason && `: ${slot.reason}`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon={<Sparkles className="h-6 w-6 text-emerald-400" />}
            title="Regimen Matching Standby"
            description="Adjust clinical scores & safety flags on the left, then click 'Run Regimen Matching' to simulate prescription routine."
            className="py-16"
          />
        )}
      </div>
    </div>
  );
};
