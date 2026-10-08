'use client';
import { useEffect, useRef, useState } from 'react';
import { zoomBox, type FaceMarks, type LesionMark, type Point, type ViewBox, type ZoneBox } from '../../lib/annotations';
import { BAND_FILL_OPACITY, lesionColour } from '../../lib/lesionColours';
import type { SeverityTone } from '@gateway-experience/shared';
import { SEAGULL_HEX, TONE_HEX } from '../ui';

/** A trait the viewer picked: the photo zooms to its measurements and labels each. */
export interface FaceFocus { title: string; items: { key: string; label: string }[] }

/**
 * A skin view on the photo: each zone's reading of one metric (label + tone),
 * or one zone singled out. Zones without an entry are dimmed.
 */
export interface SkinView { title: string; zones: Record<string, { label?: string; tone: SeverityTone }>; highlight?: string }

/** What to draw over the photo: the face measurements (optionally one trait's), or the skin zones (optionally one view). */
export type Annotations =
  | { kind: 'face'; data: FaceMarks; focus?: FaceFocus | null }
  | { kind: 'skin'; data: ZoneBox[]; view?: SkinView | null; lesions?: { marks: LesionMark[]; mode: 'outline' | 'gradient' } | null };

/** The photo's pixel size, which face landmarks are expressed in, and a URL to draw it again when zoomed. */
function usePhoto(file: File) {
  const [photo, setPhoto] = useState<{ file: File; url: string; w: number; h: number } | null>(null);
  useEffect(() => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => setPhoto({ file, url, w: img.naturalWidth, h: img.naturalHeight });
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return photo && photo.file === file ? photo : null;
}

/** How long a zoom takes; skipped when the system asks for reduced motion. */
const ZOOM_MS = 380;
const easeOut = (t: number) => 1 - (1 - t) ** 3;

/** Eases the shown view box toward `target`. */
function useAnimatedBox(target: ViewBox): ViewBox {
  const [box, setBox] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const start = from.current;
    const still = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const k = still ? 1 : easeOut(Math.min(1, (now - t0) / ZOOM_MS));
      const next = { x: start.x + (target.x - start.x) * k, y: start.y + (target.y - start.y) * k, w: start.w + (target.w - start.w) * k, h: start.h + (target.h - start.h) * k };
      from.current = next;
      setBox(next);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target.x, target.y, target.w, target.h]);
  return box;
}

// Marks are sized as a share of the shown area's longer side, so they read the
// same on a phone selfie, a studio shot and a zoomed-in feature. Lines keep a
// fixed screen width.
const UNIT_SHARE = 0.01;
const BADGE_R = 1.7;
const FONT = 1.9;
const MESH_R = 0.18;
const LINE_PX = 2;

const { beak: BEAK, slate: SLATE } = SEAGULL_HEX;

const centre = (pts: Point[]): Point => (pts.length === 3 ? pts[1] : [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length]);

/**
 * An SVG laid over an object-contain photo: the viewBox is the photo's own
 * pixels and `meet` letterboxes it exactly as object-contain does, so marks
 * land on the right spot at any frame size. Zoomed to a trait, it draws the
 * photo itself under the marks and eases the viewBox to that feature.
 */
export function PhotoAnnotations({ photo, annotations }: { photo: File; annotations: Annotations }) {
  const img = usePhoto(photo);
  // Drawn once the photo's size is known, so the first view is the whole photo, not a zoom from nothing.
  return img ? <Overlay key={img.url} img={img} annotations={annotations} /> : null;
}

