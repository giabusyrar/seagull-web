'use client';
import type { CallResult } from '@/lib/http';
import { CLASSIFICATION_STATUS_LABEL, TRAIT_STATUS_LABEL, errorEntries, type FaceArchitectureResult, type Measurement } from '@/lib/types/face';
import { TabShell, Tile, dash, num, type TabState } from './TabShell';

// Values and band edges are a number, or a list of numbers for list-shaped measurements.
const fmt = (v: unknown): string => (Array.isArray(v) ? v.map(fmt).join(', ') : v === null || v === undefined ? '…' : num(v, 3));
const fmtValue = (m: Measurement) => (m.value === null || m.value === undefined ? '—' : fmt(m.value));
const fmtBand = (b: unknown) => (Array.isArray(b) && b.length === 2 ? `${fmt(b[0])} – ${fmt(b[1])}` : '—');

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{title}</div>
      {children}
    </div>
  );
}

function FaceResult({ r }: { r: FaceArchitectureResult }) {
  const classes = Object.entries(r.classifications ?? {});
  const traits = Object.entries(r.traits ?? {});
  const ms = Array.isArray(r.measurements) ? r.measurements : [];
  const q = r.quality ?? {};
  return (
    <div className="flex flex-col gap-4">
      <Section title="Klasifikasi">
        {classes.length === 0 ? <p className="text-xs text-zinc-500">—</p> : classes.map(([name, c]) => (
          <div key={name} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-zinc-100 py-1 text-sm">
            <span className="font-medium">{name}</span>
            <span>
              {dash(c.primary)}{c.secondary ? <span className="text-zinc-500"> + {c.secondary}</span> : null}
              <span className="ml-2 rounded bg-zinc-100 px-1.5 text-[11px] text-zinc-600">{CLASSIFICATION_STATUS_LABEL[c.status ?? ''] ?? dash(c.status)}</span>
            </span>
            {c.reason && <p className="w-full text-[11px] text-zinc-500">{c.reason}</p>}
          </div>
        ))}
      </Section>
      <Section title="Ciri (traits)">
        {traits.length === 0 ? <p className="text-xs text-zinc-500">—</p> : traits.map(([name, t]) => (
          <div key={name} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-zinc-100 py-1 text-sm">
            <span className="font-medium">{name}</span>
            <span>
              {dash(t.label)}{t.boundaryUncertain && t.alternative ? <span className="text-zinc-500"> (bisa juga {t.alternative})</span> : null}
              {t.status !== 'assessed' && <span className="ml-2 rounded bg-amber-100 px-1.5 text-[11px] text-amber-800">{TRAIT_STATUS_LABEL[t.status ?? ''] ?? dash(t.status)}</span>}
            </span>
          </div>
        ))}
      </Section>
      <Section title={`Pengukuran (${ms.length})`}>
        <div className="max-h-72 overflow-auto">
          <table className="w-full text-xs">
            <thead className="text-left text-zinc-500"><tr><th className="py-1 pr-2">Key</th><th className="pr-2">Nilai</th><th className="pr-2">Unit</th><th>Band</th></tr></thead>
            <tbody>
              {ms.map((m, i) => (
                <tr key={`${m.key}-${i}`} className="border-t border-zinc-100" title={m.reason ?? undefined}>
                  <td className="py-1 pr-2 font-mono">{dash(m.key)}</td><td className="pr-2">{fmtValue(m)}</td><td className="pr-2">{dash(m.unit)}</td><td>{fmtBand(m.band)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(r.measurementsMissing ?? []).length > 0 && <p className="text-[11px] text-zinc-500">Tidak terukur: {(r.measurementsMissing ?? []).join(', ')}</p>}
      </Section>
      <Section title="Kualitas foto">
        <div className="grid grid-cols-3 gap-2">
          <Tile label="Roll" value={`${num(q.rollDeg)}°`} />
          <Tile label="Yaw" value={`${num(q.yawDeg)}°`} />
          <Tile label="Pitch" value={`${num(q.pitchDeg)}°`} />
        </div>
        {(q.warnings ?? []).length > 0
          ? <ul className="list-disc pl-4 text-xs text-amber-800">{(q.warnings ?? []).map((w) => <li key={w}>{w}</li>)}</ul>
          : <p className="text-xs text-zinc-500">Tidak ada peringatan.</p>}
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
          {Object.entries(e).filter(([k]) => k !== 'code').map(([k, v]) => ` · ${k}: ${typeof v === 'object' ? JSON.stringify(v) : String(v)}`).join('')}
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
