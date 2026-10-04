'use client';
/* eslint-disable @next/next/no-img-element -- blob/object URLs, not optimisable */
import { CameraCapture } from '@/components/CameraCapture';
import { useFileSrc } from '@/lib/blob';

export type YesNo = 'yes' | 'no' | '';

function PhotoSlot({ label, hint, file, onChange }: { label: string; hint: string; file: File | null; onChange: (f: File | null) => void }) {
  const src = useFileSrc(file);
  return (
    <div className="flex flex-col gap-2 rounded border border-zinc-200 p-3">
      <div className="text-sm font-medium">{label}</div>
      <div className="flex h-40 items-center justify-center overflow-hidden rounded bg-zinc-100 text-xs text-zinc-500">
        {file ? <img ref={src} alt={label} className="h-full w-full object-contain" /> : hint}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="cursor-pointer rounded border border-zinc-300 px-2 py-0.5 text-xs hover:bg-zinc-100">
          Pilih file
          <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={(e) => { onChange(e.target.files?.[0] ?? null); e.target.value = ''; }} />
        </label>
        <CameraCapture onShot={onChange} />
        {file && <button type="button" className="text-xs text-zinc-500 underline" onClick={() => onChange(null)}>Hapus</button>}
      </div>
      {file && <div className="truncate text-xs text-zinc-500">{file.name} · {Math.round(file.size / 1024)} KB</div>}
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

export interface PhotoInputProps {
  front: File | null; left: File | null; right: File | null;
  setFront(f: File | null): void; setLeft(f: File | null): void; setRight(f: File | null): void;
  hijab: YesNo; hair: YesNo; setHijab(v: YesNo): void; setHair(v: YesNo): void;
  brandReady: boolean;
  onAnalyze(): void;
}

export function PhotoInput(p: PhotoInputProps) {
  const missing = [
    !p.front && 'foto depan',
    !p.hijab && 'jawaban hijab',
    !p.hair && 'jawaban rambut',
    !p.brandReady && 'brand dan aplikasi (atas)',
  ].filter(Boolean);
  return (
    <section className="mx-auto flex max-w-4xl flex-col gap-4">
      <h1 className="text-lg font-semibold">1. Foto</h1>
      <div className="grid gap-3 md:grid-cols-3">
        <PhotoSlot label="Depan (wajib)" hint="Foto wajah lurus ke kamera" file={p.front} onChange={p.setFront} />
        <PhotoSlot label="Kiri ¾ (opsional)" hint="Wajah menoleh ke kiri" file={p.left} onChange={p.setLeft} />
        <PhotoSlot label="Kanan ¾ (opsional)" hint="Wajah menoleh ke kanan" file={p.right} onChange={p.setRight} />
      </div>
      <div className="flex flex-col gap-3 rounded border border-zinc-200 p-3">
        <YesNoField label="Memakai hijab atau penutup kepala?" value={p.hijab} onChange={p.setHijab} />
        <YesNoField label="Rambut terlihat di foto?" value={p.hair} onChange={p.setHair} />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" disabled={missing.length > 0} onClick={p.onAnalyze}
          className="rounded bg-zinc-900 px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-zinc-300">
          Analisis
        </button>
        {missing.length > 0 && <span className="text-xs text-zinc-500">Belum lengkap: {missing.join(', ')}</span>}
      </div>
    </section>
  );
}
