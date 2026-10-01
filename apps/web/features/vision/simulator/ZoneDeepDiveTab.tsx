'use client';

import React from 'react';
import { InfoTooltip } from '@gateway-experience/shared';
import type { ZoneDiagnosticMetric } from './types';

interface ZoneDeepDiveTabProps {
  zones: ZoneDiagnosticMetric[];
  selectedZoneCode: string | null;
  onSelectZone: (zoneCode: string) => void;
}

// Scores are health-oriented (100 = optimal): the worst score is the lowest.
function worstScore(zone: ZoneDiagnosticMetric): number | null {
  const scores = [
    ...Object.values(zone.metrics.dimensions),
    ...Object.values(zone.metrics.skinConditions),
  ].map((m) => m.score);
  return scores.length ? Math.min(...scores) : null;
}

export function ZoneDeepDiveTab({
  zones,
  selectedZoneCode,
  onSelectZone,
}: ZoneDeepDiveTabProps) {
  return (
    <div className="flex flex-col gap-2.5 max-h-[440px] overflow-y-auto pr-1">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground pb-1">
        <span className="font-mono text-[10px]">{zones.length} Zones</span>
        <InfoTooltip content="Click a zone to highlight it on the canvas." label="About zones" iconClassName="h-3 w-3" />
      </div>

      {zones.length === 0 ? (
        <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
          No zone breakdown yet. Run the pipeline to populate zone-level diagnostics.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {zones.map((zone) => {
            const isSelected = selectedZoneCode === zone.zoneCode;
            const worst = worstScore(zone);
            const status = zone.isVisible === false
              ? 'out_of_frame'
              : worst === null
              ? 'unscored'
              : worst <= 35
              ? 'severe_issue'
              : worst <= 65
              ? 'moderate_issue'
              : 'optimal';

            return (
              <div
                key={zone.zoneCode}
                onClick={() => onSelectZone(zone.zoneCode)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/30 ring-1 ring-amber-500 shadow-sm'
                    : 'border-border bg-card hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground truncate max-w-[130px]">
                    {zone.zoneName}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {zone.sourceAngle}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Lowest Score:</span>
                  <span className="font-bold text-cyan-600 dark:text-cyan-400 font-mono">
                    {worst === null ? '—' : `${worst.toFixed(0)} / 100`}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${
                      status === 'optimal'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : status === 'moderate_issue'
                        ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300'
                        : status === 'severe_issue'
                        ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300'
                        : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
