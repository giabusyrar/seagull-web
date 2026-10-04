'use client';
/* eslint-disable @next/next/no-img-element -- blob/object URLs, not optimisable */
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useFileSrc } from '@/lib/blob';
import { ErrorBox, type TabState } from './TabShell';

const GlbViewer = dynamic(() => import('@/components/GlbViewer').then((m) => m.GlbViewer), { ssr: false });

/** The photo (or its latest try-on render) in 2D, the head GLB in 3D. */
export function PhotoStage({ photo, tryOnUrl, head, glbUrl, onRetake, canShow3d }: {
  photo: File; tryOnUrl: string | null; head: TabState; glbUrl: string | null; onRetake(): void; canShow3d: boolean;
}) {
  const [picked, setView] = useState<'2d' | '3d'>('2d');
  const view = canShow3d ? picked : '2d';
  const src = useFileSrc(photo);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1 rounded border border-zinc-200 bg-zinc-50 p-1">
          {(['2d', '3d'] as const).map((v) => (
            <button key={v} type="button" onClick={() => setView(v)} disabled={v === '3d' && !canShow3d}
              title={v === '3d' && !canShow3d ? 'Tersedia setelah Analisis' : undefined}
              className={`rounded px-3 py-1 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${view === v ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-zinc-900'}`}>
              {v.toUpperCase()}{v === '3d' && head.loading ? ' …' : ''}
            </button>
          ))}
        </div>
        <button type="button" onClick={onRetake} className="rounded border border-zinc-300 px-3 py-1 text-xs hover:bg-zinc-100">Foto ulang</button>
      </div>
      {view === '2d' ? (
        <div className="overflow-hidden rounded bg-zinc-100">
          {tryOnUrl ? <img src={tryOnUrl} alt="Hasil try-on" className="mx-auto max-h-[70vh] w-full object-contain" />
            : <img ref={src} alt="Foto depan" className="mx-auto max-h-[70vh] w-full object-contain" />}
          <div className="px-2 py-1 text-[11px] text-zinc-500">{tryOnUrl ? 'Render try-on' : 'Foto asli'}</div>
        </div>
      ) : glbUrl ? (
        <div>
          <GlbViewer src={glbUrl} />
          <a className="text-xs text-zinc-500 underline" href={glbUrl} download="head.glb">unduh .glb</a>
        </div>
      ) : head.loading ? (
        <p className="animate-pulse rounded bg-zinc-100 p-6 text-center text-sm text-zinc-500">Membuat model kepala 3D…</p>
      ) : head.error ? (
        <p className="rounded border border-red-200 bg-red-50 p-3 text-xs text-red-900">{head.error}</p>
      ) : head.result && !head.result.ok ? (
        <ErrorBox result={head.result} />
      ) : head.result ? (
        <p className="rounded bg-zinc-100 p-6 text-center text-xs text-zinc-500">Respons {head.result.status} bukan file GLB ({head.result.kind}).</p>
      ) : (
        <p className="rounded bg-zinc-100 p-6 text-center text-sm text-zinc-500">Belum ada model 3D.</p>
      )}
    </div>
  );
}
