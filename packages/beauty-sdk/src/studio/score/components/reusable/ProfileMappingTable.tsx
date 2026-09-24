'use client';

import React, { useState } from 'react';
import { Plus, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import { ScoreRangeInput, DimensionSelect, SeveritySelect, InfoTooltip } from '@gateway-experience/shared';
import type {
  VisualAxisConfig,
  VisualProfileMappingConfig,
  VisualProfileEntry,
  ProfileStrategyType,
} from '../../types';

export interface ProfileMappingTableProps {
  axes: VisualAxisConfig[];
  config: VisualProfileMappingConfig;
  onChange: (updated: VisualProfileMappingConfig) => void;
  disabled?: boolean;
}

export const ProfileMappingTable: React.FC<ProfileMappingTableProps> = ({
  axes,
  config,
  onChange,
  disabled = false,
}) => {
  const { strategy, profiles } = config;
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  // Remembers each method's own rows for this editing session, so switching
  // methods and switching back doesn't silently discard what you typed —
  // only the CURRENTLY selected method is ever saved to the ruleset, though.
  const [cache, setCache] = useState<Partial<Record<ProfileStrategyType, VisualProfileEntry[]>>>({});

  // Combination Matrix fans out one column per dimension; let the table grow past
  // the container and scroll horizontally instead of crushing every column.
  const wide = strategy === 'combination_matrix';

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleStrategyChange = (newStrategy: ProfileStrategyType) => {
    if (newStrategy === strategy) return;

    // Remember the method you're leaving, in case you switch back to it.
    setCache((prev) => ({ ...prev, [strategy]: profiles }));

    const cached = cache[newStrategy];
    let initialProfiles: VisualProfileEntry[] = cached ?? [];
    if (!cached) {
      if (newStrategy === 'total_score') {
        initialProfiles = [
          { id: `prof_${Date.now()}_1`, minScore: 80, maxScore: 100, code: 'OPTIMAL_RESILIENT', title: 'Optimal Vitality', category: 'Resilient Barrier', summary: 'Healthy barrier balance.' },
          { id: `prof_${Date.now()}_2`, minScore: 50, maxScore: 79, code: 'MODERATE_FATIGUE', title: 'Moderate Fatigue', category: 'Early Stress', summary: 'Mild cellular stress.' },
          { id: `prof_${Date.now()}_3`, minScore: 0, maxScore: 49, code: 'ACCELERATED_DEFICIT', title: 'Accelerated Deficit', category: 'High Concern', summary: 'Elevated concern.' },
        ];
      } else if (newStrategy === 'combination_matrix') {
        initialProfiles = generateCartesianCombinations(axes);
      } else if (newStrategy === 'primary_concern') {
        initialProfiles = axes.map((a, idx) => ({
          id: `prof_${Date.now()}_${idx + 1}`,
          primaryDimension: a.dimensionKey,
          severityLevel: 'Sangat Parah',
          code: `${a.dimensionKey.toUpperCase()}_CRITICAL`,
          title: `${a.name} Critical Concern`,
          category: 'Acute Concern',
          summary: `Acute focus required on ${a.name}.`,
        }));
      }
    }

    onChange({
      strategy: newStrategy,
      profiles: initialProfiles,
    });
  };

  const handleAddProfile = () => {
    let newEntry: VisualProfileEntry;
    const pIdx = profiles.length + 1;

    if (strategy === 'total_score') {
      const last = profiles[profiles.length - 1];
      const max = last && last.minScore !== undefined ? Math.max(0, last.minScore - 1) : 49;
      newEntry = {
        id: `prof_${Date.now()}`,
        minScore: 0,
        maxScore: max,
        code: `TIER_${pIdx}`,
        title: `Health Tier ${pIdx}`,
        category: 'Standard',
        summary: '',
      };
    } else if (strategy === 'combination_matrix') {
      const dimCodes: Record<string, string> = {};
      axes.forEach((a) => {
        dimCodes[a.dimensionKey] = axisLetters(a)[0];
      });
      newEntry = {
        id: `prof_${Date.now()}`,
        dimensionCodes: dimCodes,
        code: Object.values(dimCodes).join(''),
        title: `Profile ${pIdx}`,
        category: 'General',
        summary: '',
      };
    } else {
      newEntry = {
        id: `prof_${Date.now()}`,
        primaryDimension: axes[0]?.dimensionKey || 'sebum',
        severityLevel: 'Parah',
        code: `CONCERN_${pIdx}`,
        title: `Concern Profile ${pIdx}`,
        category: 'Targeted',
        summary: '',
      };
    }

    onChange({
      ...config,
      profiles: [...profiles, newEntry],
    });
  };

  const handleDeleteProfile = (id: string) => {
    if (profiles.length <= 1) return;
    onChange({
      ...config,
      profiles: profiles.filter((p) => p.id !== id),
    });
  };

  const handleUpdateProfile = (id: string, field: keyof VisualProfileEntry, val: any) => {
    const updated = profiles.map((p) => {
      if (p.id === id) {
        return { ...p, [field]: val };
      }
      return p;
    });
    onChange({ ...config, profiles: updated });
  };

  const handleUpdateDimCode = (id: string, dimKey: string, codeVal: string) => {
    const updated = profiles.map((p) => {
      if (p.id === id) {
        const nextCodes = { ...(p.dimensionCodes || {}), [dimKey]: codeVal.toUpperCase() };
        return { ...p, dimensionCodes: nextCodes };
      }
      return p;
    });
    onChange({ ...config, profiles: updated });
  };

  const handleAutoGenerateMatrix = () => {
    const generated = generateCartesianCombinations(axes);
    onChange({
      ...config,
      profiles: generated,
    });
  };

  return (
    <div className="space-y-4">
      {/* Strategy Switcher */}
      <div className="bg-card p-3.5 rounded-lg border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <label className="text-sm font-bold text-foreground block">
            How the profile is chosen
          </label>
          <InfoTooltip
            content="Sets skin_profile.code and skin_profile.name — a different result than Score Range and Severity Level above, which only set score_range and severity_level. 'Total Score' reads the same overall score as those two, just to pick a different output."
            label="About profile strategy"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-md border border-border shrink-0">
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleStrategyChange('total_score')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
              strategy === 'total_score'
                ? 'bg-primary text-primary-foreground font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            
            Total Score
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => handleStrategyChange('combination_matrix')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
              strategy === 'combination_matrix'
                ? 'bg-primary text-primary-foreground font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            
            Combination Matrix
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => handleStrategyChange('primary_concern')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
              strategy === 'primary_concern'
                ? 'bg-primary text-primary-foreground font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            
            Primary Concern
          </button>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground -mt-2">
        Only the highlighted method above is saved to this ruleset — the other two are kept in
        this browser tab so you can switch back without losing what you typed, but they're
        discarded on reload.
      </p>

      {strategy === 'total_score' && (
        <p className="text-[11px] text-muted-foreground bg-muted/40 border border-border rounded-lg px-3 py-2">
          "Trigger range" reads the same overall score as the Score Range / Severity Level labels
          above, but this table picks the profile's own{' '}
          <span className="font-mono">skin_profile.code</span> /{' '}
          <span className="font-mono">skin_profile.name</span> — a different result than{' '}
          <span className="font-mono">score_range</span> /{' '}
          <span className="font-mono">severity_level</span>. Editing one does not change the others.
        </p>
      )}

      {/* Auto-generate toolbar for Combination Matrix */}
      {strategy === 'combination_matrix' && (
        <div className="flex items-center justify-between bg-muted/40 border border-border p-2.5 rounded-lg">
          <span className="text-xs text-muted-foreground">
            One row per combination of {axes.length} dimensions ({profiles.length} rows).
          </span>
          <button
            type="button"
            disabled={disabled || axes.length === 0}
            onClick={handleAutoGenerateMatrix}
            className="px-3 py-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded text-xs flex items-center gap-1 transition-colors disabled:opacity-50"
          >
            
            Generate all combinations
          </button>
        </div>
      )}

      {/* Strategy Table with Progressive Disclosure */}
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table
            className={`${wide ? 'min-w-full' : 'w-full'} text-left text-xs border-collapse`}
            style={wide ? { width: 'max-content' } : undefined}
          >
            <thead>
              <tr className="bg-muted/40 border-b border-border text-[11px] text-muted-foreground">
                <th className="py-2.5 px-3 text-center" style={{ width: 40 }}>#</th>

                {/* Strategy Specific Criteria Columns */}
                {strategy === 'total_score' && (
                  <th className="py-2.5 px-3" style={{ minWidth: 160 }}>Trigger range</th>
                )}

                {strategy === 'combination_matrix' &&
                  axes.map((a) => {
                    const letters = axisLetters(a);
                    const bipolar = !!(a.axisCodeLow?.trim() && a.axisCodeHigh?.trim());
                    return (
                      <th
                        key={a.id}
                        className="py-2.5 px-3 text-center whitespace-nowrap"
                        style={{ minWidth: 120 }}
                      >
                        {a.name || a.dimensionKey}
                        <span className="block text-[10px] font-normal text-muted-foreground">
                          {bipolar ? letters.join(' / ') : 'O / S / P'}
                        </span>
                      </th>
                    );
                  })}

                {strategy === 'primary_concern' && (
                  <>
                    <th className="py-2.5 px-3" style={{ minWidth: 224 }}>Dimension</th>
                    <th className="py-2.5 px-3" style={{ minWidth: 150 }}>Level</th>
                  </>
                )}

                {/* Essential Output Profile Columns */}
                <th className="py-2.5 px-3" style={{ minWidth: 150 }}>Code</th>
                <th className="py-2.5 px-3" style={{ minWidth: 240 }}>Name</th>
                <th className="py-2.5 px-3 text-center" style={{ width: 80 }} />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {profiles.map((p, pIdx) => {
                const isExpanded = !!expandedRows[p.id];
                return (
                  <React.Fragment key={p.id}>
                    <tr className="hover:bg-muted/40 transition-colors">
                      <td className="py-2.5 px-3 text-center text-muted-foreground font-semibold">{pIdx + 1}</td>

                      {/* Total Score Strategy Criteria */}
                      {strategy === 'total_score' && (
                        <td className="py-2.5 px-3">
                          <ScoreRangeInput
                            minScore={p.minScore ?? 0}
                            maxScore={p.maxScore ?? 100}
                            disabled={disabled}
                            onChange={(min, max) => {
                              const updated = profiles.map((item) =>
                                item.id === p.id ? { ...item, minScore: min, maxScore: max } : item
                              );
                              onChange({ ...config, profiles: updated });
                            }}
                          />
                        </td>
                      )}

                      {/* Combination Matrix Strategy Criteria */}
                      {strategy === 'combination_matrix' &&
                        axes.map((a) => {
                          const codeVal =
                            p.dimensionCodes?.[a.dimensionKey] ||
                            p.dimensionCodes?.[a.axisCode] ||
                            axisLetters(a)[0];
                          return (
                            <td key={a.id} className="py-2.5 px-3 text-center">
                              <input
                                type="text"
                                disabled={disabled}
                                value={codeVal}
                                onChange={(e) => handleUpdateDimCode(p.id, a.dimensionKey, e.target.value)}
                                placeholder="D"
                                className="w-12 px-1.5 py-1 bg-muted/40 border border-border rounded text-beak font-bold text-center focus:outline-none focus:border-ring disabled:opacity-50 text-xs"
                              />
                            </td>
                          );
                        })}

                      {/* Primary Concern Strategy Criteria */}
                      {strategy === 'primary_concern' && (
                        <>
                          <td className="py-2 px-3 align-middle">
                            <DimensionSelect
                              label=""
                              value={p.primaryDimension || axes[0]?.dimensionKey || 'sebum'}
                              disabled={disabled}
                              onChange={(dimKey) => handleUpdateProfile(p.id, 'primaryDimension', dimKey)}
                            />
                          </td>
                          <td className="py-2 px-3 align-middle">
                            <SeveritySelect
                              value={p.severityLevel || 'Parah'}
                              disabled={disabled}
                              onChange={(sev) => handleUpdateProfile(p.id, 'severityLevel', sev)}
                            />
                          </td>
                        </>
                      )}

                      {/* Essential Profile Code */}
                      <td className="py-2.5 px-3" style={{ minWidth: 150 }}>
                        <input
                          type="text"
                          disabled={disabled}
                          value={p.code}
                          onChange={(e) => handleUpdateProfile(p.id, 'code', e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                          placeholder="DSPW"
                          className="w-full px-2.5 py-1.5 bg-muted/40 border border-border rounded text-beak font-bold focus:outline-none focus:border-ring disabled:opacity-50 text-xs"
                        />
                      </td>

                      {/* Essential Profile Title */}
                      <td className="py-2.5 px-3" style={{ minWidth: 240 }}>
                        <input
                          type="text"
                          disabled={disabled}
                          value={p.title}
                          onChange={(e) => handleUpdateProfile(p.id, 'title', e.target.value)}
                          placeholder="e.g. Dry Sensitive Pigmented Wrinkled"
                          className="w-full px-2.5 py-1.5 bg-muted/40 border border-border rounded text-foreground focus:outline-none focus:border-ring disabled:opacity-50 text-xs font-medium"
                        />
                      </td>

                      {/* Actions: Details Drawer Toggle + Delete */}
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => toggleRow(p.id)}
                            className={`p-1.5 rounded transition-colors ${
                              isExpanded
                                ? 'text-beak bg-beak/10 border border-beak/40'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                            }`}
                            title="Show category & description"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            disabled={disabled || profiles.length <= 1}
                            onClick={() => handleDeleteProfile(p.id)}
                            className="p-1.5 text-muted-foreground hover:text-destructive disabled:opacity-30 rounded transition-colors"
                            title="Delete Profile Row"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Progressive Disclosure Sub-row Drawer */}
                    {isExpanded && (
                      <tr className="bg-muted/40 border-b border-border">
                        <td
                          colSpan={
                            strategy === 'combination_matrix'
                              ? axes.length + 4
                              : strategy === 'primary_concern'
                                ? 6
                                : 5
                          }
                          className="px-4 py-3"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                            <div>
                              <label className="text-muted-foreground text-[11px] font-semibold block mb-1">
                                Category
                              </label>
                              <input
                                type="text"
                                disabled={disabled}
                                value={p.category}
                                onChange={(e) => handleUpdateProfile(p.id, 'category', e.target.value)}
                                placeholder="e.g. Dry Reactive"
                                className="w-full px-2.5 py-1.5 bg-card border border-border rounded text-foreground focus:outline-none focus:border-ring disabled:opacity-50 text-xs"
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="text-muted-foreground text-[11px] font-semibold block mb-1">
                                Description
                              </label>
                              <input
                                type="text"
                                disabled={disabled}
                                value={p.summary || ''}
                                onChange={(e) => handleUpdateProfile(p.id, 'summary', e.target.value)}
                                placeholder="Short description of this profile"
                                className="w-full px-2.5 py-1.5 bg-card border border-border rounded text-muted-foreground focus:outline-none focus:border-ring disabled:opacity-50 text-xs"
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-2.5 bg-muted/40 border-t border-border flex items-center justify-between">
          <button
            type="button"
            disabled={disabled}
            onClick={handleAddProfile}
            className="px-2.5 py-1 bg-card hover:bg-muted text-foreground rounded text-xs font-medium flex items-center gap-1 transition-colors border border-border disabled:opacity-50"
          >
            <Plus className="h-3 w-3" />
            Add profile
          </button>
          <span className="text-[11px] text-muted-foreground">{profiles.length} profiles</span>
        </div>
      </div>
    </div>
  );
};

// A full Cartesian product across every dimension x band explodes fast
// (e.g. 10 dims x 5 bands = ~9.8M rows -> the tab OOMs). Cap it: build rows one
// dimension at a time and stop once we reach MAX_COMBINATIONS.
const MAX_COMBINATIONS = 64;
// Score Range buckets (Optimal / Sedang / Perlu Perhatian) -> per-dimension letter
// codes. The engine derives the same letters from score_range_bands.
const SCORE_RANGE_CODES = ['O', 'S', 'P'];

// A dimension's valid letters: its bipolar (Baumann) pair when both are set,
// otherwise the three Score-Range initials.
function axisLetters(a: VisualAxisConfig): string[] {
  const low = (a.axisCodeLow || '').trim().toUpperCase();
  const high = (a.axisCodeHigh || '').trim().toUpperCase();
  return low && high ? [low, high] : SCORE_RANGE_CODES;
}

function generateCartesianCombinations(axes: VisualAxisConfig[]): VisualProfileEntry[] {
  if (axes.length === 0) return [];

  const dimTierArrays = axes.map((a) => {
    return axisLetters(a).map((code) => ({ dimKey: a.dimensionKey, code }));
  });

  let combinations: any[][] = [[]];
  for (const curr of dimTierArrays) {
    const next: any[][] = [];
    for (const partial of combinations) {
      for (const item of curr) {
        next.push([...partial, item]);
        if (next.length >= MAX_COMBINATIONS) break;
      }
      if (next.length >= MAX_COMBINATIONS) break;
    }
    combinations = next;
  }

  return combinations.map((combo, idx) => {
    const dimCodes: Record<string, string> = {};
    const codeParts: string[] = [];
    const nameParts: string[] = [];

    combo.forEach((item: any) => {
      dimCodes[item.dimKey] = item.code;
      codeParts.push(item.code);
      if (item.tier?.gradeName) {
        nameParts.push(item.tier.gradeName);
      }
    });

    const fullCode = codeParts.join('');
    const fullTitle = nameParts.length > 0 ? nameParts.join(', ') : `Profile ${fullCode}`;

    return {
      id: `prof_${Date.now()}_${idx + 1}`,
      dimensionCodes: dimCodes,
      code: fullCode,
      title: fullTitle,
      category: 'Diagnostic Profile',
      summary: `Combination evaluation for ${fullCode}.`,
    };
  });
}
