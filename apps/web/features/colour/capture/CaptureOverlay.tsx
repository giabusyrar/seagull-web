'use client';

import React, { useEffect, useRef } from 'react';
import { AlertCircle, CheckCircle2, Eye, Info, Loader2, Smile, Sun, Target } from 'lucide-react';
import { cn } from '@gateway-experience/shared';
import { QC_ADVICE } from '../types';
import { CHECK_GROUPS, checkStates, firstAdvice, type CheckGroupId, type CheckState, type Point } from './qc';
import type { CaptureCheck, MeshLine } from './useCaptureCheck';

const CHIP_ICON = 'h-3.5 w-3.5 shrink-0';

const CHIPS: Record<CheckGroupId, { label: string; icon: React.ReactNode }> = {
  light: { label: 'Pencahayaan', icon: <Sun className={CHIP_ICON} /> },
  position: { label: 'Posisi wajah', icon: <Target className={CHIP_ICON} /> },
  pose: { label: 'Hadap lurus', icon: <Eye className={CHIP_ICON} /> },
  expression: { label: 'Ekspresi netral', icon: <Smile className={CHIP_ICON} /> },
};

// Same tones as the shared StatusBadge: emerald passes, rose fails.
const CHIP_TONE: Record<CheckState, string> = {
  ok: 'bg-emerald-50/95 text-emerald-800 border-emerald-200',
  fail: 'bg-rose-50/95 text-rose-800 border-rose-200',
  pending: 'bg-background/90 text-muted-foreground border-border',
};

const STATE_TEXT: Record<CheckState, string> = {
  ok: '(sudah pas)',
  fail: '(belum pas)',
  pending: '(menunggu)',
};

/** The checks, as chips along the top of the camera view. */
export function CheckChips({ check }: { check: CaptureCheck }) {
  if (check.status === 'unavailable') return null;
  const states = check.status === 'running' ? checkStates(check.metrics, check.failed) : null;
  return (
    <ul aria-label="Cek foto" className="pointer-events-none absolute left-1/2 top-2.5 grid w-max -translate-x-1/2 grid-cols-2 gap-1.5">
      {CHECK_GROUPS.map(({ id }) => {
        const state = states?.[id] ?? 'pending';
        return (
          <li
            key={id}
            className={cn(
              'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold shadow-xs backdrop-blur-xs transition-colors',
              CHIP_TONE[state],
            )}
          >
            {CHIPS[id].icon}
            {CHIPS[id].label}
            <span className="sr-only">{STATE_TEXT[state]}</span>
          </li>
        );
      })}
    </ul>
  );
}

/** One line at the bottom of the camera view: what to fix first, or that the photo can be taken. */
export function CheckMessage({ check }: { check: CaptureCheck }) {
  const ok = 'bg-emerald-50/95 text-emerald-800 border-emerald-200';
  const muted = 'bg-background/95 text-muted-foreground border-border';
  const icon = 'mt-px h-3.5 w-3.5 shrink-0';
  let text: string;
  let tone = muted;
  let symbol: React.ReactNode = <Info className={icon} />;

  if (check.status === 'loading') {
    text = 'Menyiapkan cek otomatis…';
    symbol = <Loader2 className={cn(icon, 'animate-spin')} />;
  } else if (check.status === 'unavailable') {
    text = 'Cek otomatis tidak aktif. Pastikan wajah terlihat jelas dan cahayanya cukup.';
  } else if (check.ready) {
    text = 'Sudah pas. Ambil foto sekarang.';
    tone = ok;
    symbol = <CheckCircle2 className={icon} />;
  } else if (check.passing) {
    text = 'Tahan posisi…';
    tone = ok;
    symbol = <Loader2 className={cn(icon, 'animate-spin')} />;
  } else {
    const code = firstAdvice(check.failed);
    text = code ? QC_ADVICE[code] : 'Posisikan wajah di dalam bingkai.';
    tone = 'bg-background/95 text-foreground border-border';
    symbol = <AlertCircle className={cn(icon, 'text-rose-600')} />;
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-3">
      <p
        role="status"
        aria-live="polite"
        className={cn('flex max-w-[92%] items-start gap-2 rounded-xl border px-3 py-2 text-xs font-semibold shadow-xs backdrop-blur-xs', tone)}
      >
        {symbol}
        <span>{text}</span>
      </p>
    </div>
  );
}

/** Where to put the face; solid emerald once every check passes. */
export function FaceGuide({ ready }: { ready: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div
        className={cn(
          'w-[62%] aspect-[3/4] rounded-[50%] border-2 transition-colors',
          ready ? 'border-solid border-emerald-400' : 'border-dashed border-background/80',
        )}
      />
    </div>
  );
}

/**
 * The detected face mesh over the video. The canvas sits exactly on the
 * video (same box, same mirroring); the landmarks are relative to the visible
 * part of the frame, which is this box. Line colour is the canvas' CSS colour
 * (className).
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
