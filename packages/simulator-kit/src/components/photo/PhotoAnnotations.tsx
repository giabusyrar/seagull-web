'use client';
import { useEffect, useState } from 'react';
import type { FaceMarks, ZoneBox } from '../../lib/annotations';
import { SEAGULL_HEX } from '../ui';

/** What to draw over the photo: the face measurements, or the skin zones. */
export type Annotations = { kind: 'face'; data: FaceMarks } | { kind: 'skin'; data: ZoneBox[] };

/** The photo's pixel size, which face landmarks are expressed in. */
function useNaturalSize(file: File) {
  const [size, setSize] = useState<{ file: File; w: number; h: number } | null>(null);
  useEffect(() => {
    const u = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => setSize({ file, w: img.naturalWidth, h: img.naturalHeight });
    img.src = u;
    return () => URL.revokeObjectURL(u);
  }, [file]);
  return size && size.file === file ? size : null;
}

// Marks are sized as a share of the photo's longer side, so they read the
// same on a phone selfie and a studio shot. Lines keep a fixed screen width.
const UNIT_SHARE = 0.01;
const BADGE_R = 1.7;
const FONT = 1.9;
const MESH_R = 0.18;
const LINE_PX = 2;

const { beak: BEAK, slate: SLATE } = SEAGULL_HEX;

/**
 * An SVG laid over an object-contain photo: the viewBox is the photo's own
 * pixels and `meet` letterboxes it exactly as object-contain does, so marks
 * land on the right spot at any frame size.
 */
export function PhotoAnnotations({ photo, annotations }: { photo: File; annotations: Annotations }) {
  const size = useNaturalSize(photo);
  if (!size) return null;
  const { w, h } = size;
  const u = Math.max(w, h) * UNIT_SHARE;
  const badge = (x: number, y: number, text: string, key: string, title: string) => (
    <g key={key}>
      <title>{title}</title>
      <circle cx={x} cy={y} r={BADGE_R * u} fill={SLATE} stroke="white" strokeWidth={0.3 * u} />
      <text x={x} y={y} fill="white" fontSize={FONT * u} fontWeight={700} textAnchor="middle" dominantBaseline="central">{text}</text>
    </g>
  );
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
      {annotations.kind === 'face' ? (
        <>
          <g fill="white" opacity={0.45}>
            {annotations.data.landmarks.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={MESH_R * u} />)}
          </g>
          {annotations.data.marks.map((m) => (
            <polyline key={`l${m.n}`} points={m.points.map((p) => p.join(',')).join(' ')} fill="none" stroke={BEAK} strokeWidth={LINE_PX} vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
          ))}
          {annotations.data.marks.map((m) => m.points.map(([x, y], i) => <circle key={`p${m.n}-${i}`} cx={x} cy={y} r={0.45 * u} fill={BEAK} stroke="white" strokeWidth={0.15 * u} />))}
          <g className="pointer-events-auto">
            {annotations.data.marks.map((m) => {
              // A line is numbered at its middle; an angle at its vertex.
              const [x, y] = m.points.length === 3 ? m.points[1] : [(m.points[0][0] + m.points[1][0]) / 2, (m.points[0][1] + m.points[1][1]) / 2];
              return badge(x, y, String(m.n), `b${m.n}`, m.key);
            })}
          </g>
        </>
      ) : (
        annotations.data.map((z) => (
          <g key={z.code}>
            <rect x={z.x * w} y={z.y * h} width={z.w * w} height={z.h * h} rx={0.6 * u} fill={`${BEAK}1f`} stroke={BEAK} strokeWidth={LINE_PX} vectorEffect="non-scaling-stroke" />
            <text x={z.x * w + 0.6 * u} y={z.y * h + 0.6 * u} fontSize={FONT * u} fontWeight={600} fill="white" stroke={SLATE} strokeWidth={0.35 * u} paintOrder="stroke" dominantBaseline="hanging">{z.name}</text>
          </g>
        ))
      )}
    </svg>
  );
}
