'use client';
import type { MetricValue, VisionAnalysisResult } from '@/lib/types/skin';
import { zoneMetricCount } from '@/lib/types/skin';
import { TabShell, dash, num, type TabState } from './TabShell';

function Metrics({ title, items }: { title: string; items: Record<string, MetricValue> | undefined }) {
  const rows = Object.entries(items ?? {});
  return (
    <div className="flex flex-col gap-1">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{title} ({rows.length})</div>
      {rows.length === 0 ? <p className="text-xs text-zinc-500">—</p> : (
        <table className="w-full text-xs">
          <tbody>
            {rows.map(([k, m]) => (
              <tr key={k} className="border-t border-zinc-100">
                <td className="py-1 pr-2 font-mono">{k}</td>
                <td className="pr-2 text-right font-semibold">{num(m?.score)}</td>
                <td className="text-zinc-600">{dash(m?.severity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function SkinResult({ r }: { r: VisionAnalysisResult }) {
  const g = r.globalAggregation ?? {};
  const score = g.overallSkinHealthScore;
  const zones = Array.isArray(r.zoneBreakdown) ? r.zoneBreakdown : [];
  const warnings = Array.isArray(r.warnings) ? r.warnings : [];
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded border border-zinc-200 bg-zinc-50 p-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Skor kesehatan kulit</div>
        {typeof score === 'number'
          ? <div className="text-3xl font-black">{score.toFixed(1)} <span className="text-xs font-normal text-zinc-500">/ 100</span></div>
          : <div className="text-xl font-bold text-zinc-500">tidak dinilai</div>}
        {r.status && <div className="text-[11px] text-zinc-500">status: {r.status}</div>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Metrics title="Dimensi" items={g.dimensions} />
        <Metrics title="Kondisi kulit" items={g.skinConditions} />
      </div>
      <div className="flex flex-col gap-1">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Zona ({zones.length})</div>
        {zones.length === 0 ? <p className="text-xs text-zinc-500">—</p> : (
          <table className="w-full text-xs">
            <thead className="text-left text-zinc-500"><tr><th className="py-1 pr-2">Zona</th><th className="pr-2">Terlihat</th><th>Metrik</th></tr></thead>
            <tbody>
              {zones.map((z, i) => (
                <tr key={`${z.zoneCode}-${i}`} className="border-t border-zinc-100">
                  <td className="py-1 pr-2">{dash(z.zoneName ?? z.zoneCode)}</td>
                  <td className="pr-2">{z.isVisible === false ? 'tidak' : z.isVisible ? 'ya' : '—'}</td>
                  <td>{zoneMetricCount(z)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Peringatan ({warnings.length})</div>
        {warnings.length === 0 ? <p className="text-xs text-zinc-500">Tidak ada peringatan.</p> : (
          <ul className="list-disc pl-4 text-xs text-amber-800">
            {warnings.map((w, i) => <li key={i}><span className="font-mono">{dash(w.code)}</span>{w.zoneCode ? ` (${w.zoneCode})` : ''}: {dash(w.message)}</li>)}
          </ul>
        )}
      </div>
    </div>
  );
}

export function SkinTab({ state }: { state: TabState }) {
  return <TabShell state={state}>{(json) => <SkinResult r={(json ?? {}) as VisionAnalysisResult} />}</TabShell>;
}
