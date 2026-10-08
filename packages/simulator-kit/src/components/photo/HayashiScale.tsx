'use client';
import { HAYASHI_BANDS, hayashiPosition, type HayashiGrade } from '../../lib/hayashi';
import { useLang } from '../../lib/i18n';
import { num } from './TabShell';

/** Severity colours, mildest to worst (Tailwind emerald, amber, red, red-800): a presentation choice. */
const BAND_STYLE: Record<HayashiGrade, { bar: string; chip: string; en: string; id: string }> = {
  mild: { bar: 'bg-emerald-400', chip: 'bg-emerald-50 text-emerald-800 ring-emerald-200', en: 'Mild', id: 'Ringan' },
  moderate: { bar: 'bg-amber-400', chip: 'bg-amber-50 text-amber-800 ring-amber-200', en: 'Moderate', id: 'Sedang' },
  severe: { bar: 'bg-red-500', chip: 'bg-red-50 text-red-700 ring-red-200', en: 'Severe', id: 'Berat' },
  very_severe: { bar: 'bg-red-800', chip: 'bg-red-100 text-red-900 ring-red-300', en: 'Very severe', id: 'Sangat berat' },
};

const range = (i: number) => {
  const lo = i === 0 ? 0 : (HAYASHI_BANDS[i - 1].upTo as number) + 1;
  const hi = HAYASHI_BANDS[i].upTo;
  return hi === null ? `> ${lo - 1}` : `${lo}–${hi}`;
};

/**
 * Core's Hayashi grade on the published scale: the four bands coloured by
 * severity, core's grade highlighted, and core's half-face count marked. The
 * grade is never worked out here; an unknown grade highlights nothing.
 */
export function HayashiScale({ grade, halfFaceCount, inflammatoryCount, source }: {
  grade?: string; halfFaceCount?: number; inflammatoryCount?: number; source?: string;
}) {
  const { lang, t } = useLang();
  const known = grade && grade in BAND_STYLE ? (grade as HayashiGrade) : null;
  const marker = typeof halfFaceCount === 'number' && Number.isFinite(halfFaceCount) ? hayashiPosition(halfFaceCount) : null;
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-wrap items-baseline gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-sm font-semibold ring-1 ring-inset ${known ? BAND_STYLE[known].chip : 'bg-zinc-100 text-zinc-600 ring-zinc-200'}`}>
          {known ? BAND_STYLE[known][lang === 'id' ? 'id' : 'en'] : grade ?? '—'}
        </span>
        <span className="text-sm text-zinc-700">
          <span className="font-semibold tabular-nums">{num(halfFaceCount, 1)}</span> {t('inflammatory lesions per half face', 'lesi meradang per setengah wajah')}
          {typeof inflammatoryCount === 'number' && <span className="text-zinc-500"> ({inflammatoryCount} {t('on the face', 'di wajah')})</span>}
        </span>
      </div>
      <div className="relative pt-3">
        {marker !== null && (
          <span className="absolute top-0 -ml-1.5 h-0 w-0 border-x-[6px] border-t-[8px] border-x-transparent border-t-zinc-900" style={{ left: `${marker * 100}%` }} aria-hidden />
        )}
        <div className="grid grid-cols-4 gap-1">
          {HAYASHI_BANDS.map((b, i) => (
            <div key={b.grade} className="flex flex-col gap-1">
              <span className={`h-2.5 rounded-full ${BAND_STYLE[b.grade].bar} ${known && known !== b.grade ? 'opacity-30' : ''}`} />
              <span className={`text-[10px] leading-tight ${known === b.grade ? 'font-semibold text-zinc-900' : 'text-zinc-500'}`}>
                {BAND_STYLE[b.grade][lang === 'id' ? 'id' : 'en']}<span className="block tabular-nums text-zinc-400">{range(i)}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
      <p className="text-[11px] text-zinc-500">
        {t('Hayashi grade', 'Grade Hayashi')} (J Dermatol 2008){source ? ` · ${source}` : ''}. {t('Detector not validated.', 'Detektor belum divalidasi.')}
      </p>
    </div>
  );
}
