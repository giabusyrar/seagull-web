'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { cn } from '@gateway-experience/shared';

export type Side = 'left' | 'right';
export type Sides = Partial<Record<Side, File>>;

const SIDE_LABEL: Record<Side, string> = { left: 'Kiri ¾', right: 'Kanan ¾' };
// Which way to turn, from the person's own point of view. Matches the face
// worker's view gate (Seagull-core worker_face/head/views.py): a "left" view
// is the subject turned toward their own left, "right" toward their right;
// the other way is rejected as wrong_side.
const SIDE_HINT: Record<Side, string> = { left: 'Menoleh ke kirimu', right: 'Menoleh ke kananmu' };

interface Props {
  sides: Sides;
  onChange: (side: Side, file: File | null) => void;
  disabled?: boolean;
}

/**
 * Two optional photo slots for the three-quarter views the 3D head uses
 * (left and right). Each shows its photo once chosen and can be removed. On
 * a phone the picker offers the camera.
 */
export function SideShots({ sides, onChange, disabled }: Props) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Foto samping (opsional)</span>
        <span className="text-[11px] text-muted-foreground">untuk kepala 3D yang lebih akurat</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {(['left', 'right'] as const).map((side) => (
          <Slot key={side} side={side} file={sides[side]} onChange={(f) => onChange(side, f)} disabled={disabled} />
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground">
        Wajah menoleh sebagian (tiga perempat), bukan profil penuh; cahaya dan jarak sama dengan foto depan.
      </p>
    </div>
  );
}

function Slot({ side, file, onChange, disabled }: { side: Side; file?: File; onChange: (f: File | null) => void; disabled?: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => {
    if (url) URL.revokeObjectURL(url);
  }, [url]);

  return (
    <div className="relative">
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png"
        capture="user"
        className="hidden"
        onChange={(e) => {
          onChange(e.target.files?.[0] ?? null);
          e.target.value = '';
        }}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => input.current?.click()}
        aria-label={file ? `Ganti foto ${SIDE_LABEL[side]}` : `Tambah foto ${SIDE_LABEL[side]}`}
        className={cn(
          'flex aspect-[3/4] w-full flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border text-center transition',
          file ? 'border-border bg-muted/30' : 'border-dashed border-border bg-muted/20 hover:bg-muted/40',
          disabled && 'opacity-50',
        )}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={`Foto ${SIDE_LABEL[side]}`} className="h-full w-full object-cover" />
        ) : (
          <>
            <ImagePlus className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground">{SIDE_LABEL[side]}</span>
            <span className="text-[11px] text-muted-foreground">{SIDE_HINT[side]}</span>
          </>
        )}
      </button>
      {file && (
        <>
          <span className="pointer-events-none absolute left-1.5 top-1.5 rounded-full bg-card/90 px-2 py-0.5 text-[10px] font-bold shadow-xs">
            {SIDE_LABEL[side]}
          </span>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange(null)}
            aria-label={`Hapus foto ${SIDE_LABEL[side]}`}
            className="absolute right-1.5 top-1.5 rounded-full bg-card/90 p-1 shadow-xs hover:bg-card"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </>
      )}
    </div>
  );
}
