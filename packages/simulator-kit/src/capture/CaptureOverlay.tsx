'use client';
import { useEffect, useRef } from 'react';
import { QC_ADVICE } from '../lib/types/colour';
import { useLang } from '../lib/i18n';
import { CHECK_GROUPS, checkStates, firstAdvice, type CheckGroupId, type CheckState, type Point } from './qc';
import type { CaptureCheck, MeshLine } from './useCaptureCheck';

const CHIP_LABEL: Record<CheckGroupId, [string, string]> = {
  light: ['Lighting', 'Pencahayaan'],
  position: ['Face position', 'Posisi wajah'],
  pose: ['Facing straight', 'Hadap lurus'],
  expression: ['Neutral face', 'Ekspresi netral'],
};

const CHIP_TONE: Record<CheckState, string> = {
  ok: 'bg-emerald-50/95 text-emerald-800 ring-emerald-200',
  fail: 'bg-red-50/95 text-red-800 ring-red-200',
  pending: 'bg-white/90 text-zinc-500 ring-zinc-200',
};

const CHIP_MARK: Record<CheckState, string> = { ok: '✓', fail: '!', pending: '…' };

/** The checks, as chips along the top of the camera view. */
export function CheckChips({ check }: { check: CaptureCheck }) {
  const { lang, t } = useLang();
  if (check.status === 'unavailable') return null;
  const states = check.status === 'running' ? checkStates(check.metrics, check.failed) : null;
  return (
    <ul aria-label={t('Photo check', 'Cek foto')} className="pointer-events-none absolute left-1/2 top-2.5 grid w-max -translate-x-1/2 grid-cols-2 gap-1.5">
      {CHECK_GROUPS.map(({ id }) => {
        const state = states?.[id] ?? 'pending';
        return (
          <li key={id} className={`inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm ring-1 backdrop-blur-sm transition-colors ${CHIP_TONE[state]}`}>
            <span aria-hidden className="tabular-nums">{CHIP_MARK[state]}</span>
            {CHIP_LABEL[id][lang === 'id' ? 1 : 0]}
          </li>
        );
      })}
    </ul>
  );
}

/** One line at the bottom of the camera view: what to fix first, or that the photo can be taken. */
export function CheckMessage({ check }: { check: CaptureCheck }) {
  const { lang, t } = useLang();
  let text: string;
  let tone = 'bg-white/95 text-zinc-600 ring-zinc-200';
  if (check.status === 'loading') {
    text = t('Preparing the photo check…', 'Menyiapkan cek otomatis…');
  } else if (check.status === 'unavailable') {
    text = t('Photo check is off. Make sure the face is clearly visible and well lit.', 'Cek otomatis tidak aktif. Pastikan wajah terlihat jelas dan cahayanya cukup.');
  } else if (check.ready) {
    text = t('All good. Take the photo now.', 'Sudah pas. Ambil foto sekarang.');
    tone = 'bg-emerald-50/95 text-emerald-800 ring-emerald-200';
  } else if (check.passing) {
    text = t('Hold still…', 'Tahan posisi…');
    tone = 'bg-emerald-50/95 text-emerald-800 ring-emerald-200';
  } else {
    const code = firstAdvice(check.failed);
    text = code ? QC_ADVICE[lang][code] ?? code : t('Put your face inside the frame.', 'Posisikan wajah di dalam bingkai.');
    tone = 'bg-white/95 text-zinc-900 ring-zinc-200';
  }
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-3">
      <p role="status" aria-live="polite" className={`max-w-[92%] rounded-xl px-3 py-2 text-xs font-semibold shadow-sm ring-1 backdrop-blur-sm ${tone}`}>{text}</p>
    </div>
  );
}

/** Where to put the face; solid green once every check passes. */
export function FaceGuide({ ready }: { ready: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className={`aspect-[3/4] w-[62%] rounded-[50%] border-2 transition-colors ${ready ? 'border-solid border-emerald-400' : 'border-dashed border-white/80'}`} />
    </div>
  );
}

/**
 * The detected face mesh over the video. The canvas sits exactly on the video
 * (same box, same mirroring); the landmarks are relative to the visible part
 * of the frame, which is this box. Line colour is the canvas' CSS colour.
 */
export function FaceMesh({ face, mesh, className }: { face: Point[] | null; mesh: MeshLine[] | null; className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = canvas.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const bw = c.clientWidth;
    const bh = c.clientHeight;
    if (c.width !== Math.round(bw * dpr) || c.height !== Math.round(bh * dpr)) {
      c.width = Math.round(bw * dpr);
      c.height = Math.round(bh * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, bw, bh);
    if (!face || !mesh) return;
    ctx.beginPath();
    for (const { start, end } of mesh) {
      const a = face[start];
      const b = face[end];
      if (!a || !b) continue;
      ctx.moveTo(a.x * bw, a.y * bh);
      ctx.lineTo(b.x * bw, b.y * bh);
    }
    ctx.strokeStyle = getComputedStyle(c).color;
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }, [face, mesh]);
  return <canvas ref={canvas} aria-hidden className={className} />;
}
