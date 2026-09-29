'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Badge, cn } from '@gateway-experience/shared';
import { FLAG_TEXT, QC_ADVICE, type AnalyzeResult } from './types';

/**
 * WCPA result, compact. Never shows Lab, Munsell or raw scores (the normal
 * response does not carry them). "Provisional" is always shown when set.
 */
export function AnalysisCard({ result }: { result: AnalyzeResult }) {
  const [open, setOpen] = useState(false);
  const q = result.quadrant;
  const advice = (result.qualityFailed ?? []).map((c) => QC_ADVICE[c]).filter(Boolean);

  return (
    <div className="rounded-2xl border border-border bg-card shadow-xs">
      <button type="button" onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between gap-3 p-4 text-left cursor-pointer">
        <div className="min-w-0 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Hasil analisis warna</div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-bold text-foreground">{q.displayName || q.technicalName}</span>
            {q.provisional && <Badge variant="warning">Hasil sementara</Badge>}
          </div>
        </div>
        <ChevronDown className={cn('h-4 w-4 shrink-0 text-muted-foreground transition', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 text-xs">
          {!q.displayName && <p className="text-muted-foreground">Nama untuk konsumen belum ditentukan brand; yang tampil adalah nama teknis.</p>}
          {q.provisional && <p className="text-muted-foreground">Kalibrasi kuadran belum final, jadi hasil ini masih sementara.</p>}
          <dl className="grid grid-cols-2 gap-2">
            {[
              ['Value', result.labels.value],
              ['Chroma', result.labels.chroma],
              ['Undertone', result.labels.undertone],
              ['Foundation', result.foundationBand],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-border bg-muted/40 px-3 py-2">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{k}</dt>
                <dd className="text-sm font-semibold text-foreground">{v || '–'}</dd>
              </div>
            ))}
          </dl>
          {result.labels.seasonEquivalents?.length > 0 && (
            <p className="text-muted-foreground">
              Padanan season (sebagai gambaran; satu orang bisa punya lebih dari satu):{' '}
              <span className="text-foreground">{result.labels.seasonEquivalents.join(', ')}</span>
            </p>
          )}
          {(result.flags ?? []).map((f) => (
            <p key={f} className="text-muted-foreground">
              {FLAG_TEXT[f] || f}
            </p>
          ))}
          {advice.length > 0 && (
            <div className="rounded-xl border border-border bg-muted/40 p-3 space-y-1">
              <p className="font-semibold text-foreground">Untuk hasil lebih akurat, foto ulang dengan:</p>
              <ul className="list-disc pl-4 text-muted-foreground space-y-0.5">
                {advice.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
