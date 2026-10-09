'use client';
import type { ReactNode } from 'react';
import { useLang } from '../lib/i18n';
import { LIGHT_COLOUR, QC_THRESHOLDS } from './config';
import { lightColourOf, type LightColour, type LiveMetrics, type LiveQcCode } from './qc';

type Tone = 'ok' | 'fail' | 'warn' | 'pending';

const TONE_TEXT: Record<Tone, string> = { ok: 'text-emerald-700', fail: 'text-red-700', warn: 'text-amber-700', pending: 'text-zinc-500' };
const TONE_KNOB: Record<Tone, string> = { ok: 'bg-emerald-600', fail: 'bg-red-600', warn: 'bg-amber-500', pending: 'bg-zinc-400' };

const LIGHT_CODES: readonly LiveQcCode[] = ['terlalu_gelap', 'terlalu_terang', 'cahaya_campuran'];

// What the meter read; the advice (what to do) is in the camera view's message.
const LIGHT_TEXT: Partial<Record<LiveQcCode, { label: [string, string]; note: [string, string] }>> = {
  terlalu_gelap: { label: ['Too dark', 'Terlalu gelap'], note: ['The facial skin reads too dark.', 'Kulit wajah terbaca terlalu gelap.'] },
  terlalu_terang: { label: ['Too bright', 'Terlalu terang'], note: ['Part of the facial skin is too bright.', 'Ada bagian kulit wajah yang terlalu terang.'] },
  cahaya_campuran: { label: ['Mixed light', 'Cahaya campuran'], note: ['The light colour differs between the left and right of the face.', 'Warna cahaya di sisi kiri dan kanan wajah berbeda.'] },
};

const COLOUR_TEXT: Record<LightColour, { label: [string, string]; tone: Tone; note: [string, string] }> = {
  hangat: { label: ['Yellowish', 'Kekuningan'], tone: 'warn', note: ['Skin may read warmer. Most accurate under white light.', 'Warna kulit bisa terbaca lebih hangat. Hasil paling akurat di cahaya putih.'] },
  netral: { label: ['Neutral', 'Netral'], tone: 'ok', note: ['The light colour suits colour analysis.', 'Warna cahaya pas untuk analisis warna.'] },
  sejuk: { label: ['Bluish', 'Kebiruan'], tone: 'warn', note: ['Skin may read cooler. Most accurate under white light.', 'Warna kulit bisa terbaca lebih sejuk. Hasil paling akurat di cahaya putih.'] },
};

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** sRGB colour of light at a colour temperature, for the meter's scale only (Tanner Helland's blackbody fit). */
function kelvinRgb(k: number): string {
  const t = k / 100;
  const r = t <= 66 ? 255 : 329.698727446 * (t - 60) ** -0.1332047592;
  const g = t <= 66 ? 99.4708025861 * Math.log(t) - 161.1195681661 : 288.1221695283 * (t - 60) ** -0.0755148492;
  const b = t >= 66 ? 255 : t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  const c = (v: number) => Math.round(Math.min(255, Math.max(0, v)));
  return `rgb(${c(r)} ${c(g)} ${c(b)})`;
}

const kelvinPos = (k: number) => clamp01((k - LIGHT_COLOUR.SCALE_MIN_K) / (LIGHT_COLOUR.SCALE_MAX_K - LIGHT_COLOUR.SCALE_MIN_K));

/** Gradient stops for the colour-temperature scale: enough to look smooth. */
const SCALE_STOPS = 8;
const COLOUR_SCALE = `linear-gradient(to right, ${Array.from({ length: SCALE_STOPS + 1 }, (_, i) => {
  const k = LIGHT_COLOUR.SCALE_MIN_K + ((LIGHT_COLOUR.SCALE_MAX_K - LIGHT_COLOUR.SCALE_MIN_K) * i) / SCALE_STOPS;
  return `${kelvinRgb(k)} ${((i / SCALE_STOPS) * 100).toFixed(1)}%`;
}).join(', ')})`;
const BRIGHTNESS_SCALE = 'linear-gradient(to right, rgb(15 23 42), rgb(248 250 252))';

