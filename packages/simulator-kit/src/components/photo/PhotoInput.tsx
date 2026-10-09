'use client';
/* eslint-disable @next/next/no-img-element -- blob/object URLs, not optimisable */
import { CameraCapture } from '../CameraCapture';
import { useFileSrc } from '../../lib/blob';
import { btnPrimary, btnSecondary, cardPad, eyebrow, segItem, segTrack } from '../ui';
import { useLang } from '../../lib/i18n';

export type YesNo = 'yes' | 'no' | '';

function UploadButton({ onChange }: { onChange: (f: File | null) => void }) {
  const { t } = useLang();
  return (
    <label className={`${btnSecondary} cursor-pointer`}>
      {t('Upload photo', 'Unggah foto')}
      <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={(e) => { onChange(e.target.files?.[0] ?? null); e.target.value = ''; }} />
    </label>
  );
}

function FaceGlyph({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      <rect x="5" y="5" width="38" height="38" rx="12" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
      <ellipse cx="24" cy="23" rx="8" ry="10" stroke="currentColor" strokeWidth="1.5" />
      <path d="M14 40c2.5-4.5 6-6.5 10-6.5s7.5 2 10 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Left column before there is a front photo: the one required shot. */
export function FrontPicker({ onChange }: { onChange: (f: File | null) => void }) {
  const { t } = useLang();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-semibold">{t('Front photo', 'Foto depan')}</span>
        <span className="text-[11px] font-medium text-zinc-500">{t('required', 'wajib')}</span>
      </div>
      <div className="flex aspect-[4/5] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-zinc-300 bg-gradient-to-b from-zinc-50 to-zinc-100/60 px-6 text-center">
        <FaceGlyph className="h-14 w-14 text-zinc-400" />
        <div>
          <p className="text-sm font-medium text-zinc-700">{t('Face the camera straight on', 'Wajah lurus ke kamera')}</p>
          <p className="mt-0.5 text-xs text-zinc-500">{t('Take one with the camera or upload a JPEG/PNG.', 'Ambil dengan kamera atau unggah JPEG/PNG.')}</p>
        </div>
        <div className="mt-1 flex flex-wrap items-start justify-center gap-2">
          {/* The front photo is checked live against the colour engine's quality rules (capture/). */}
          <CameraCapture onShot={onChange} primary check />
          <UploadButton onChange={onChange} />
        </div>
      </div>
    </div>
  );
}

type Side = 'left' | 'right';
const SIDE_LABEL: Record<Side, [string, string]> = { left: ['Left ¾', 'Kiri ¾'], right: ['Right ¾', 'Kanan ¾'] };
// From the person's own point of view, as the face worker's view gate expects (seagull-web SideShots).
const SIDE_HINT: Record<Side, [string, string]> = { left: ['Turn to your left', 'Menoleh ke kirimu'], right: ['Turn to your right', 'Menoleh ke kananmu'] };

function SideSlot({ side, file, onChange, disabled }: { side: Side; file: File | null; onChange: (f: File | null) => void; disabled?: boolean }) {
  const src = useFileSrc(file);
  const { t } = useLang();
  const label = t(...SIDE_LABEL[side]);
  return (
    <div className="flex flex-col gap-2">
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-dashed border-zinc-300 bg-zinc-50 text-center text-[11px] text-zinc-500">
        {file ? <img ref={src} alt={`${t('Photo', 'Foto')} ${label}`} className="h-full w-full object-cover" />
          : <span className="px-2"><span className="block text-xs font-semibold text-zinc-700">{label}</span>{t(...SIDE_HINT[side])}</span>}
        {file && !disabled && (
          <button type="button" onClick={() => onChange(null)} aria-label={`${t('Remove photo', 'Hapus foto')} ${label}`}
            className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-xs text-zinc-700 shadow-sm hover:bg-white">✕</button>
        )}
      </div>
      {!disabled && !file && (
        <div className="flex flex-wrap items-center gap-1.5">
          <CameraCapture onShot={onChange} />
          <UploadButton onChange={onChange} />
        </div>
      )}
    </div>
  );
}

/** The optional UV photo: the face under UV light, for spots, porphyrin, sebum and unevenness. */
export function UvShot({ uv, setUv, disabled }: { uv: File | null; setUv(f: File | null): void; disabled?: boolean }) {
  const { t } = useLang();
  const src = useFileSrc(uv);
  return (
    <div className="flex flex-col gap-2.5 border-t border-zinc-100 pt-4">
      <div className="flex items-baseline justify-between gap-2">
        <span className={eyebrow}>{t('UV photo · optional', 'Foto UV · opsional')}</span>
        <span className="text-[11px] text-zinc-500">{disabled ? t('Retake to change', 'Foto ulang untuk mengganti') : t('for the UV analysis', 'untuk analisis UV')}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-violet-300 bg-violet-50 text-center text-[11px] text-violet-700">
          {uv ? <img ref={src} alt={t('UV photo', 'Foto UV')} className="h-full w-full object-cover" /> : <span className="px-1 font-semibold">UV</span>}
          {uv && !disabled && (
            <button type="button" onClick={() => setUv(null)} aria-label={t('Remove UV photo', 'Hapus foto UV')}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-[10px] text-zinc-700 shadow-sm hover:bg-white">✕</button>
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-1.5">
          {!disabled && !uv && (
            <div className="flex flex-wrap items-center gap-1.5">
              <CameraCapture onShot={setUv} />
              <UploadButton onChange={setUv} />
            </div>
          )}
          {!disabled && <p className="text-[11px] leading-relaxed text-zinc-500">{t('The face under UV light (365–375 nm), room lights off. A normal photo is flagged, not analysed as UV.', 'Wajah di bawah sinar UV (365–375 nm), lampu ruangan mati. Foto biasa ditandai, tidak dianalisis sebagai UV.')}</p>}
        </div>
      </div>
    </div>
  );
}

/** The optional three-quarter views for the 3D head and skin, left and right. */
export function SideShots({ left, right, setLeft, setRight, disabled }: {
  left: File | null; right: File | null; setLeft(f: File | null): void; setRight(f: File | null): void; disabled?: boolean;
}) {
  const { t } = useLang();
  return (
    <div className="flex flex-col gap-2.5 border-t border-zinc-100 pt-4">
      <div className="flex items-baseline justify-between gap-2">
        <span className={eyebrow}>{t('Side photos · optional', 'Foto samping · opsional')}</span>
        <span className="text-[11px] text-zinc-500">{disabled ? t('Retake to change', 'Foto ulang untuk mengganti') : t('for a more accurate 3D head', 'untuk kepala 3D lebih akurat')}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <SideSlot side="left" file={left} onChange={setLeft} disabled={disabled} />
        <SideSlot side="right" file={right} onChange={setRight} disabled={disabled} />
      </div>
      {!disabled && <p className="text-[11px] leading-relaxed text-zinc-500">{t('Face turned part-way (three-quarter), not full profile; same light and distance as the front photo.', 'Wajah menoleh sebagian (tiga perempat), bukan profil penuh; cahaya dan jarak sama dengan foto depan.')}</p>}
    </div>
  );
}

function YesNoField({ label, value, onChange }: { label: string; value: YesNo; onChange: (v: YesNo) => void }) {
  const { t } = useLang();
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-2.5 text-sm">
      <span className="text-zinc-700">{label}</span>
      <div className={segTrack} role="radiogroup" aria-label={label}>
        {(['yes', 'no'] as const).map((v) => (
          <button key={v} type="button" role="radio" aria-checked={value === v} onClick={() => onChange(v)} className={`${segItem(value === v)} min-w-14`}>
            {v === 'yes' ? t('Yes', 'Ya') : t('No', 'Tidak')}
          </button>
        ))}
      </div>
    </div>
  );
}

const TIPS: { title: [string, string]; body: [string, string] }[] = [
  { title: ['Even light', 'Cahaya merata'], body: ['Face the light; avoid harsh shadows and backlight.', 'Hadap sumber cahaya; hindari bayangan keras dan cahaya dari belakang.'] },
  { title: ['Face uncovered', 'Wajah terbuka'], body: ['No glasses; hair off the forehead and cheeks.', 'Tanpa kacamata; rambut tidak menutupi dahi dan pipi.'] },
  { title: ['Neutral expression', 'Ekspresi netral'], body: ['Eyes open, mouth closed, head level.', 'Mata terbuka, mulut tertutup, kepala tegak.'] },
  { title: ['No filters', 'Tanpa filter'], body: ['The camera’s own photo, no beauty mode or colour edits.', 'Foto asli kamera, tanpa beauty mode atau edit warna.'] },
];

/** Photo guidance, beside the picker before there is a front photo. */
export function PhotoTips() {
  const { t } = useLang();
  return (
    <div className={cardPad}>
      <p className={eyebrow}>{t('Photo tips', 'Tips foto')}</p>
      <ul className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {TIPS.map((tip) => (
          <li key={tip.title[0]} className="flex gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[11px] font-bold text-emerald-600 ring-1 ring-inset ring-emerald-200">✓</span>
            <span className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">{t(...tip.title)}</span>
              <span className="text-xs leading-relaxed text-zinc-500">{t(...tip.body)}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Right column once the front photo is in: the two questions and Analisis. */
export function Questions({ hijab, hair, setHijab, setHair, brandReady, onAnalyze }: {
  hijab: YesNo; hair: YesNo; setHijab(v: YesNo): void; setHair(v: YesNo): void; brandReady: boolean; onAnalyze(): void;
}) {
  const { t } = useLang();
  const missing = [!hijab && t('the head-covering answer', 'jawaban hijab'), !hair && t('the hair answer', 'jawaban rambut'), !brandReady && t('brand and application (top)', 'brand dan aplikasi (atas)')].filter(Boolean);
  return (
    <div className={`${cardPad} flex flex-col gap-4`}>
      <div>
        <p className={eyebrow}>{t('Before analysing', 'Sebelum analisis')}</p>
        <p className="mt-1 text-sm text-zinc-500">{t('These two answers go to the colour analysis with the photo.', 'Dua jawaban ini dikirim bersama foto ke analisis warna.')}</p>
      </div>
      <div className="divide-y divide-zinc-100">
        <YesNoField label={t('Wearing a hijab or head covering?', 'Memakai hijab atau penutup kepala?')} value={hijab} onChange={setHijab} />
        <YesNoField label={t('Is hair visible in the photo?', 'Rambut terlihat di foto?')} value={hair} onChange={setHair} />
      </div>
      <button type="button" disabled={missing.length > 0} onClick={onAnalyze} className={`${btnPrimary} w-full rounded-full py-2.5`}>
        {t('Analyse now', 'Analisis sekarang')}
      </button>
      {missing.length > 0 && <span className="text-center text-xs text-zinc-500">{t('Still needed', 'Belum lengkap')}: {missing.join(', ')}</span>}
    </div>
  );
}
