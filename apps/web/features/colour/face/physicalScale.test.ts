import { describe, expect, it } from 'vitest';
import type { FaceArchitectureResult, Point } from './faceTypes';
import { focusTransform } from './GuidanceOverlay';
import { friendlyValue, MEASUREMENT_COPY_CATALOGUE } from './measurementCopy';
import { IRIS_DIAMETER_MM, formatMm, irisDiameterPx, physicalScale } from './physicalScale';

// 478 landmarks with each iris a circle of the given radius.
function landmarksWithIris(radius: number): Point[] {
  const pts: Point[] = Array.from({ length: 478 }, () => [0, 0] as Point);
  for (const [centre, cx] of [
    [468, 100],
    [473, 200],
  ] as const) {
    pts[centre] = [cx, 100];
    pts[centre + 1] = [cx + radius, 100];
    pts[centre + 2] = [cx, 100 - radius];
    pts[centre + 3] = [cx - radius, 100];
    pts[centre + 4] = [cx, 100 + radius];
  }
  return pts;
}

const result = (landmarks: Point[] | null, iodPx: number) =>
  ({ landmarks, quality: { iodPx } }) as unknown as FaceArchitectureResult;

describe('physicalScale', () => {
  it('measures the iris across opposite boundary points', () => {
    expect(irisDiameterPx(landmarksWithIris(10))).toBe(20);
  });

  it('estimates mm per IOD from the iris, marked as an estimate', () => {
    // An IOD five irises wide is five iris diameters in mm.
    const s = physicalScale(result(landmarksWithIris(10), 100), null);
    expect(s?.source).toBe('iris');
    expect(s?.mmPerIod).toBeCloseTo(5 * IRIS_DIAMETER_MM);
    expect(s?.relativeSd).toBeGreaterThan(0);
  });

  it('prefers an entered PD over the estimate', () => {
    expect(physicalScale(result(landmarksWithIris(10), 100), 62)).toEqual({ mmPerIod: 62, source: 'pd' });
  });

  it('gives nothing without iris landmarks or a PD', () => {
    expect(physicalScale(result(null, 100), null)).toBeNull();
  });
});

describe('millimetres in friendlyValue', () => {
  const eyeWidth = {
    key: 'eye_width',
    value: 0.5,
    unit: 'iod',
    band: [0.4, 0.6] as [number, number],
    visibility: 'observed',
    proxy: false,
    landmarks: [],
    reason: null,
  };

  it('reads a length in mm, keeping the IOD multiple alongside', () => {
    expect(friendlyValue(eyeWidth, MEASUREMENT_COPY_CATALOGUE, 62)).toEqual({
      short: '≈31 mm',
      long: '≈31 mm (0.5× jarak antar mata)',
      band: '≈25 mm – ≈37 mm',
    });
  });

  it('leaves ratios alone', () => {
    const ratio = { ...eyeWidth, key: 'eye_to_face_width_ratio', unit: 'ratio', value: 0.25, band: null };
    expect(friendlyValue(ratio, MEASUREMENT_COPY_CATALOGUE, 62)?.short).toBe('25%');
  });

  it('keeps a decimal below 10 mm', () => {
    expect(formatMm(4.26)).toBe('4.3 mm');
  });
});

describe('focusTransform', () => {
  const size = { w: 1000, h: 1000 };

  it('zooms in on a small box, capped, and centres it', () => {
    const t = focusTransform({ x: 490, y: 490, w: 20, h: 20 }, size);
    expect(t.scale).toBe(3);
    expect(t.tx).toBeCloseTo(0.5 - 0.5 * 3);
  });

  it('never zooms out, and keeps the photo filling the frame at an edge', () => {
    expect(focusTransform({ x: 0, y: 0, w: 1000, h: 1000 }, size).scale).toBe(1);
    const t = focusTransform({ x: 0, y: 0, w: 20, h: 20 }, size);
    expect(t.tx).toBe(0);
    expect(t.ty).toBe(0);
  });
});
