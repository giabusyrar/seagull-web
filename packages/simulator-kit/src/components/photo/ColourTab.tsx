'use client';
import { useMemo } from 'react';
import { groupShades, type Selection } from '../../lib/photo';
import { catalogOf, FLAG_TEXT, QC_ADVICE, type AnalyzeResult } from '../../lib/types/colour';
import { ShadeSwatches } from './ShadeSwatches';
import { card, eyebrow } from '../ui';
import { useLang } from '../../lib/i18n';
import { LabPanel } from './LabPanel';
import { Fact, Pill, Section, TabShell, list, type TabState } from './TabShell';

/** The colour analysis; with `tryOn` it also offers the shade picker that drives the photo's try-on. */
export function ColourResult({ r, tryOn }: {
  r: AnalyzeResult;
  tryOn?: { selection: Selection; onToggle(c: string, id: string): void; onClear(): void; state: { loading: boolean; error?: string; startedAt?: number | null } };
}) {
  const { lang, t } = useLang();
  const groups = useMemo(() => groupShades(catalogOf(r), lang), [r, lang]);
  const q = (r.quadrant && typeof r.quadrant === 'object' ? r.quadrant : {}) as NonNullable<AnalyzeResult['quadrant']>;
  const seasons = list<string>(r.labels?.seasonEquivalents).map(String);
  const flags = list<string>(r.flags).map(String);
  const advice = list<string>(r.qualityFailed).map((c) => QC_ADVICE[lang][String(c)] ?? String(c));
  return (
    <div className="flex flex-col gap-6">
      <div className={`${card} overflow-hidden`}>
        <div className="flex flex-col gap-2 p-5">
          <span className={eyebrow}>{t('Colour quadrant', 'Kuadran warna')}</span>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-2xl font-semibold tracking-tight">{q.displayName || q.technicalName || '—'}</span>
            {q.code && <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 font-mono text-[11px] text-zinc-500">{q.code}</span>}
            {q.provisional && <Pill className="bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200">{t('Provisional', 'Hasil sementara')}</Pill>}
          </div>
          {!q.displayName && q.technicalName && <p className="text-xs text-zinc-500">{t('The brand has not set a consumer name yet; this is the technical name.', 'Nama untuk konsumen belum ditentukan brand; yang tampil adalah nama teknis.')}</p>}
          <p className="text-xs text-zinc-600">
            {t('Season equivalents', 'Padanan season')}{r.labels?.seasonsProvisional ? ` (${t('provisional', 'sementara')})` : ''}: <span className="font-medium text-zinc-900">{seasons.length ? seasons.join(', ') : '—'}</span>
          </p>
        </div>
        {/* The four readings as one strip under the quadrant; four across when the card is wide enough, two otherwise. */}
        <div className="@container border-t border-zinc-100">
          <dl className="grid grid-cols-2 gap-px bg-zinc-100 @md:grid-cols-4">
            <Fact label={t('Value', 'Kecerahan')} value={r.labels?.value} />
            <Fact label={t('Chroma', 'Kroma')} value={r.labels?.chroma} />
            <Fact label="Undertone" value={r.labels?.undertone} />
            <Fact label="Foundation" value={r.foundationBand} />
          </dl>
        </div>
      </div>
      <LabPanel result={r} />
      {flags.length > 0 && (
        <ul className="flex flex-col gap-1 rounded-xl bg-zinc-50 p-3.5 text-xs text-zinc-600">{flags.map((f) => <li key={f}>• {FLAG_TEXT[lang][f] ?? f}</li>)}</ul>
      )}
      {advice.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs">
          <p className="font-semibold text-amber-900">{t('For a more accurate result, retake the photo:', 'Untuk hasil lebih akurat, foto ulang dengan:')}</p>
          <ul className="mt-1 list-disc pl-4 text-zinc-700">{advice.map((a) => <li key={a}>{a}</li>)}</ul>
        </div>
      )}
      {tryOn && (
        <Section title={t('Try a shade', 'Coba shade')}>
          <ShadeSwatches groups={groups} selection={tryOn.selection} onToggle={tryOn.onToggle} onClear={tryOn.onClear} tryOnState={tryOn.state} />
        </Section>
      )}
    </div>
  );
}

export function ColourTab(props: { state: TabState; selection: Selection; onToggle(c: string, id: string): void; onClear(): void; tryOnState: { loading: boolean; error?: string; startedAt?: number | null } }) {
  const { state, selection, onToggle, onClear, tryOnState } = props;
  return <TabShell state={state}>{(json) => <ColourResult r={(json ?? {}) as AnalyzeResult} tryOn={{ selection, onToggle, onClear, state: tryOnState }} />}</TabShell>;
}
