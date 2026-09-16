'use client';

import React from 'react';
import { Play, Sparkles, AlertTriangle, ShieldCheck, Sun, Moon, Zap, Layers, Tag } from 'lucide-react';
import { EmptyState } from '@gateway-experience/shared';
import type { ClinicalMatchResult, RegimenStep } from '../../types';

interface MatchSimulatorTabProps {
  simBrand: string;
  setSimBrand: (b: string) => void;
  simSkinType: string;
  setSimSkinType: (st: string) => void;
  simSebum: number;
  setSimSebum: (s: number) => void;
  simHydration: number;
  setSimHydration: (h: number) => void;
  simSensitivity: number;
  setSimSensitivity: (s: number) => void;
  simPregnant: boolean;
  setSimPregnant: (p: boolean) => void;
  simRetinol: boolean;
  setSimRetinol: (r: boolean) => void;
  onRunSimulator: () => void;
  isSimulating: boolean;
  simResult: ClinicalMatchResult | null;
}

export const MatchSimulatorTab: React.FC<MatchSimulatorTabProps> = ({
  simBrand,
  setSimBrand,
  simSkinType,
  setSimSkinType,
  simSebum,
  setSimSebum,
  simHydration,
  setSimHydration,
  simSensitivity,
  setSimSensitivity,
  simPregnant,
  setSimPregnant,
  simRetinol,
  setSimRetinol,
  onRunSimulator,
  isSimulating,
  simResult,
}) => {
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
              <label className="text-muted-foreground">Brand Scoping & Routine Paradigm:</label>
              <select
                value={simBrand}
                onChange={(e) => setSimBrand(e.target.value)}
                className="w-full bg-muted/40 border border-border rounded px-3 py-2 text-foreground"
              >
                <option value="*">All Brands (*)</option>
                <option value="wardah">Wardah Beauty (Clinical AM/PM)</option>
                <option value="makeover">Make Over (Skin Prep & Complexion)</option>
                <option value="kahf">Kahf Men Care (Daily & Post-Shave)</option>
                <option value="biodef">Biodef (Hygiene & Barrier)</option>
                <option value="labore">Laboré Sensitive Skin</option>
                <option value="emina">Emina Teen & Young</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-muted-foreground">Skin Profile (Phenotype):</label>
              <select
                value={simSkinType}
                onChange={(e) => setSimSkinType(e.target.value)}
                className="w-full bg-muted/40 border border-border rounded px-3 py-2 text-foreground font-mono"
              >
                <option value="OSPT">OSPT (Oily, Sensitive, Pigmented, Tight)</option>
                <option value="OSPW">OSPW (Oily, Sensitive, Pigmented, Wrinkled)</option>
                <option value="DRNT">DRNT (Dry, Resistant, Non-Pigmented, Tight)</option>
                <option value="DSPT">DSPT (Dry, Sensitive, Pigmented, Tight)</option>
                <option value="ORNT">ORNT (Oily, Resistant, Non-Pigmented, Tight)</option>
              </select>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-muted-foreground">
                <span>Sebum Dimension:</span>
                <span className="font-mono text-foreground font-bold">{simSebum} pts</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={simSebum}
                onChange={(e) => setSimSebum(Number(e.target.value))}
                className="w-full accent-amber-400"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-muted-foreground">
                <span>Hydration Level:</span>
                <span className="font-mono text-foreground font-bold">{simHydration} pts</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={simHydration}
                onChange={(e) => setSimHydration(Number(e.target.value))}
                className="w-full accent-sky-400"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-muted-foreground">
                <span>Sensitivity Level:</span>
                <span className="font-mono text-foreground font-bold">{simSensitivity} pts</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={simSensitivity}
                onChange={(e) => setSimSensitivity(Number(e.target.value))}
                className="w-full accent-rose-400"
              />
            </div>

            <div className="pt-2 border-t border-border space-y-2">
              <label className="text-muted-foreground font-bold block">Safety Gatekeeper Flags:</label>
              <label className="flex items-center gap-2 p-2 bg-muted/40 border border-border rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={simPregnant}
                  onChange={(e) => setSimPregnant(e.target.checked)}
                  className="accent-rose-400 rounded"
                />
                <span className="text-foreground">Is Pregnant / Nursing Consumer (Zero Retinoids)</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-muted/40 border border-border rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={simRetinol}
                  onChange={(e) => setSimRetinol(e.target.checked)}
                  className="accent-amber-400 rounded"
                />
                <span className="text-foreground">Active Retinol / Direct Acid User</span>
              </label>
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
                  <span className="bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 text-xs font-mono font-bold px-2 py-0.5 rounded">
                    {simResult.profileSummary.skinType}
                  </span>
                  <h3 className="font-bold text-foreground text-base">Personalized Prescription</h3>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {simResult.profileSummary.primaryConcerns.map((c, i) => (
                    <span key={i} className="text-[10px] bg-muted text-foreground px-2 py-0.5 rounded border border-border">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Clinical Match</span>
                <span className="text-3xl font-black text-emerald-400 font-mono">
                  {simResult.profileSummary.overallSuitabilityScore}%
                </span>
              </div>
            </div>

            {/* Contraindication Matrix Warnings */}
            {simResult.clinicalConflictMatrix.layeringRulesApplied.length > 0 && (
              <div className="bg-amber-950/20 border border-amber-800/40 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Clinical Conflict Matrix Directives ({simResult.clinicalConflictMatrix.conflictsDetected} detected)</span>
                </div>
                <ul className="space-y-1 text-xs text-amber-200/90 pl-6 list-disc">
                  {simResult.clinicalConflictMatrix.layeringRulesApplied.map((rule, idx) => (
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
                  {phase.steps.map((step) => (
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
