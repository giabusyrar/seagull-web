'use client';
/* eslint-disable @next/next/no-img-element -- a data: URL from the response, not optimisable */
import { uvByCapability, type UvCapabilityView, type UvResult, type UvStatus } from '../../lib/types/uv';
import type { Bilingual } from '../../lib/i18n';
import { useLang } from '../../lib/i18n';
import { card, eyebrow } from '../ui';
import { Pill, Section, TabShell, dash, humanize, num, type TabState } from './TabShell';

const STATUS: Record<UvStatus, { cls: string; en: string; id: string }> = {
  uncalibrated: { cls: 'bg-zinc-100 text-zinc-600 ring-1 ring-inset ring-zinc-200', en: 'Not calibrated — raw measurement', id: 'Belum terkalibrasi — pengukuran mentah' },
  ranked: { cls: 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200', en: 'Ranked in population — not accuracy', id: 'Peringkat populasi — bukan akurasi' },
  calibrated: { cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200', en: 'Calibrated to a reference', id: 'Terkalibrasi ke referensi' },
};

/** Why a zone was not measured, in the worker's codes (schemas/uv.py SkipReason). */
const SKIP: Bilingual = {
  en: { NOT_VISIBLE: 'not visible', ZONE_TOO_SMALL: 'zone too small', INSUFFICIENT_SKIN: 'too little skin', NO_MEASURABLE_PIXELS: 'nothing measurable', BASELINE_TOO_BRIGHT: 'too bright for fluorescence to show' },
  id: { NOT_VISIBLE: 'tidak terlihat', ZONE_TOO_SMALL: 'zona terlalu kecil', INSUFFICIENT_SKIN: 'kulit terlalu sedikit', NO_MEASURABLE_PIXELS: 'tidak ada yang terukur', BASELINE_TOO_BRIGHT: 'terlalu terang untuk fluoresensi' },
};

const capName = (c: string) => humanize(c.replace(/^uv\./, ''));
const zoneName = (z: string) => humanize(z.replace(/^ZONE_/, '').toLowerCase());
/** Counts are whole numbers; fractions and areas keep enough digits to compare zones. */
const fmt = (metric: string, v: number) => (metric === 'count' ? String(Math.round(v)) : num(v, Math.abs(v) < 1 ? 4 : 2));

function Capability({ c }: { c: UvCapabilityView }) {
  const { lang, t } = useLang();
  const status = STATUS[c.info.status as UvStatus];
  const ranked = c.zones.some((z) => Object.keys(z.rank).length > 0);
  return (
    <div className={`${card} flex flex-col gap-3 p-4`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold">{capName(c.capability)}</span>
        {status && <Pill className={status.cls}>{lang === 'id' ? status.id : status.en}</Pill>}
      </div>
      {c.info.unit && <p className="text-[11px] leading-relaxed text-zinc-500 [overflow-wrap:anywhere]">{c.info.unit}</p>}
      {c.info.proxy && <p className="text-[11px] leading-snug text-amber-700 [overflow-wrap:anywhere]">{t('Proxy', 'Proksi')}: {c.info.proxy}</p>}
      {c.zones.length === 0 ? <p className="text-xs text-zinc-500">{t('No zone measured.', 'Tidak ada zona yang terukur.')}</p> : (
        <div className="overflow-x-auto rounded-xl border border-zinc-100">
          <table className="w-full text-xs tabular-nums">
            <thead className="bg-zinc-50 text-left text-[10px] uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-3 py-2 font-semibold">{t('Zone', 'Zona')}</th>
                {c.metrics.map((m) => <th key={m} className="px-3 py-2 text-right font-semibold normal-case">{m}</th>)}
                {ranked && <th className="px-3 py-2 text-right font-semibold">{t('Rank', 'Peringkat')}</th>}
              </tr>
            </thead>
            <tbody>
              {c.zones.map((z) => (
                <tr key={z.zone} className="border-t border-zinc-100">
                  <td className="px-3 py-1.5 text-zinc-700">{zoneName(z.zone)}</td>
                  {c.metrics.map((m) => <td key={m} className="px-3 py-1.5 text-right font-semibold">{z.values[m] === undefined ? '—' : fmt(m, z.values[m])}</td>)}
                  {ranked && (
                    <td className="px-3 py-1.5 text-right text-zinc-500" title={t('Percentile among faces measured on this device', 'Persentil di antara wajah yang diukur di perangkat ini')}>
                      {Object.values(z.rank).length ? Object.values(z.rank).map((v) => `P${Math.round(v)}`).join(' · ') : '—'}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {c.estimates.length > 0 && (
        <ul className="flex flex-col gap-1 text-[11px] text-zinc-600">
          {c.estimates.map((e, i) => (
            <li key={i}>
              {t('Estimate', 'Estimasi')} ({dash(e.source)}{e.scale ? `, ${e.scale}` : ''}): <span className="font-semibold tabular-nums text-zinc-900">{num(e.value, 2)}</span>
              {e.agreement && <span className="text-zinc-400"> · Spearman {e.agreement.spearman == null ? '—' : num(e.agreement.spearman, 2)}, MAE {num(e.agreement.mae, 2)}, n {dash(e.agreement.n)}</span>}
            </li>
          ))}
        </ul>
      )}
      {c.skipped.length > 0 && (
        <p className="text-[11px] text-zinc-500">
          {t('Not measured', 'Tidak terukur')}: {c.skipped.map((s) => `${zoneName(s.zone)} (${SKIP[lang][s.reason] ?? s.reason})`).join(', ')}
        </p>
      )}
    </div>
  );
}

export function UvResultView({ r }: { r: UvResult }) {
  const { t } = useLang();
  const caps = uvByCapability(r);
  const warnings = Array.isArray(r.warnings) ? r.warnings : [];
  const overlay = r.overlay && typeof r.overlay.png === 'string' ? r.overlay : null;
  return (
    <div className="flex flex-col gap-6">
      {(warnings.length > 0 || r.calibrationError) && (
        <ul className="flex flex-col gap-1 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          {warnings.map((w, i) => (
            <li key={i}>
              {w.code === 'UV_ILLUMINATION_UNCERTAIN'
                ? t(`The skin looks lit by visible light (${num((w.value ?? 0) * 100, 0)}% visible): this may not be a UV photo, so the readings may not be fluorescence.`,
                  `Kulit tampak diterangi cahaya tampak (${num((w.value ?? 0) * 100, 0)}% tampak): mungkin bukan foto UV, jadi hasilnya mungkin bukan fluoresensi.`)
                : <><span className="font-mono">{dash(w.code)}</span>{w.value !== undefined ? ` (${num(w.value, 2)})` : ''}</>}
            </li>
          ))}
          {r.calibrationError && <li>{t('Calibration could not be read; every measure is shown uncalibrated.', 'Kalibrasi tidak terbaca; semua ukuran ditampilkan tanpa kalibrasi.')} <span className="font-mono">{r.calibrationError}</span></li>}
        </ul>
      )}
      <p className="text-[11px] leading-relaxed text-zinc-500">
        {t('Raw readings per zone in each measure\'s own unit, not 0–100 scores. A zone that could not be measured is listed, never shown as 0.',
          'Hasil mentah per zona dalam satuan masing-masing ukuran, bukan skor 0–100. Zona yang tidak terukur dicantumkan, tidak ditampilkan sebagai 0.')}
      </p>
      <div className="grid gap-3 xl:grid-cols-2">
        {caps.map((c) => <Capability key={c.capability} c={c} />)}
      </div>
      {overlay && (
        <Section title={t('Annotated photo', 'Foto beranotasi')}>
          <figure className={`${card} flex flex-col gap-3 overflow-hidden p-3`}>
            <img src={`data:image/png;base64,${overlay.png}`} alt={t('UV photo with the found spots, porphyrin and sebum outlined', 'Foto UV dengan bintik, porfirin dan sebum yang ditemukan diberi garis')} className="mx-auto max-h-[60vh] w-auto rounded-lg" />
            <figcaption className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-500">
              {Object.entries(overlay.legend ?? {}).map(([k, hex]) => (
                <span key={k} className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: hex }} />{humanize(k)}</span>
              ))}
              <span className={eyebrow}>{t('Illustration, not a measurement', 'Ilustrasi, bukan pengukuran')}</span>
            </figcaption>
          </figure>
        </Section>
      )}
    </div>
  );
}

export function UvTab({ state }: { state: TabState }) {
  return <TabShell state={state}>{(json) => <UvResultView r={(json ?? {}) as UvResult} />}</TabShell>;
}
