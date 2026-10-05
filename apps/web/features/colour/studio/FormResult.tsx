'use client';

import React from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@gateway-experience/shared';

/** What the studio shows of core's form evaluation. Fields may be missing. */
export interface FormEvaluation {
  ruleset_code?: string;
  dry_run?: boolean;
  total_score?: number;
  dimension_scores?: Record<string, number>;
  skin_profile?: { code?: string; name?: string };
  warnings?: { code?: string; message?: string }[];
  error?: string;
  errors?: unknown[];
}

/** One scored submission of a form: which form, the HTTP status and core's answer. */
export interface FormRun {
  code: string;
  status: number;
  body: FormEvaluation;
}

/**
 * The form's score, shown in the studio's results next to colour and face:
 * profile, total, ruleset, per-dimension scores and core's warnings — or
 * core's error, as an error.
 */
export function FormResult({ run, onRestart }: { run: FormRun; onRestart: () => void }) {
  const r = run.body;
  const problem = run.status < 200 || run.status >= 300 || !!r.error;
  const dims = Object.entries(r.dimension_scores || {});
  const warnings = (r.warnings || []).filter((w) => w && typeof w === 'object');
  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-xs text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Hasil form</div>
          <code className="font-mono text-[11px] text-muted-foreground">{run.code}</code>
        </div>
        <Button size="sm" variant="outline" leftIcon={<RotateCcw className="h-3.5 w-3.5" />} onClick={onRestart}>
          Isi ulang
        </Button>
      </div>
      {problem ? (
        <p className="text-destructive">
          {r.error || `HTTP ${run.status}`}
          {Array.isArray(r.errors) && r.errors.length > 0
            ? `: ${r.errors.map((e) => (typeof e === 'string' ? e : JSON.stringify(e))).join('; ')}`
            : ''}
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-2xl font-semibold tabular-nums">{r.skin_profile?.code || '—'}</span>
            {r.skin_profile?.name && <span className="text-muted-foreground">{r.skin_profile.name}</span>}
            <span className="ml-auto text-muted-foreground">
              Total <b className="tabular-nums text-foreground">{typeof r.total_score === 'number' ? r.total_score : '—'}</b>
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
            {r.ruleset_code && <span>Ruleset <code className="font-mono text-foreground">{r.ruleset_code}</code></span>}
            {r.dry_run && <span className="rounded-full bg-emerald-50 px-2 text-emerald-700">dry run · tidak disimpan</span>}
          </div>
          {dims.length > 0 && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {dims.map(([k, v]) => (
                <div key={k} className="rounded-lg border border-border p-2">
                  <div className="truncate text-[11px] text-muted-foreground">{k}</div>
                  <div className="text-base font-semibold tabular-nums">{v}</div>
                </div>
              ))}
            </div>
          )}
          {warnings.length > 0 && (
            <ul className="space-y-1 rounded-lg border border-amber-200 bg-amber-50 p-2 text-[11px] text-amber-900 [overflow-wrap:anywhere]">
              {warnings.map((w, i) => (
                <li key={i}>
                  <span className="font-mono">{w.code}</span>
                  {w.message ? ` — ${w.message}` : ''}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
