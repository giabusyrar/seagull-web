'use client';

import React from 'react';
import { Sun, Thermometer } from 'lucide-react';
import { cn } from '@gateway-experience/shared';
import { LIGHT_COLOUR, QC_THRESHOLDS } from './config';
import { lightColourOf, type LightColour, type LiveMetrics, type LiveQcCode } from './qc';

type Tone = 'ok' | 'fail' | 'warn' | 'pending';

const TONE_TEXT: Record<Tone, string> = {
  ok: 'text-emerald-700',
  fail: 'text-rose-700',
  warn: 'text-amber-700',
  pending: 'text-muted-foreground',
};

const TONE_KNOB: Record<Tone, string> = {
  ok: 'bg-emerald-600',
  fail: 'bg-rose-600',
  warn: 'bg-amber-500',
  pending: 'bg-muted-foreground',
};

const LIGHT_CODES: readonly LiveQcCode[] = ['terlalu_gelap', 'terlalu_terang', 'cahaya_campuran'];

// What the meter read. The advice (what to do) is in the camera view's message.
const LIGHT_TEXT: Partial<Record<LiveQcCode, { label: string; note: string }>> = {
  terlalu_gelap: { label: 'Terlalu gelap', note: 'Kulit wajah terbaca terlalu gelap.' },
  terlalu_terang: { label: 'Terlalu terang', note: 'Ada bagian kulit wajah yang terlalu terang.' },
  cahaya_campuran: { label: 'Cahaya campuran', note: 'Warna cahaya di sisi kiri dan kanan wajah berbeda.' },
};

const COLOUR_TEXT: Record<LightColour, { label: string; tone: Tone; note: string }> = {
  hangat: { label: 'Kekuningan', tone: 'warn', note: 'Warna kulit bisa terbaca lebih hangat. Hasil paling akurat di cahaya putih.' },
  netral: { label: 'Netral', tone: 'ok', note: 'Warna cahaya pas untuk analisis warna.' },
  sejuk: { label: 'Kebiruan', tone: 'warn', note: 'Warna kulit bisa terbaca lebih sejuk. Hasil paling akurat di cahaya putih.' },
};

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/**
 * sRGB colour of light at a colour temperature, for the meter's scale only
 * (Tanner Helland's fit of the blackbody curve).
 */
function kelvinRgb(k: number): string {
  const t = k / 100;
  const r = t <= 66 ? 255 : 329.698727446 * (t - 60) ** -0.1332047592;
  const g = t <= 66 ? 99.4708025861 * Math.log(t) - 161.1195681661 : 288.1221695283 * (t - 60) ** -0.0755148492;
  const b = t >= 66 ? 255 : t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  const c = (v: number) => Math.round(Math.min(255, Math.max(0, v)));
  return `rgb(${c(r)} ${c(g)} ${c(b)})`;
}

const kelvinPos = (k: number) => clamp01((k - LIGHT_COLOUR.SCALE_MIN_K) / (LIGHT_COLOUR.SCALE_MAX_K - LIGHT_COLOUR.SCALE_MIN_K));

const COLOUR_SCALE = (() => {
  const stops = 8;
  const parts: string[] = [];
  for (let i = 0; i <= stops; i++) {
    const k = LIGHT_COLOUR.SCALE_MIN_K + ((LIGHT_COLOUR.SCALE_MAX_K - LIGHT_COLOUR.SCALE_MIN_K) * i) / stops;
    parts.push(`${kelvinRgb(k)} ${((i / stops) * 100).toFixed(1)}%`);
  }
  return `linear-gradient(to right, ${parts.join(', ')})`;
})();

// Dark to light.
const BRIGHTNESS_SCALE = 'linear-gradient(to right, rgb(15 23 42), rgb(248 250 252))';

