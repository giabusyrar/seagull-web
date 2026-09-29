'use client';

import React, { useRef, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { Button, cn } from '@gateway-experience/shared';

const ZOOM_STEPS = [1, 1.5, 2, 3];

interface BeforeAfterProps {
  before: string;
  after: string | null;
  loading?: boolean;
  className?: string;
}

/**
 * Split view: left of the handle is the photo as taken, right of it the
 * try-on. The after image keeps showing while a new render loads.
 */
export function BeforeAfter({ before, after, loading = false, className }: BeforeAfterProps) {
  const box = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50);
  const [zoom, setZoom] = useState(0);
  const dragging = useRef(false);

  const moveTo = (clientX: number) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  };

  const scale = ZOOM_STEPS[zoom];
  const imgStyle: React.CSSProperties = { transform: `scale(${scale})`, transformOrigin: 'center 40%' };

  return (
    <div className={cn('relative', className)}>
      <div
        ref={box}
        className="relative w-full h-full overflow-hidden rounded-2xl bg-muted select-none touch-none"
        onPointerDown={(e) => {
          if (!after) return;
          dragging.current = true;
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          moveTo(e.clientX);
        }}
        onPointerMove={(e) => dragging.current && moveTo(e.clientX)}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => (dragging.current = false)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={before} alt="Foto asli" className="absolute inset-0 w-full h-full object-contain" style={imgStyle} draggable={false} />
        {after && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={after}
            alt="Hasil try-on"
            className="absolute inset-0 w-full h-full object-contain"
            style={{ ...imgStyle, clipPath: `inset(0 0 0 ${pos}%)` }}
            draggable={false}
          />
        )}
        {after && (
          <div className="absolute inset-y-0 pointer-events-none" style={{ left: `${pos}%` }}>
            <div className="absolute inset-y-0 -translate-x-1/2 w-0.5 bg-background/90 shadow" />
            <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background border border-border shadow-md flex items-center justify-center text-[10px] font-bold text-muted-foreground">
              &#8249;&#8250;
            </div>
          </div>
        )}
        {after && (
          <>
            <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-background/80 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Sebelum
            </span>
            <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-background/80 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Sesudah
            </span>
          </>
        )}
        {loading && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-background/85 border border-border text-[11px] text-muted-foreground flex items-center gap-2">
            <span className="h-3 w-3 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
            Menerapkan…
          </div>
        )}
      </div>

      <div className="absolute right-3 bottom-3 flex flex-col gap-1.5">
        <Button variant="outline" size="icon-sm" className="bg-background/90" title="Perbesar" disabled={zoom >= ZOOM_STEPS.length - 1} onClick={() => setZoom((z) => z + 1)}>
          <Plus className="h-3.5 w-3.5" />
        </Button>
        <Button variant="outline" size="icon-sm" className="bg-background/90" title="Perkecil" disabled={zoom === 0} onClick={() => setZoom((z) => z - 1)}>
          <Minus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {after && (
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(pos)}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-label="Geser untuk membandingkan sebelum dan sesudah"
          className="sr-only"
        />
      )}
    </div>
  );
}
