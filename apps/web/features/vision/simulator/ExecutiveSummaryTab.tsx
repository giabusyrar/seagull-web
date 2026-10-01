'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import type { VisionAnalysisResult } from './types';

interface ExecutiveSummaryTabProps {
  result: VisionAnalysisResult;
}

export function ExecutiveSummaryTab({ result }: ExecutiveSummaryTabProps) {
  const [warningsExpanded, setWarningsExpanded] = useState(true);
  const { captureContext, globalAggregation, executionMetrics } = result;

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Primary Diagnostic Score KPIs */}
      <div className="grid grid-cols-2 gap-3">
        {/* Skin Health Composite */}
        <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Overall Skin Health
            </span>
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          </div>
          {/* Null when nothing was scored — no face, or no model uploaded for
              the requested capabilities. It used to arrive as 0.0, which read
              as a measured zero; saying "not measured" is the honest form. */}
          {globalAggregation.overallSkinHealthScore === null ? (
            <>
              <div className="mt-1 text-xl font-bold text-muted-foreground">Not measured</div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Nothing was scored in this analysis. See the warnings below for why.
              </p>
            </>
          ) : (
            <>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-3xl font-black text-foreground">
                  {globalAggregation.overallSkinHealthScore.toFixed(1)}
                </span>
                <span className="text-xs text-muted-foreground">/ 100</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Composite index across {captureContext.processedImages.length} processed angle(s).
              </p>
            </>
          )}
        </div>

        {/* Selective Dispatch Efficiency */}
        <div className="p-3.5 rounded-xl border border-cyan-200 dark:border-cyan-800/40 bg-cyan-50/50 dark:bg-cyan-950/20 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-800 dark:text-cyan-300">
              Models Executed
            </span>
            <Zap className="h-3.5 w-3.5 text-cyan-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-3xl font-black text-foreground">
              {executionMetrics.executedModelsCount}
            </span>
            <span className="text-xs text-muted-foreground">/ {executionMetrics.executedModelsCount + executionMetrics.skippedModelsCount}</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {executionMetrics.skippedModelsCount} model(s) skipped — irrelevant to requested dimensions/skin conditions.
          </p>
        </div>
      </div>

      {/* 2. Capture Context Card */}
      <div className="p-3.5 rounded-xl border border-border bg-card shadow-2xs flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" /> Capture Context
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">{result.analysisId.slice(0, 8)}</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="p-2.5 rounded-lg border border-border bg-slate-50 dark:bg-slate-900/40 flex flex-col gap-1">
            <span className="text-[10px] text-muted-foreground font-semibold">Capture Mode</span>
            <span className="font-bold text-foreground">{captureContext.captureMode.replace(/_/g, ' ')}</span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {captureContext.providedAngles.join(', ')}
            </span>
          </div>

          <div className="p-2.5 rounded-lg border border-border bg-slate-50 dark:bg-slate-900/40 flex flex-col gap-1">
            <span className="text-[10px] text-muted-foreground font-semibold">Executed Models</span>
            <span className="font-bold text-foreground font-mono text-[11px] truncate" title={executionMetrics.executedModels.join(', ')}>
              {executionMetrics.executedModels.join(', ') || '—'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Non-Fatal Warnings Drawer */}
      {result.warnings && result.warnings.length > 0 && (
        <div className="rounded-xl border border-amber-300 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/20 overflow-hidden shadow-2xs">
          <button
            type="button"
            onClick={() => setWarningsExpanded(!warningsExpanded)}
            className="w-full p-3 flex items-center justify-between cursor-pointer hover:bg-amber-100/50 transition text-left"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                Structured Diagnostic Warnings ({result.warnings.length})
              </span>
            </div>
            {warningsExpanded ? (
              <ChevronUp className="h-4 w-4 text-amber-700" />
            ) : (
              <ChevronDown className="h-4 w-4 text-amber-700" />
            )}
          </button>

          {warningsExpanded && (
            <div className="p-3 pt-0 flex flex-col gap-1.5 border-t border-amber-200/60 dark:border-amber-800/40 mt-1">
              {result.warnings.map((w, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-amber-200 dark:border-amber-800/40 text-xs flex items-start gap-2"
                >
                  <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0">
                    {w.code}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-foreground text-[11px] font-medium">{w.message}</span>
                    {w.zoneCode && (
                      <span className="text-[10px] text-muted-foreground font-mono">
                        Zone: {w.zoneCode}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
