'use client';
/* eslint-disable @next/next/no-img-element -- blob/object URLs, not optimisable */
import { CameraCapture } from '@/components/CameraCapture';
import { useFileSrc } from '@/lib/blob';

export type YesNo = 'yes' | 'no' | '';

function PickButtons({ onChange }: { onChange: (f: File | null) => void }) {
  return (
    <>
      <label className="cursor-pointer rounded border border-zinc-300 px-2 py-0.5 text-xs hover:bg-zinc-100">
        Pilih file
        <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={(e) => { onChange(e.target.files?.[0] ?? null); e.target.value = ''; }} />
      </label>
      <CameraCapture onShot={onChange} />
    </>
  );
}

/** Left column before there is a front photo: the one required shot. */
export function FrontPicker({ onChange }: { onChange: (f: File | null) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="text-sm font-medium">Foto depan (wajib)</div>
      <div className="flex aspect-[3/4] items-center justify-center rounded bg-zinc-100 text-xs text-zinc-500">Foto wajah lurus ke kamera</div>
      <div className="flex flex-wrap items-center gap-2"><PickButtons onChange={onChange} /></div>
    </div>
  );
}

type Side = 'left' | 'right';
const SIDE_LABEL: Record<Side, string> = { left: 'Kiri ¾', right: 'Kanan ¾' };
// From the person's own point of view, as the face worker's view gate expects (seagull-web SideShots).
const SIDE_HINT: Record<Side, string> = { left: 'Menoleh ke kirimu', right: 'Menoleh ke kananmu' };

function SideSlot({ side, file, onChange, disabled }: { side: Side; file: File | null; onChange: (f: File | null) => void; disabled?: boolean }) {
  const src = useFileSrc(file);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded border border-dashed border-zinc-300 bg-zinc-50 text-center text-[11px] text-zinc-500">
        {file ? <img ref={src} alt={`Foto ${SIDE_LABEL[side]}`} className="h-full w-full object-cover" />
          : <span><span className="block font-semibold text-zinc-700">{SIDE_LABEL[side]}</span>{SIDE_HINT[side]}</span>}
      </div>
      {!disabled && (
        <div className="flex flex-wrap items-center gap-2">
          <PickButtons onChange={onChange} />
          {file && <button type="button" className="text-xs text-zinc-500 underline" onClick={() => onChange(null)}>Hapus</button>}
        </div>
      )}
    </div>
  );
}

/** The optional three-quarter views for the 3D head and skin, left and right. */
export function SideShots({ left, right, setLeft, setRight, disabled }: {
  left: File | null; right: File | null; setLeft(f: File | null): void; setRight(f: File | null): void; disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Foto samping (opsional)</span>
        <span className="text-[11px] text-zinc-500">{disabled ? 'Foto ulang untuk mengganti' : 'untuk kepala 3D yang lebih akurat'}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <SideSlot side="left" file={left} onChange={setLeft} disabled={disabled} />
        <SideSlot side="right" file={right} onChange={setRight} disabled={disabled} />
      </div>
      {!disabled && <p className="text-[11px] text-zinc-500">Wajah menoleh sebagian (tiga perempat), bukan profil penuh; cahaya dan jarak sama dengan foto depan.</p>}
    </div>
  );
}

function YesNoField({ label, value, onChange }: { label: string; value: YesNo; onChange: (v: YesNo) => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <span>{label}</span>
      <div className="flex gap-1 rounded border border-zinc-200 bg-zinc-50 p-1">
        {(['yes', 'no'] as const).map((v) => (
          <button key={v} type="button" onClick={() => onChange(v)}
            className={`rounded px-4 py-1 text-xs font-semibold ${value === v ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-zinc-900'}`}>
            {v === 'yes' ? 'Ya' : 'Tidak'}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Right column before there is a front photo. */
export function HowItWorks() {
  return (
    <div className="flex flex-col gap-2 rounded border border-zinc-200 p-4 text-sm">
      <p className="font-semibold">Cara kerjanya</p>
      <ol className="list-decimal space-y-1 pl-5 text-xs text-zinc-600">
        <li>Ambil atau unggah foto depan (kiri). Foto samping kiri/kanan opsional.</li>
        <li>Jawab dua pertanyaan, lalu Analisis: warna, wajah, kulit dan kepala 3D sekaligus.</li>
        <li>Lihat hasil per tab; foto bisa dilihat dalam 2D atau 3D.</li>
      </ol>
    </div>
  );
}

/** Right column once the front photo is in: the two questions and Analisis. */
export function Questions({ hijab, hair, setHijab, setHair, brandReady, onAnalyze }: {
  hijab: YesNo; hair: YesNo; setHijab(v: YesNo): void; setHair(v: YesNo): void; brandReady: boolean; onAnalyze(): void;
}) {
  const missing = [!hijab && 'jawaban hijab', !hair && 'jawaban rambut', !brandReady && 'brand dan aplikasi (atas)'].filter(Boolean);
  return (
    <div className="flex flex-col gap-4 rounded border border-zinc-200 p-4">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Sebelum analisis</div>
      <YesNoField label="Memakai hijab atau penutup kepala?" value={hijab} onChange={setHijab} />
      <YesNoField label="Rambut terlihat di foto?" value={hair} onChange={setHair} />
      <button type="button" disabled={missing.length > 0} onClick={onAnalyze}
        className="w-full rounded bg-zinc-900 px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-zinc-300">
        Analisis
      </button>
      {missing.length > 0 && <span className="text-xs text-zinc-500">Belum lengkap: {missing.join(', ')}</span>}
    </div>
  );
}
