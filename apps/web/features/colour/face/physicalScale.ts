import type { FaceArchitectureResult, Point } from './faceTypes';

// The face worker measures lengths in IOD (distance between the eye centres)
// because a photo carries no physical scale. Showing millimetres needs one
// length of known size. Two sources, both labelled on screen as what they are:
//
// 1. The person's own pupillary distance (PD), when they enter it — taken as
//    the IOD, which it approximates for a face looking straight ahead.
// 2. Otherwise the iris: horizontal visible iris (white-to-white corneal)
//    diameter in adults is 11.71 ± 0.42 mm (mean ± SD; Rüfer, Schröder &
//    Erb 2005, Cornea 24(3):259-261), the same constant MediaPipe Iris uses
//    for depth. It is a property of human anatomy, not a deployment choice,
//    but it varies per person, so every value from it is an estimate.
export const IRIS_DIAMETER_MM = 11.71;
export const IRIS_DIAMETER_SD_MM = 0.42;

// MediaPipe Face Mesh with refined iris (478 points): 468 and 473 are the iris
// centres, each followed by four points on that iris's boundary.
const IRIS_BOUNDARY: [number, number, number, number][] = [
  [469, 470, 471, 472],
  [474, 475, 476, 477],
];

export type ScaleSource = 'pd' | 'iris';

export interface PhysicalScale {
  mmPerIod: number;
  source: ScaleSource;
  /** Relative uncertainty (one SD) of an estimate, absent for an entered PD. */
  relativeSd?: number;
}

const dist = (a: Point, b: Point) => Math.hypot(a[0] - b[0], a[1] - b[1]);

/** Mean iris diameter in image pixels, or null when the landmarks lack the iris. */
export function irisDiameterPx(landmarks: Point[] | null | undefined): number | null {
  if (!landmarks) return null;
  const diameters: number[] = [];
  for (const [a, b, c, d] of IRIS_BOUNDARY) {
    const pts = [a, b, c, d].map((i) => landmarks[i]);
    if (pts.some((p) => !p || !Number.isFinite(p[0]) || !Number.isFinite(p[1]))) return null;
    // Opposite boundary points: 0-2 and 1-3.
    diameters.push((dist(pts[0], pts[2]) + dist(pts[1], pts[3])) / 2);
  }
  const mean = diameters.reduce((s, v) => s + v, 0) / diameters.length;
  return mean > 0 ? mean : null;
}

/**
 * Millimetres per IOD for this result: from an entered PD when there is one,
 * else estimated from the iris. null when neither is available — no length is
 * then shown in millimetres.
 */
export function physicalScale(result: FaceArchitectureResult, pdMm: number | null): PhysicalScale | null {
  if (pdMm !== null && Number.isFinite(pdMm) && pdMm > 0) return { mmPerIod: pdMm, source: 'pd' };
  const iris = irisDiameterPx(result.landmarks);
  const iodPx = result.quality.iodPx;
  if (iris === null || !(iodPx > 0)) return null;
  return { mmPerIod: (iodPx * IRIS_DIAMETER_MM) / iris, source: 'iris', relativeSd: IRIS_DIAMETER_SD_MM / IRIS_DIAMETER_MM };
}

export function formatMm(mm: number): string {
  return `${mm < 10 ? mm.toFixed(1) : Math.round(mm)} mm`;
}
