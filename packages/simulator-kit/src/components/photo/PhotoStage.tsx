'use client';
/* eslint-disable @next/next/no-img-element -- blob/object URLs, not optimisable */
import { useState } from 'react';
import { LazyGlbViewer as GlbViewer } from '../LazyGlbViewer';
import { useFileSrc } from '../../lib/blob';
import { btnGhost, btnSecondary, segItem, segTrack } from '../ui';
import { ErrorBox, type TabState } from './TabShell';
import { PhotoAnnotations, type Annotations } from './PhotoAnnotations';
import { RenderedIn, TryOnOverlay } from './TryOnProgress';
import { HeadReportPanel } from './HeadReportPanel';
import { useLang } from '../../lib/i18n';

const FRAME = 'relative overflow-hidden rounded-xl bg-zinc-100';
const view2d = (canShow3d: boolean, picked: '2d' | '3d') => !canShow3d || picked === '2d';
const IMG = 'mx-auto block max-h-[62vh] w-full object-contain';

/**
 * Before/after: the original photo under the try-on render, the render
 * clipped to the left of a draggable divider. Both are the same photo
 * frame, so they line up.
 */
function Compare({ photoRef, tryOnUrl, renderedMs, children }: { photoRef: (el: HTMLImageElement | null) => void; tryOnUrl: string; renderedMs?: number | null; children?: React.ReactNode }) {
  const [pos, setPos] = useState(50);
  const { t } = useLang();
  return (
    <div className={FRAME}>
      <img ref={photoRef} alt={t('Original photo', 'Foto asli')} className={IMG} />
      <img src={tryOnUrl} alt={t('Try-on render', 'Hasil try-on')} className={`${IMG} absolute inset-0 h-full`} style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }} />
      <div className="pointer-events-none absolute inset-y-0" style={{ left: `${pos}%` }}>
        <div className="absolute inset-y-0 -ml-px w-0.5 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.08)]" />
        <div className="absolute top-1/2 -ml-4 -mt-4 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[11px] font-bold text-zinc-700 shadow-md">⇆</div>
      </div>
      {children}
      <span className="absolute left-2.5 top-2.5 flex items-center gap-1.5">
        <span className="rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white">Try-on</span>
        {renderedMs != null && <RenderedIn ms={renderedMs} />}
      </span>
      <span className="absolute right-2.5 top-2.5 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white">{t('Original', 'Asli')}</span>
      <input type="range" min={0} max={100} value={pos} onChange={(e) => setPos(Number(e.target.value))} aria-label={t('Drag to compare before and after', 'Geser perbandingan sebelum dan sesudah')}
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0" />
    </div>
  );
}

/** The photo (or its latest try-on render) in 2D, the head GLB in 3D. */
export function PhotoStage({ photo, tryOnUrl, tryOnTiming, head, glbUrl, onRetake, canShow3d, annotations, onClearFocus }: {
  photo: File; tryOnUrl: string | null; head: TabState; glbUrl: string | null; onRetake(): void; canShow3d: boolean;
  /** startedAt: a render is under way since then; lastMs: how long the shown one took. */
  tryOnTiming?: { startedAt: number | null; lastMs: number | null };
  /** What the open results tab located on the photo; drawn over the 2D view. */
  annotations?: Annotations | null;
  /** Zooms back out from a focused trait. */
  onClearFocus?(): void;
}) {
  const { t } = useLang();
  const [picked, setView] = useState<'2d' | '3d'>('2d');
  const [marksOn, setMarksOn] = useState(true);
  const focus = annotations?.kind === 'face' ? annotations.focus : annotations?.kind === 'skin' ? annotations.view : null;
  const back = annotations?.kind === 'skin' ? t('Show all zones', 'Tampilkan semua zona') : t('Show whole face', 'Tampilkan seluruh wajah');
  // A focused trait always shows its marks, whatever the toggle says.
  const marks = annotations && (marksOn || focus) ? <PhotoAnnotations photo={photo} annotations={annotations} /> : null;
  const focusChip = focus && view2d(canShow3d, picked) ? (
    <button type="button" onClick={onClearFocus}
      className="absolute left-2.5 top-2.5 z-10 inline-flex items-center gap-1.5 rounded-full bg-slate-900/85 px-2.5 py-1 text-[11px] font-semibold text-white shadow-md hover:bg-slate-900">
      <span aria-hidden>⤢</span>{focus.title} · <span className="font-normal text-white/80">{back}</span>
    </button>
  ) : null;
  const rendering = tryOnTiming?.startedAt != null ? <TryOnOverlay startedAt={tryOnTiming.startedAt} /> : null;
  const overlay = <>{marks}{rendering}{focusChip}</>;
  const view = canShow3d ? picked : '2d';
  const src = useFileSrc(photo);
  const placeholder = (text: string, pulse = false) => (
    <div className={`${FRAME} flex aspect-[4/5] items-center justify-center p-6 text-center text-sm text-zinc-500 ${pulse ? 'animate-pulse' : ''}`}>{text}</div>
  );
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className={segTrack}>
          {(['2d', '3d'] as const).map((v) => (
            <button key={v} type="button" onClick={() => setView(v)} disabled={v === '3d' && !canShow3d}
              title={v === '3d' && !canShow3d ? t('Available after analysing', 'Tersedia setelah Analisis') : undefined} className={segItem(view === v)}>
              {v.toUpperCase()}{v === '3d' && head.loading ? ' …' : ''}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {annotations && view === '2d' && (
            <button type="button" onClick={() => setMarksOn((v) => !v)} aria-pressed={marksOn} className={btnSecondary}>
              {marksOn ? t('Hide marks', 'Sembunyikan tanda') : t('Show marks', 'Tampilkan tanda')}
            </button>
          )}
          <button type="button" onClick={onRetake} className={btnSecondary}>{t('Retake', 'Foto ulang')}</button>
        </div>
      </div>
      {view === '2d' ? (
        tryOnUrl ? (
          <div className="flex flex-col gap-1.5">
            <Compare photoRef={src} tryOnUrl={tryOnUrl} renderedMs={rendering ? null : tryOnTiming?.lastMs}>{overlay}</Compare>
            <p className="text-center text-[11px] text-zinc-500">{t('Drag to compare before and after.', 'Geser untuk membandingkan sebelum dan sesudah.')}</p>
          </div>
        ) : (
          <div className={FRAME}><img ref={src} alt={t('Front photo', 'Foto depan')} className={IMG} />{overlay}</div>
        )
      ) : glbUrl ? (
        <div className="flex flex-col gap-1.5">
          <div className={FRAME}><GlbViewer src={glbUrl} /></div>
          <HeadReportPanel glbUrl={glbUrl} />
          <a className={`${btnGhost} self-end`} href={glbUrl} download="head.glb">{t('Download .glb', 'Unduh .glb')}</a>
        </div>
      ) : head.loading ? (
        placeholder(t('Building the 3D head…', 'Membuat model kepala 3D…'), true)
      ) : head.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-900">{head.error}</p>
      ) : head.result && !head.result.ok ? (
        <ErrorBox result={head.result} />
      ) : head.result ? (
        placeholder(`${t('Response', 'Respons')} ${head.result.status}: ${t('not a GLB file', 'bukan file GLB')} (${head.result.kind}).`)
      ) : (
        placeholder(t('No 3D model yet.', 'Belum ada model 3D.'))
      )}
    </div>
  );
}