function Overlay({ img, annotations }: { img: { url: string; w: number; h: number }; annotations: Annotations }) {
  const focus = annotations.kind === 'face' ? annotations.focus : null;
  const focusPts = focus && annotations.kind === 'face' ? focus.items.flatMap((i) => annotations.data.points[i.key] ?? []) : [];
  const target = zoomBox(focusPts, img.w, img.h) ?? { x: 0, y: 0, w: img.w, h: img.h };
  const box = useAnimatedBox(target);
  const zoomed = box.w < img.w - 0.5 || box.h < img.h - 0.5;
  const u = Math.max(box.w, box.h) * UNIT_SHARE;

  const badge = (x: number, y: number, text: string, key: string, title: string) => (
    <g key={key}>
      <title>{title}</title>
      <circle cx={x} cy={y} r={BADGE_R * u} fill={SLATE} stroke="white" strokeWidth={0.3 * u} />
      <text x={x} y={y} fill="white" fontSize={FONT * u} fontWeight={700} textAnchor="middle" dominantBaseline="central">{text}</text>
    </g>
  );
  const line = (pts: Point[], key: string) => (
    <polyline key={key} points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke={BEAK} strokeWidth={LINE_PX} vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
  );
  const dots = (pts: Point[], key: string, r = 0.45) => pts.map(([x, y], i) => <circle key={`${key}-${i}`} cx={x} cy={y} r={r * u} fill={BEAK} stroke="white" strokeWidth={0.15 * u} />);

  return (
    <svg viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`} preserveAspectRatio="xMidYMid meet" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
      {zoomed && <image href={img.url} x={0} y={0} width={img.w} height={img.h} />}
      {annotations.kind === 'face' ? (
        <>
          <g fill="white" opacity={0.45}>
            {annotations.data.landmarks.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={MESH_R * u} />)}
          </g>
          {focus ? (
            focus.items.map((item) => {
              const pts = annotations.data.points[item.key];
              if (!pts) return null;
              const [x, y] = centre(pts);
              return (
                <g key={item.key}>
                  {pts.length <= 3 ? line(pts, `l-${item.key}`) : null}
                  {dots(pts, item.key, pts.length <= 3 ? 0.45 : 0.3)}
                  <text x={x} y={y - 1.4 * u} fontSize={FONT * 0.8 * u} fontWeight={600} fill="white" stroke={SLATE} strokeWidth={0.35 * u} paintOrder="stroke" textAnchor="middle">
                    {item.label}
                  </text>
                </g>
              );
            })
          ) : (
            <>
              {annotations.data.marks.map((m) => line(m.points, `l${m.n}`))}
              {annotations.data.marks.map((m) => dots(m.points, `p${m.n}`))}
              <g className="pointer-events-auto">
                {annotations.data.marks.map((m) => {
                  // A line is numbered at its middle; an angle at its vertex.
                  const [x, y] = centre(m.points);
                  return badge(x, y, String(m.n), `b${m.n}`, m.key);
                })}
              </g>
            </>
          )}
        </>
      ) : (
        <>
          {annotations.data.map((z) => {
          const view = annotations.view;
          const entry = view?.zones[z.code];
          // No view: every zone in the accent. A metric view: each zone in its severity's colour,
          // dimmed where the zone has no reading. A zone view: that zone only.
          const colour = !view ? BEAK : entry ? TONE_HEX[entry.tone] : TONE_HEX.neutral;
          const dim = !!view && (view.highlight ? view.highlight !== z.code : !entry);
          return (
            <g key={z.code} opacity={dim ? 0.3 : 1}>
              <rect x={z.x * img.w} y={z.y * img.h} width={z.w * img.w} height={z.h * img.h} rx={0.6 * u}
                fill={`${colour}${view && !dim ? '40' : '1f'}`} stroke={colour} strokeWidth={view?.highlight === z.code ? LINE_PX * 1.5 : LINE_PX} vectorEffect="non-scaling-stroke" />
              <text x={z.x * img.w + 0.6 * u} y={z.y * img.h + 0.6 * u} fontSize={FONT * u} fontWeight={600} fill="white" stroke={SLATE} strokeWidth={0.35 * u} paintOrder="stroke" dominantBaseline="hanging">
                {z.name}
                {entry?.label && <tspan x={z.x * img.w + 0.6 * u} dy={FONT * 1.15 * u} fontWeight={700}>{entry.label}</tspan>}
              </text>
            </g>
          );
          })}
          {annotations.lesions && (
            <g className="pointer-events-auto">
              {annotations.lesions.marks.map((l, i) => {
                const colour = lesionColour(l.label);
                const fill = annotations.lesions!.mode === 'gradient' && l.band ? BAND_FILL_OPACITY[l.band] : 0;
                return (
                  <rect key={`lesion-${i}`} x={l.x * img.w} y={l.y * img.h} width={l.w * img.w} height={l.h * img.h}
                    fill={colour} fillOpacity={fill} stroke={colour} strokeWidth={LINE_PX} vectorEffect="non-scaling-stroke">
                    <title>{`${l.label}${l.score === null ? '' : ` · ${Math.round(l.score * 100)}%`}${l.deltaE00 === null ? '' : ` · ΔE00 ${l.deltaE00.toFixed(1)} (colour uncalibrated)`}`}</title>
                  </rect>
                );
              })}
            </g>
          )}
        </>
      )}
    </svg>
  );
}
