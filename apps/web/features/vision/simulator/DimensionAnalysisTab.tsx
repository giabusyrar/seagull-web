'use client';

import React from 'react';
import type { MetricValue, VisionAnalysisResult } from './types';

interface DimensionAnalysisTabProps {
  result: VisionAnalysisResult;
  labelFor: (code: string) => string;
}

function MetricCard({ label, code, metric }: { label: string; code: string; metric: MetricValue }) {
  return (
    <div className="p-3.5 rounded-xl border border-border bg-card shadow-2xs flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-foreground" title={code}>
          {label}
        </span>
        <span className="text-sm font-black font-mono text-foreground" title="Health score: 100 = optimal">
          {metric.score.toFixed(1)} / 100
        </span>
      </div>
      <div className="flex items-center gap-2 flex-wrap text-[10px] text-muted-foreground">
        {metric.severity && (
          <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded font-mono">
            {metric.severity}
          </span>
        )}
        {metric.priority && (
          <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded font-mono">
            priority: {metric.priority}
          </span>
        )}
        {typeof metric.detectedCount === 'number' && (
          <span>Detected: <strong className="text-foreground">{metric.detectedCount}</strong></span>
        )}
      </div>
    </div>
  );
}

export function DimensionAnalysisTab({ result, labelFor }: DimensionAnalysisTabProps) {
  const dimensionEntries = Object.entries(result.globalAggregation.dimensions);
  const skinConditionEntries = Object.entries(result.globalAggregation.skinConditions);
  const hasContent = dimensionEntries.length > 0 || skinConditionEntries.length > 0;

  return (
    <div className="flex flex-col gap-4 max-h-[440px] overflow-y-auto pr-1">
      {!hasContent ? (
        <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
          No dimension or skin condition scores in this result. Check the Summary tab warnings for capabilities without an uploaded model.
        </div>
      ) : (
        <>
          {dimensionEntries.length > 0 && (
            <div className="flex flex-col gap-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Dimensions
              </span>
              {dimensionEntries.map(([code, metric]) => (
                <MetricCard key={code} code={code} label={labelFor(code)} metric={metric} />
              ))}
            </div>
          )}

          {skinConditionEntries.length > 0 && (
            <div className="flex flex-col gap-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Skin Conditions
              </span>
              {skinConditionEntries.map(([code, metric]) => (
                <MetricCard key={code} code={code} label={labelFor(code)} metric={metric} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