function Meter({
  title,
  icon,
  value,
  tone,
  scale,
  position,
  ticks,
  ends,
  note,
}: {
  title: string;
  icon: React.ReactNode;
  value: string;
  tone: Tone;
  scale: string;
  position: number | null;
  ticks: number[];
  ends: [string, string];
  note: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-border bg-muted/40 px-3 py-2.5 space-y-2">
      <div className="space-y-0.5">
        <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {icon}
          <span className="truncate">{title}</span>
        </div>
        <div className={cn('text-sm font-semibold', TONE_TEXT[tone])}>{value}</div>
      </div>
      <div className="relative h-1.5 rounded-full border border-border/60" style={{ background: scale }}>
        {ticks.map((t) => (
          <span key={t} className="absolute -top-0.5 -bottom-0.5 w-px bg-foreground/40" style={{ left: `${t * 100}%` }} />
        ))}
        {position !== null && (
          <span
            className={cn(
              'absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background shadow-xs transition-[left] duration-300',
              TONE_KNOB[tone],
            )}
            style={{ left: `${position * 100}%` }}
          />
        )}
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{ends[0]}</span>
        <span>{ends[1]}</span>
      </div>
      <p className="text-[11px] leading-snug text-muted-foreground">{note}</p>
    </div>
  );
}

/**
 * Brightness and colour of the light, like Guardian's pre-analysis light
 * check. Brightness is the engine's check on the face (median L*, clipped
 * share, left/right hue). The colour is the full-frame light estimate the
 * engine corrects for, so it only warns; the kelvin figure is an estimate of
 * the cast left after the camera's own white balance, hence "≈".
 */
export function LightingMeters({ metrics, failed }: { metrics: LiveMetrics | null; failed: readonly LiveQcCode[] }) {
  const measured = !!metrics?.face_found && Number.isFinite(metrics.L_med);
  const lightCode = measured ? LIGHT_CODES.find((c) => failed.includes(c)) : undefined;
  // A face that fills the frame pulls the light estimate towards skin colour
  // (the reason for the engine's FACE_FRAC_MAX), so the colour is not read then.
  const faceFills = failed.includes('wajah_besar');
  const colour = measured && metrics && !faceFills ? lightColourOf(metrics.cct) : null;
  const icon = 'h-3 w-3 shrink-0';

  return (
    <div className="grid grid-cols-2 gap-2">
      <Meter
        title="Kecerahan"
        icon={<Sun className={icon} />}
        value={!measured ? 'Menunggu wajah' : lightCode ? LIGHT_TEXT[lightCode]?.label ?? '' : 'Pas'}
        tone={!measured ? 'pending' : lightCode ? 'fail' : 'ok'}
        scale={BRIGHTNESS_SCALE}
        position={measured && metrics ? clamp01(metrics.L_med / 100) : null}
        ticks={[QC_THRESHOLDS.L_MEDIAN_MIN / 100]}
        ends={['Gelap', 'Terang']}
        note={!measured ? 'Diukur dari kulit wajah.' : lightCode ? LIGHT_TEXT[lightCode]?.note ?? '' : 'Cukup terang dan rata untuk analisis warna.'}
      />
      <Meter
        title="Warna cahaya"
        icon={<Thermometer className={icon} />}
        value={
          colour && metrics
            ? `${COLOUR_TEXT[colour].label} · ≈${(Math.round(metrics.cct / 100) * 100).toLocaleString('id-ID')} K`
            : faceFills
              ? 'Belum terbaca'
              : 'Menunggu wajah'
        }
        tone={colour ? COLOUR_TEXT[colour].tone : 'pending'}
        scale={COLOUR_SCALE}
        position={colour && metrics ? kelvinPos(metrics.cct) : null}
        ticks={[kelvinPos(LIGHT_COLOUR.WARM_BELOW_K), kelvinPos(LIGHT_COLOUR.COOL_ABOVE_K)]}
        ends={['Kekuningan', 'Kebiruan']}
        note={
          colour ? COLOUR_TEXT[colour].note : faceFills ? 'Wajah memenuhi gambar, jadi warna cahaya belum bisa dibaca.' : 'Diukur dari seluruh gambar.'
        }
      />
    </div>
  );
}
