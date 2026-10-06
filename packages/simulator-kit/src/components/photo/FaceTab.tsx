'use client';
import type { CallResult } from '../../lib/http';
import { CLASSIFICATION_STATUS_LABEL, TRAIT_STATUS_LABEL, errorEntries, type Classification, type FaceArchitectureResult, type FaceQuality, type Measurement, type Trait } from '../../lib/types/face';
import { card } from '../ui';
import { faceMarks } from '../../lib/annotations';
import { useLang } from '../../lib/i18n';
import { Pill, Section, TabShell, Tile, dash, entries, humanize, list, num, type TabState } from './TabShell';

// Values and band edges are a number, or a list of numbers for list-shaped measurements.
const fmt = (v: unknown): string => (Array.isArray(v) ? v.map(fmt).join(', ') : v === null || v === undefined ? '…' : num(v, 3));
const fmtValue = (m: Measurement) => (m.value === null || m.value === undefined ? '—' : fmt(m.value));
const fmtBand = (b: unknown) => (Array.isArray(b) && b.length === 2 ? `${fmt(b[0])} – ${fmt(b[1])}` : '—');

export function FaceResult({ r }: { r: FaceArchitectureResult }) {
  const { lang, t: tr } = useLang();
  const classes = entries<Classification>(r.classifications);
  const traits = entries<Trait>(r.traits);
  const ms = list<Measurement>(r.measurements).filter((m) => typeof m === 'object');
  const q = (r.quality && typeof r.quality === 'object' ? r.quality : {}) as FaceQuality;
  const warnings = list<string>(q.warnings).map(String);
  const missing = list<string>(r.measurementsMissing).map(String);
  // The number each measurement carries on the photo, when it could be drawn there.
  const markNo = new Map((faceMarks(r)?.marks ?? []).map((m) => [m.key, m.n]));
  return (
    <div className="flex flex-col gap-6">
      <Section title={tr('Classification', 'Klasifikasi')}>
        {classes.length === 0 ? <p className="text-xs text-zinc-500">—</p> : (
          <div className="grid gap-2.5 sm:grid-cols-2">
            {classes.map(([name, c]) => (
              <div key={name} className={`${card} flex flex-col gap-1.5 p-4`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-zinc-500">{humanize(name)}</span>
                  <Pill className="bg-zinc-100 text-zinc-600">{CLASSIFICATION_STATUS_LABEL[lang][c.status ?? ''] ?? dash(c.status)}</Pill>
                </div>
                <span className="text-lg font-semibold capitalize tracking-tight">
                  {dash(c.primary)}{c.secondary ? <span className="text-sm font-normal text-zinc-500"> + {dash(c.secondary)}</span> : null}
                </span>
                {typeof c.reason === 'string' && c.reason && <p className="text-[11px] leading-relaxed text-zinc-500">{c.reason}</p>}
              </div>
            ))}
          </div>
        )}
      </Section>
      <Section title={tr('Traits', 'Ciri')}>
        {traits.length === 0 ? <p className="text-xs text-zinc-500">—</p> : (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {traits.map(([name, t]) => (
              <div key={name} className={`${card} flex flex-col gap-1 p-3.5`}>
                <span className="truncate text-xs text-zinc-500">{humanize(name)}</span>
                <span className="text-sm font-semibold capitalize">{dash(t.label)}</span>
                {t.boundaryUncertain && t.alternative ? <span className="text-[11px] text-zinc-500">{tr('could also be', 'bisa juga')} {dash(t.alternative)}</span> : null}
                {t.status !== 'assessed' && <Pill className="mt-0.5 self-start bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200">{TRAIT_STATUS_LABEL[lang][t.status ?? ''] ?? dash(t.status)}</Pill>}
              </div>
            ))}
          </div>
        )}
      </Section>
      <Section title={tr('Measurements', 'Pengukuran')} aside={<span className="text-[11px] text-zinc-400">{ms.length}</span>}>
        <div className="max-h-80 overflow-auto rounded-xl border border-zinc-100">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-zinc-50 text-left text-[10px] uppercase tracking-wider text-zinc-500">
              <tr><th className="w-8 px-3 py-2 font-semibold">#</th><th className="px-3 py-2 font-semibold">Key</th><th className="px-3 py-2 text-right font-semibold">{tr('Value', 'Nilai')}</th><th className="px-3 py-2 font-semibold">Unit</th><th className="px-3 py-2 font-semibold">Band</th></tr>
            </thead>
            <tbody>
              {ms.map((m, i) => (
                <tr key={`${m.key}-${i}`} className="border-t border-zinc-100 hover:bg-zinc-50/60" title={typeof m.reason === 'string' ? m.reason : undefined}>
                  <td className="px-3 py-1.5">{markNo.has(m.key) && <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-900 px-1 text-[10px] font-bold text-white">{markNo.get(m.key)}</span>}</td>
                  <td className="px-3 py-1.5 font-mono text-zinc-700">{dash(m.key)}</td>
                  <td className="px-3 py-1.5 text-right font-semibold tabular-nums">{fmtValue(m)}</td>
                  <td className="px-3 py-1.5 text-zinc-500">{dash(m.unit)}</td>
                  <td className="px-3 py-1.5 tabular-nums text-zinc-500">{fmtBand(m.band)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {missing.length > 0 && <p className="text-[11px] text-zinc-500">{tr('Not measured', 'Tidak terukur')}: {missing.join(', ')}</p>}
      </Section>
      <Section title={tr('Photo quality', 'Kualitas foto')}>
        <div className="grid grid-cols-3 gap-2.5">
          <Tile label="Roll" value={`${num(q.rollDeg)}°`} />
          <Tile label="Yaw" value={`${num(q.yawDeg)}°`} />
          <Tile label="Pitch" value={`${num(q.pitchDeg)}°`} />
        </div>
        {warnings.length > 0
          ? <ul className="list-disc rounded-xl border border-amber-200 bg-amber-50/70 py-2.5 pl-7 pr-3 text-xs text-amber-900">{warnings.map((w) => <li key={w}>{w}</li>)}</ul>
          : <p className="text-xs text-zinc-500">{tr('No warnings.', 'Tidak ada peringatan.')}</p>}
      </Section>
    </div>
  );
}

/** A 4xx rejection: every failed gate from the body's `detail`. */
function Rejection({ result }: { result: CallResult }) {
  const entries = errorEntries(result.json);
  if (!entries.length) return null;
  return (
    <ul className="list-disc pl-4">
      {entries.map((e, i) => (
        <li key={i}>
          <span className="font-mono">{dash(e.code ?? e.gate)}</span>
          {Object.entries(e).filter(([k]) => k !== 'code' && k !== 'gate').map(([k, v]) => ` · ${k}: ${typeof v === 'object' ? JSON.stringify(v) : String(v)}`).join('')}
        </li>
      ))}
    </ul>
  );
}

export function FaceTab({ state }: { state: TabState }) {
  return (
    <TabShell state={state} errorExtra={(r) => <Rejection result={r} />}>
      {(json) => <FaceResult r={(json ?? {}) as FaceArchitectureResult} />}
    </TabShell>
  );
}
