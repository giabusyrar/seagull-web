// What the backend located on the photo, ready to draw over it. Only
// coordinates core actually sends are used; nothing is estimated here.
//
// - Face architecture: `landmarks` is the 478-point MediaPipe mesh in pixels
//   of the uploaded photo (core facearch/interpret.go, null unless all 478 are
//   finite), and each measurement lists the landmark indices it spans.
// - Skin analysis: each zone's `boundingBox` is normalised 0-1 on the photo it
//   came from (`sourceAngle`); invisible zones carry an all-zero box.

import type { FaceArchitectureResult } from './types/face';
import type { VisionAnalysisResult } from './types/skin';

export type Point = [number, number];

/** A measurement drawn as a line (two anchors) or an angle (three). `n` numbers it on the photo and in the table. */
export interface FaceMark { n: number; key: string; points: Point[] }

export interface FaceMarks { landmarks: Point[]; marks: FaceMark[] }

/** Zone box in 0-1 of the photo's width and height. */
export interface ZoneBox { code: string; name: string; x: number; y: number; w: number; h: number }

const finite = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isPoint = (p: unknown): p is Point => Array.isArray(p) && p.length >= 2 && finite(p[0]) && finite(p[1]);

/**
 * The mesh and the measurements that can be drawn on it. Measurements with
 * other than 2 or 3 anchors, an anchor outside the mesh, or no value are
 * left out rather than drawn somewhere approximate.
 */
export function faceMarks(r: FaceArchitectureResult | null | undefined): FaceMarks | null {
  const raw = r?.landmarks;
  if (!Array.isArray(raw) || !raw.every(isPoint)) return null;
  const landmarks = raw.map((p) => [p[0], p[1]] as Point);
  const marks: FaceMark[] = [];
  for (const m of Array.isArray(r?.measurements) ? r.measurements : []) {
    const idx = m?.landmarks;
    if (!m || m.value === null || m.value === undefined || !Array.isArray(idx) || (idx.length !== 2 && idx.length !== 3)) continue;
    const points = idx.map((i) => (Number.isInteger(i) ? landmarks[i] : undefined));
    if (points.some((p) => !p)) continue;
    marks.push({ n: marks.length + 1, key: m.key, points: points as Point[] });
  }
  return { landmarks, marks };
}

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
