'use client';
import type { MetricValue, StructuredWarning, VisionAnalysisResult, ZoneDiagnosticMetric } from '../../lib/types/skin';
import { useState } from 'react';
import { severityToneOf } from '@gateway-experience/shared';
import { metricDisplay, zoneMetricCount } from '../../lib/types/skin';
import { FRONT_ANGLE, zoneMetric, type SkinFocus } from '../../lib/annotations';
import { card, segItem, segTrack } from '../ui';
import type { SkinView } from './PhotoAnnotations';
import { useLang } from '../../lib/i18n';
import { LESION_COLOURS_SOURCE } from '../../lib/lesionColours';
import { ScoreRing } from './ScoreRing';
import { Pill, Section, TabShell, dash, entries, humanize, list, num, severityTone, type TabState } from './TabShell';

const HAYASHI_LABEL: Record<string, { en: string; id: string }> = {
  mild: { en: 'Mild', id: 'Ringan' }, moderate: { en: 'Moderate', id: 'Sedang' },
  severe: { en: 'Severe', id: 'Berat' }, very_severe: { en: 'Very severe', id: 'Sangat berat' },
};

/** The view the photo shows for a picked metric or zone; null when nothing is picked. */
export function skinView(r: VisionAnalysisResult | undefined, focus: SkinFocus | null, angle: string, title: (f: SkinFocus) => string): SkinView | null {
  if (!r || !focus) return null;
  if (focus.kind === 'acne') return { title: title(focus), zones: {} };
  if (focus.kind === 'zone') return { title: title(focus), zones: {}, highlight: focus.code };
  const zones: SkinView['zones'] = {};
  for (const z of zoneMetric(r, angle, focus.group, focus.key)) {
    const d = z.display;
    if (d.kind === 'score') zones[z.code] = { label: num(d.score), tone: severityToneOf(d.severity) };
    else if (d.kind === 'measurement') zones[z.code] = { label: `${num(d.value, 2)}${d.unit ? ` ${d.unit}` : ''}`, tone: 'neutral' };
  }
  return { title: title(focus), zones };
}

/** A metric as the backend gave it: score and severity, a raw uncalibrated reading, or nothing. */
function MetricValueView({ m, compact = false }: { m: MetricValue | undefined; compact?: boolean }) {
  const { t } = useLang();
  const d = metricDisplay(m);
  if (d.kind === 'score') {
    return (
      <span className="flex items-end justify-between gap-2">
        <span className={`${compact ? 'text-sm' : 'text-2xl'} font-semibold tabular-nums tracking-tight`}>{num(d.score)}</span>
        {d.severity && <Pill className={severityTone(d.severity)}>{dash(d.severity)}</Pill>}
      </span>
    );
  }
  if (d.kind === 'measurement') {
    return (
      <span className="flex flex-col gap-1">
        <span className="flex flex-wrap items-baseline gap-1.5">
          <span className={`${compact ? 'text-sm' : 'text-lg'} font-semibold tabular-nums tracking-tight`}>{num(d.value, 2)}</span>
          {d.unit && <span className="min-w-0 text-[11px] text-zinc-500 [overflow-wrap:anywhere]">{d.unit}</span>}
        </span>
        {!compact && <Pill className="self-start bg-zinc-100 text-zinc-600 ring-1 ring-inset ring-zinc-200">{t('Not calibrated — raw measurement', 'Belum terkalibrasi — pengukuran mentah')}</Pill>}
        {!compact && d.proxy && <span className="text-[11px] leading-snug text-amber-700 [overflow-wrap:anywhere]">{t('Proxy', 'Proksi')}: {d.proxy}</span>}
      </span>
    );
  }
  return <span className="text-sm text-zinc-400">{t('not scored', 'tidak dinilai')}</span>;
}

type Group = 'skinConditions' | 'dimensions';

/**
 * Seagull reads skin zone by zone: each zone of the face is measured on its
 * own, then rolled up. So a metric is picked here and the photo shows it
 * across the zones; a zone is picked and the photo singles it out.
 */
