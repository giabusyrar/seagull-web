import type { Measurement } from './faceTypes';
import type { HeadMarker } from './HeadViewer';

/**
 * Face-architecture measurements as markers on the 3D head, through the
 * report's landmarkPoints (MediaPipe index i → point i on the head). The same
 * rule as the 2D drawing (measurementGeometry): two points are the distance
 * between them, three points of a degree measurement are that angle, any
 * other set is its points unconnected. A measurement with no value, or with
 * an index the head has no point for (the iris, 468-477), is not drawn —
 * nothing is placed at a nearby vertex instead.
 */
export function headMarkers(
  measurements: Measurement[],
  landmarkPoints: [number, number, number][] | undefined,
  selectedKey: string | null,
): HeadMarker[] {
  if (!landmarkPoints?.length) return [];
  const out: HeadMarker[] = [];
  for (const m of measurements) {
    if (m.value === null || m.landmarks.length === 0) continue;
    const points = m.landmarks.map((i) => landmarkPoints[i]);
    if (points.some((p) => !p || p.length < 3 || p.some((c) => !Number.isFinite(c)))) continue;
    const kind = points.length === 2 ? 'segment' : points.length === 3 && m.unit === 'deg' ? 'angle' : 'points';
    out.push({ key: m.key, kind, points, selected: m.key === selectedKey });
  }
  return out;
}
