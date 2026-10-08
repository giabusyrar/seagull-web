// What the backend located on the photo, ready to draw over it. Only
// coordinates core actually sends are used; nothing is estimated here.
//
// - Face architecture: `landmarks` is the 478-point MediaPipe mesh in pixels
//   of the uploaded photo (core facearch/interpret.go, null unless all 478 are
//   finite), and each measurement lists the landmark indices it spans.
// - Skin analysis: each zone's `boundingBox` is normalised 0-1 on the photo it
//   came from (`sourceAngle`); invisible zones carry an all-zero box.

import type { FaceArchitectureResult } from './types/face';
import { metricDisplay, type AcneLesion, type ContrastBand, type VisionAnalysisResult } from './types/skin';

export type Point = [number, number];

/** A measurement drawn as a line (two anchors) or an angle (three). `n` numbers it on the photo and in the table. */
export interface FaceMark { n: number; key: string; points: Point[] }

/** points: every measurement's anchors on the photo, by key (any count), for zooming to it. */
export interface FaceMarks { landmarks: Point[]; marks: FaceMark[]; points: Record<string, Point[]> }

/** Part of the photo to show, in its pixels. */
export interface ViewBox { x: number; y: number; w: number; h: number }

/** Zone box in 0-1 of the photo's width and height. */
export interface ZoneBox { code: string; name: string; x: number; y: number; w: number; h: number }

const finite = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isPoint = (p: unknown): p is Point => Array.isArray(p) && p.length >= 2 && finite(p[0]) && finite(p[1]);

/**
 * The mesh, the measurements that can be drawn on it, and every measurement's
 * anchors. A numbered mark needs 2 or 3 anchors and a value; an anchor outside
 * the mesh drops the measurement rather than placing it somewhere approximate.
 */
export function faceMarks(r: FaceArchitectureResult | null | undefined): FaceMarks | null {
  const raw = r?.landmarks;
  if (!Array.isArray(raw) || !raw.every(isPoint)) return null;
  const landmarks = raw.map((p) => [p[0], p[1]] as Point);
  const marks: FaceMark[] = [];
  const points: Record<string, Point[]> = {};
  for (const m of Array.isArray(r?.measurements) ? r.measurements : []) {
    const anchors = Array.isArray(m?.landmarks) ? m.landmarks.map((i) => (Number.isInteger(i) ? landmarks[i] : undefined)) : [];
    if (m?.key && anchors.length && anchors.every(Boolean)) points[m.key] = anchors as Point[];
    // Numbered on the photo: a line (2 anchors) or an angle (3) with a value.
    if (!m || m.value === null || m.value === undefined || !points[m.key] || (anchors.length !== 2 && anchors.length !== 3)) continue;
    marks.push({ n: marks.length + 1, key: m.key, points: points[m.key] });
  }
  return { landmarks, marks, points };
}

// How a zoom frames a feature: a margin around its points, and never closer
// than a share of the photo's longer side, so a two-point measurement is not
// blown up to a few pixels. Presentation choices, not measurements.
const ZOOM_MARGIN_SHARE = 0.35;
const ZOOM_MIN_SHARE = 0.28;

/**
 * The part of a w×h photo that shows all `pts`: their bounding box with a
 * margin, at least ZOOM_MIN_SHARE of the photo, widened to the photo's own
 * aspect (so it fills the frame) and kept inside the photo. null without points.
 */
export function zoomBox(pts: Point[], w: number, h: number): ViewBox | null {
  if (!pts.length || !(w > 0) || !(h > 0)) return null;
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const floor = Math.max(w, h) * ZOOM_MIN_SHARE;
  let bw = Math.max((Math.max(...xs) - Math.min(...xs)) * (1 + 2 * ZOOM_MARGIN_SHARE), floor);
  let bh = Math.max((Math.max(...ys) - Math.min(...ys)) * (1 + 2 * ZOOM_MARGIN_SHARE), floor);
  if (bw / bh > w / h) bh = (bw * h) / w;
  else bw = (bh * w) / h;
  bw = Math.min(bw, w);
  bh = Math.min(bh, h);
  const x = Math.min(Math.max(cx - bw / 2, 0), w - bw);
  const y = Math.min(Math.max(cy - bh / 2, 0), h - bh);
  return { x, y, w: bw, h: bh };
}

/** Core's ImageAngle for the front photo (core-engine vision/domain/zones.go), the one the stage shows. */
export const FRONT_ANGLE = 'FRONT';

/** Zones seen on the photo from `angle` (core's ImageAngle; the front photo is "FRONT"). */
export function skinZoneBoxes(r: VisionAnalysisResult | null | undefined, angle: string): ZoneBox[] {
  const zones = Array.isArray(r?.zoneBreakdown) ? r.zoneBreakdown : [];
  return zones.flatMap((z) => {
    const b = z?.boundingBox;
    if (!z || z.isVisible === false || z.sourceAngle !== angle || !b) return [];
    const { minX, minY, maxX, maxY } = b;
    if (![minX, minY, maxX, maxY].every(finite) || maxX <= minX || maxY <= minY) return [];
    const code = String(z.zoneCode ?? '');
    return [{ code, name: String(z.zoneName ?? code), x: minX, y: minY, w: maxX - minX, h: maxY - minY }];
  });
}

/** A skin view the viewer picked: one metric across the zones, or one zone. */
export type SkinFocus =
  | { kind: 'metric'; group: 'skinConditions' | 'dimensions'; key: string }
  | { kind: 'zone'; code: string }
  | { kind: 'acne'; mode: 'outline' | 'gradient' };

/** A lesion to draw: its box in 0-1 of the FRONT photo, as core sent it. */
export interface LesionMark {
  label: string; x: number; y: number; w: number; h: number; score: number;
  inflammatory: boolean; deltaE00: number | null; band: ContrastBand | null;
}

/** The acne lesions core placed on the FRONT photo; a box outside the photo or not finite is left out. */
export function acneMarks(r: { acne?: { sourceAngle?: string; lesions?: AcneLesion[] } } | null | undefined): LesionMark[] {
  const a = r?.acne;
  if (!a || a.sourceAngle !== FRONT_ANGLE || !Array.isArray(a.lesions)) return [];
  return a.lesions.flatMap((l) => {
    const b = l?.box;
    if (!l?.label || !b || ![b.x, b.y, b.w, b.h].every(finite)) return [];
    const { x, y, w, h } = b as { x: number; y: number; w: number; h: number };
    if (w <= 0 || h <= 0 || x < 0 || y < 0 || x + w > 1 || y + h > 1) return [];
    return [{
      label: l.label, x, y, w, h, score: finite(l.score) ? l.score : 0,
      inflammatory: l.inflammatory === true,
      deltaE00: finite(l.deltaE00) ? l.deltaE00 : null,
      band: l.contrastBand ?? null,
    }];
  });
}

/** One metric's reading in each zone seen on the `angle` photo, as the backend gave it per zone. */
export function zoneMetric(r: VisionAnalysisResult | null | undefined, angle: string, group: 'skinConditions' | 'dimensions', key: string) {
  const zones = Array.isArray(r?.zoneBreakdown) ? r.zoneBreakdown : [];
  return zones
    .filter((z) => z && z.isVisible !== false && z.sourceAngle === angle)
    .map((z) => ({ code: String(z.zoneCode ?? ''), name: String(z.zoneName ?? z.zoneCode ?? ''), display: metricDisplay(z.metrics?.[group]?.[key]) }));
}