export function SkinResult({ r, focus, onFocus }: { r: VisionAnalysisResult; focus?: SkinFocus | null; onFocus?(f: SkinFocus | null): void }) {
  const { t, lang } = useLang();
  const g = (r.globalAggregation && typeof r.globalAggregation === 'object' ? r.globalAggregation : {}) as NonNullable<VisionAnalysisResult['globalAggregation']>;
  const zones = list<ZoneDiagnosticMetric>(r.zoneBreakdown).filter((z) => typeof z === 'object');
  const warnings = list<StructuredWarning>(r.warnings).filter((w) => typeof w === 'object');
  const visible = zones.filter((z) => z.isVisible !== false).length;
  const [group, setGroup] = useState<Group>(focus?.kind === 'metric' ? focus.group : 'skinConditions');
  const metrics = entries<MetricValue>(g[group]);
  const picked = focus?.kind === 'metric' && focus.group === group ? focus.key : null;
  const pickedZone = focus?.kind === 'zone' ? zones.find((z) => z.zoneCode === focus.code) : undefined;
  const groupLabel = (x: Group) => (x === 'skinConditions' ? t('Skin conditions', 'Kondisi kulit') : t('Dimensions', 'Dimensi'));

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

      {r.acne?.hayashi && (
        <Section title={t('Acne', 'Jerawat')} aside={
          <div className={segTrack}>
            {(['outline', 'gradient'] as const).map((mode) => {
              const on = focus?.kind === 'acne' && focus.mode === mode;
              return (
                <button key={mode} type="button" className={segItem(on)} onClick={() => onFocus?.(on ? null : { kind: 'acne', mode })}>
                  {mode === 'outline' ? t('Boxes', 'Kotak') : t('Severity', 'Keparahan')}
                </button>
              );
            })}
          </div>
        }>
          <p className="text-sm text-zinc-700">
            <span className="font-semibold">{HAYASHI_LABEL[r.acne.hayashi.grade ?? '']?.[lang] ?? dash(r.acne.hayashi.grade)}</span>
            {' · '}{num(r.acne.hayashi.halfFaceCount, 1)} {t('inflammatory lesions per half face', 'lesi meradang per setengah wajah')}
            {' '}({r.acne.hayashi.inflammatoryCount ?? 0} {t('on the face', 'di wajah')})
          </p>
          <p className="text-[11px] text-zinc-500">{t('Hayashi grade', 'Grade Hayashi')}: {dash(r.acne.hayashi.source)}. {t('Detector not validated.', 'Detektor belum divalidasi.')}</p>
          {focus?.kind === 'acne' && focus.mode === 'gradient' && (
            <Pill className="self-start bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200">
              {t('Colour uncalibrated, not validated: fill shows contrast with the surrounding skin', 'Warna belum terkalibrasi, belum divalidasi: isian menunjukkan kontras dengan kulit sekitar')}
            </Pill>
          )}
          <p className="text-[11px] text-zinc-400">{LESION_COLOURS_SOURCE}</p>
        </Section>
      )}

      <Section title={groupLabel(group)} aside={
        <div className={segTrack}>
          {(['skinConditions', 'dimensions'] as const).map((x) => (
            <button key={x} type="button" className={segItem(group === x)} onClick={() => { setGroup(x); if (focus?.kind === 'metric') onFocus?.(null); }}>
              {groupLabel(x)} <span className="tabular-nums opacity-60">{entries(g[x]).length}</span>
            </button>
          ))}
        </div>
      }>
        {metrics.length === 0 ? <p className="text-xs text-zinc-500">—</p> : (
          <>
            <p className="text-[11px] text-zinc-500">{t('Pick one to see it zone by zone on the photo.', 'Pilih salah satu untuk melihatnya per zona di foto.')}</p>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {metrics.map(([k, m]) => {
                const on = picked === k;
                return (
                  <button key={k} type="button" aria-pressed={on} disabled={!onFocus} title={k}
                    onClick={() => onFocus?.(on ? null : { kind: 'metric', group, key: k })}
                    className={`${card} flex flex-col gap-2 p-3.5 text-left transition-all hover:ring-zinc-900/15 ${on ? 'ring-2 ring-amber-400' : ''}`}>
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-medium text-zinc-600">{humanize(k)}</span>
                      <span className={`text-[10px] font-semibold ${on ? 'text-amber-700' : 'text-zinc-300'}`}>{on ? t('On photo ✓', 'Di foto ✓') : '⌖'}</span>
                    </span>
                    <MetricValueView m={m} />
                  </button>
                );
              })}
            </div>
            {picked && (
              <div className="overflow-hidden rounded-xl border border-zinc-100">
                <table className="w-full text-xs">
                  <thead className="bg-zinc-50 text-left text-[10px] uppercase tracking-wider text-zinc-500">
                    <tr><th className="px-3 py-2 font-semibold">{humanize(picked)} · {t('by zone', 'per zona')}</th><th className="px-3 py-2 text-right font-semibold">{t('Reading', 'Hasil')}</th></tr>
                  </thead>
                  <tbody>
                    {zones.map((z, i) => (
                      <tr key={`${dash(z.zoneCode)}-${i}`} className={`border-t border-zinc-100 ${z.isVisible === false ? 'text-zinc-400' : ''}`}>
                        <td className="px-3 py-2">
                          {dash(z.zoneName ?? z.zoneCode)}
                          {z.sourceAngle && z.sourceAngle !== FRONT_ANGLE ? <span className="ml-1 text-[10px] text-zinc-400">({z.sourceAngle.toLowerCase()})</span> : null}
                        </td>
                        <td className="w-40 px-3 py-2 text-right">
                          {z.isVisible === false ? t('not visible', 'tidak terlihat') : <MetricValueView compact m={z.metrics?.[group]?.[picked]} />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </Section>

      <Section title={t('Zones', 'Zona')} aside={<span className="text-[11px] text-zinc-400">{zones.length}</span>}>
        {zones.length === 0 ? <p className="text-xs text-zinc-500">—</p> : (
          <>
            <div className="flex flex-wrap gap-2">
              {zones.map((z, i) => {
                const code = String(z.zoneCode ?? '');
                const on = focus?.kind === 'zone' && focus.code === code;
                const hidden = z.isVisible === false;
                return (
                  <button key={`${code}-${i}`} type="button" disabled={hidden || !onFocus} aria-pressed={on}
                    onClick={() => onFocus?.(on ? null : { kind: 'zone', code })}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition-colors ${hidden ? 'cursor-not-allowed border-dashed border-zinc-200 text-zinc-400' : on ? 'border-amber-400 bg-amber-50 text-amber-900' : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300'}`}
                    title={hidden ? t('Not visible in the photo', 'Tidak terlihat di foto') : undefined}>
                    {dash(z.zoneName ?? z.zoneCode)}
                    <span className="rounded-full bg-zinc-100 px-1.5 text-[10px] font-semibold tabular-nums text-zinc-500">{zoneMetricCount(z)}</span>
                  </button>
                );
              })}
            </div>
            {pickedZone && (
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {(['skinConditions', 'dimensions'] as const).flatMap((x) => entries<MetricValue>(pickedZone.metrics?.[x]).map(([k, m]) => (
                  <div key={`${x}-${k}`} className={`${card} flex flex-col gap-1.5 p-3`}>
                    <span className="truncate text-[11px] text-zinc-500">{humanize(k)}</span>
                    <MetricValueView compact m={m} />
                  </div>
                )))}
              </div>
            )}
          </>
        )}
      </Section>
      {warnings.length > 0 && (
        <Section title={t('Warnings', 'Peringatan')} aside={<span className="text-[11px] text-zinc-400">{warnings.length}</span>}>
          <ul className="flex flex-col gap-1.5 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900 [overflow-wrap:anywhere]">
            {warnings.map((w, i) => <li key={i}><span className="font-mono font-semibold">{dash(w.code)}</span>{w.zoneCode ? ` (${dash(w.zoneCode)})` : ''}: {dash(w.message)}</li>)}
          </ul>
        </Section>
      )}
    </div>
  );
}

export function SkinTab({ state, focus, onFocus }: { state: TabState; focus?: SkinFocus | null; onFocus?(f: SkinFocus | null): void }) {
  return <TabShell state={state}>{(json) => <SkinResult r={(json ?? {}) as VisionAnalysisResult} focus={focus} onFocus={onFocus} />}</TabShell>;
}