function Meter({ title, value, tone, scale, position, ticks, ends, note }: {
  title: string; value: ReactNode; tone: Tone; scale: string; position: number | null; ticks: number[]; ends: [string, string]; note: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2 rounded-xl bg-zinc-50 px-3 py-2.5 ring-1 ring-zinc-100">
      <div className="flex flex-col gap-0.5">
        <span className="truncate text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{title}</span>
        <span className={`text-sm font-semibold ${TONE_TEXT[tone]}`}>{value}</span>
      </div>
      <div className="relative h-1.5 rounded-full ring-1 ring-zinc-200" style={{ background: scale }}>
        {ticks.map((x) => <span key={x} className="absolute -bottom-0.5 -top-0.5 w-px bg-zinc-900/40" style={{ left: `${x * 100}%` }} />)}
        {position !== null && (
          <span className={`absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-sm transition-[left] duration-300 ${TONE_KNOB[tone]}`} style={{ left: `${position * 100}%` }} />
        )}
      </div>
      <div className="flex justify-between text-[10px] text-zinc-500"><span>{ends[0]}</span><span>{ends[1]}</span></div>
      <p className="text-[11px] leading-snug text-zinc-500">{note}</p>
    </div>
  );
}

/**
 * Brightness and colour of the light. Brightness is the engine's check on the
 * face (median L*, clipped share, left/right hue). The colour is the
 * full-frame light estimate the engine corrects for, so it only warns; the
 * kelvin figure estimates the cast left after the camera's own white balance,
 * hence "≈".
 */
export function LightingMeters({ metrics, failed }: { metrics: LiveMetrics | null; failed: readonly LiveQcCode[] }) {
  const { lang, t } = useLang();
  const i = lang === 'id' ? 1 : 0;
  const measured = !!metrics?.face_found && Number.isFinite(metrics.L_med);
  const lightCode = measured ? LIGHT_CODES.find((c) => failed.includes(c)) : undefined;
  // A face that fills the frame pulls the light estimate towards skin colour (the engine's FACE_FRAC_MAX), so the colour is not read then.
  const faceFills = failed.includes('wajah_besar');
  const colour = measured && metrics && !faceFills ? lightColourOf(metrics.cct) : null;
  return (
    <div className="grid grid-cols-2 gap-2">
      <Meter
        title={t('Brightness', 'Kecerahan')}
        value={!measured ? t('Waiting for a face', 'Menunggu wajah') : lightCode ? LIGHT_TEXT[lightCode]?.label[i] : t('Good', 'Pas')}
        tone={!measured ? 'pending' : lightCode ? 'fail' : 'ok'}
        scale={BRIGHTNESS_SCALE}
        position={measured && metrics ? clamp01(metrics.L_med / 100) : null}
        ticks={[QC_THRESHOLDS.L_MEDIAN_MIN / 100]}
        ends={[t('Dark', 'Gelap'), t('Bright', 'Terang')]}
        note={!measured ? t('Measured on the facial skin.', 'Diukur dari kulit wajah.') : lightCode ? LIGHT_TEXT[lightCode]?.note[i] ?? '' : t('Bright and even enough for colour analysis.', 'Cukup terang dan rata untuk analisis warna.')}
      />
      <Meter
        title={t('Light colour', 'Warna cahaya')}
        value={colour && metrics ? `${COLOUR_TEXT[colour].label[i]} · ≈${(Math.round(metrics.cct / 100) * 100).toLocaleString(lang === 'id' ? 'id-ID' : 'en-US')} K` : faceFills ? t('Not read yet', 'Belum terbaca') : t('Waiting for a face', 'Menunggu wajah')}
        tone={colour ? COLOUR_TEXT[colour].tone : 'pending'}
        scale={COLOUR_SCALE}
        position={colour && metrics ? kelvinPos(metrics.cct) : null}
        ticks={[kelvinPos(LIGHT_COLOUR.WARM_BELOW_K), kelvinPos(LIGHT_COLOUR.COOL_ABOVE_K)]}
        ends={[t('Yellowish', 'Kekuningan'), t('Bluish', 'Kebiruan')]}
        note={colour ? COLOUR_TEXT[colour].note[i] : faceFills ? t('The face fills the picture, so the light colour cannot be read yet.', 'Wajah memenuhi gambar, jadi warna cahaya belum bisa dibaca.') : t('Measured on the whole picture.', 'Diukur dari seluruh gambar.')}
      />
    </div>
  );
}
