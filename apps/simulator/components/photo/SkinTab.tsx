'use client';
import type { MetricValue, StructuredWarning, VisionAnalysisResult, ZoneDiagnosticMetric } from '@/lib/types/skin';
import { zoneMetricCount } from '@/lib/types/skin';
import { card } from '@/components/ui';
import { useLang } from '@/lib/i18n';
import { ScoreRing } from './ScoreRing';
import { Pill, Section, TabShell, dash, entries, humanize, list, num, severityTone, type TabState } from './TabShell';

/** One concern per card: its score as the backend gave it and its severity word. No scale is assumed. */
function MetricGrid({ title, items }: { title: string; items: unknown }) {
  const rows = entries<MetricValue>(items);
  return (
    <Section title={title} aside={<span className="text-[11px] text-zinc-400">{rows.length}</span>}>
      {rows.length === 0 ? <p className="text-xs text-zinc-500">—</p> : (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {rows.map(([k, m]) => (
            <div key={k} className={`${card} flex flex-col gap-2 p-3.5`} title={k}>
              <span className="truncate text-xs font-medium text-zinc-600">{humanize(k)}</span>
              <div className="flex items-end justify-between gap-2">
                <span className="text-2xl font-semibold tabular-nums tracking-tight">{num(m.score)}</span>
                {m.severity && <Pill className={severityTone(m.severity)}>{dash(m.severity)}</Pill>}
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

export function SkinResult({ r }: { r: VisionAnalysisResult }) {
  const { t } = useLang();
  const g = (r.globalAggregation && typeof r.globalAggregation === 'object' ? r.globalAggregation : {}) as NonNullable<VisionAnalysisResult['globalAggregation']>;
  const zones = list<ZoneDiagnosticMetric>(r.zoneBreakdown).filter((z) => typeof z === 'object');
  const warnings = list<StructuredWarning>(r.warnings).filter((w) => typeof w === 'object');
  const visible = zones.filter((z) => z.isVisible !== false).length;
  return (
    <div className="flex flex-col gap-6">
      <div className={`${card} flex flex-col items-center gap-5 p-5 sm:flex-row`}>
        <ScoreRing value={g.overallSkinHealthScore} max={100} size={132} label={t('Skin health score', 'Skor kesehatan kulit')} notScored={t('not scored', 'tidak dinilai')} />
        <div className="flex flex-col gap-1.5 text-center sm:text-left">
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-500">{t('Skin health score', 'Skor kesehatan kulit')}</span>
          <p className="text-sm text-zinc-600">
            {entries(g.dimensions).length} {t('dimensions', 'dimensi')} · {entries(g.skinConditions).length} {t('conditions', 'kondisi')} · {visible}/{zones.length} {t('zones visible', 'zona terlihat')}
          </p>
          {r.status && <span className="text-[11px] text-zinc-400">status: {dash(r.status)}</span>}
        </div>
      </div>
      <MetricGrid title={t('Dimensions', 'Dimensi')} items={g.dimensions} />
      <MetricGrid title={t('Skin conditions', 'Kondisi kulit')} items={g.skinConditions} />
      <Section title={t('Zones', 'Zona')} aside={<span className="text-[11px] text-zinc-400">{zones.length}</span>}>
        {zones.length === 0 ? <p className="text-xs text-zinc-500">—</p> : (
          <div className="flex flex-wrap gap-2">
            {zones.map((z, i) => (
              <span key={`${dash(z.zoneCode)}-${i}`}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${z.isVisible === false ? 'border-dashed border-zinc-200 text-zinc-400' : 'border-zinc-200 bg-white text-zinc-700'}`}
                title={z.isVisible === false ? t('Not visible in the photo', 'Tidak terlihat di foto') : undefined}>
                {dash(z.zoneName ?? z.zoneCode)}
                <span className="rounded-full bg-zinc-100 px-1.5 text-[10px] font-semibold tabular-nums text-zinc-500">{zoneMetricCount(z)}</span>
              </span>
            ))}
          </div>
        )}
      </Section>
      {warnings.length > 0 && (
        <Section title={t('Warnings', 'Peringatan')} aside={<span className="text-[11px] text-zinc-400">{warnings.length}</span>}>
          <ul className="flex flex-col gap-1.5 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900">
            {warnings.map((w, i) => <li key={i}><span className="font-mono font-semibold">{dash(w.code)}</span>{w.zoneCode ? ` (${dash(w.zoneCode)})` : ''}: {dash(w.message)}</li>)}
          </ul>
        </Section>
      )}
    </div>
  );
}

export function SkinTab({ state }: { state: TabState }) {
  return <TabShell state={state}>{(json) => <SkinResult r={(json ?? {}) as VisionAnalysisResult} />}</TabShell>;
}
