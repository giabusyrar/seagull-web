'use client';
import { useMemo } from 'react';
import { groupShades, type Selection } from '@/lib/photo';
import { catalogOf, FLAG_TEXT, QC_ADVICE, type AnalyzeResult } from '@/lib/types/colour';
import { ShadeSwatches } from './ShadeSwatches';
import { Section, TabShell, Tile, list, type TabState } from './TabShell';

function ColourResult({ r, selection, onToggle, onClear, tryOnState }: {
  r: AnalyzeResult; selection: Selection; onToggle(c: string, id: string): void; onClear(): void; tryOnState: { loading: boolean; error?: string };
}) {
  const groups = useMemo(() => groupShades(catalogOf(r)), [r]);
  const q = (r.quadrant && typeof r.quadrant === 'object' ? r.quadrant : {}) as NonNullable<AnalyzeResult['quadrant']>;
  const seasons = list<string>(r.labels?.seasonEquivalents).map(String);
  const flags = list<string>(r.flags).map(String);
  const advice = list<string>(r.qualityFailed).map((c) => QC_ADVICE[String(c)] ?? String(c));
  return (
    <div className="flex flex-col gap-4">
      <Section title="Kuadran warna">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-base font-bold">{q.displayName || q.technicalName || '—'}</span>
          {q.code && <span className="font-mono text-xs text-zinc-500">{q.code}</span>}
          {q.provisional && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-800">Hasil sementara</span>}
        </div>
        {!q.displayName && q.technicalName && <p className="text-xs text-zinc-500">Nama untuk konsumen belum ditentukan brand; yang tampil adalah nama teknis.</p>}
      </Section>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Tile label="Value" value={r.labels?.value} />
        <Tile label="Chroma" value={r.labels?.chroma} />
        <Tile label="Undertone" value={r.labels?.undertone} />
        <Tile label="Foundation" value={r.foundationBand} />
      </div>
      <p className="text-xs text-zinc-600">
        Padanan season{r.labels?.seasonsProvisional ? ' (sementara)' : ''}: <span className="font-medium text-zinc-900">{seasons.length ? seasons.join(', ') : '—'}</span>
      </p>
      {flags.length > 0 && (
        <ul className="list-disc pl-4 text-xs text-zinc-600">{flags.map((f) => <li key={f}>{FLAG_TEXT[f] ?? f}</li>)}</ul>
      )}
      {advice.length > 0 && (
        <div className="rounded border border-amber-200 bg-amber-50 p-3 text-xs">
          <p className="font-semibold">Untuk hasil lebih akurat, foto ulang dengan:</p>
          <ul className="list-disc pl-4 text-zinc-700">{advice.map((a) => <li key={a}>{a}</li>)}</ul>
        </div>
      )}
      <div className="border-t border-zinc-200 pt-3">
        <div className="mb-2 text-sm font-semibold">Coba shade</div>
        <ShadeSwatches groups={groups} selection={selection} onToggle={onToggle} onClear={onClear} tryOnState={tryOnState} />
      </div>
    </div>
  );
}

export function ColourTab(props: { state: TabState; selection: Selection; onToggle(c: string, id: string): void; onClear(): void; tryOnState: { loading: boolean; error?: string } }) {
  const { state, ...rest } = props;
  return <TabShell state={state}>{(json) => <ColourResult r={(json ?? {}) as AnalyzeResult} {...rest} />}</TabShell>;
}
