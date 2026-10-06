import { describe, expect, it } from 'vitest';
import { faceMarks, skinZoneBoxes } from '@/lib/annotations';

const mesh = (n = 478) => Array.from({ length: n }, (_, i) => [i, i * 2] as [number, number]);

describe('faceMarks', () => {
  it('draws two- and three-anchor measurements, numbered in order', () => {
    const r = {
      landmarks: mesh(),
      measurements: [
        { key: 'mouth_width', value: 0.9, landmarks: [61, 291] },
        { key: 'jaw_taper_angle_deg', value: 120, landmarks: [172, 152, 397] },
      ],
    };
    expect(faceMarks(r)?.marks).toEqual([
      { n: 1, key: 'mouth_width', points: [[61, 122], [291, 582]] },
      { n: 2, key: 'jaw_taper_angle_deg', points: [[172, 344], [152, 304], [397, 794]] },
    ]);
  });

  it('leaves out what it cannot place honestly', () => {
    const r = {
      landmarks: mesh(),
      measurements: [
        { key: 'unmeasured', value: null, landmarks: [1, 2] },
        { key: 'no_anchors', value: 1 },
        { key: 'region', value: 1, landmarks: [1, 2, 3, 4] },
        { key: 'off_mesh', value: 1, landmarks: [1, 999] },
        { key: 'kept', value: 1, landmarks: [1, 2] },
      ],
    };
    expect(faceMarks(r)?.marks.map((m) => [m.n, m.key])).toEqual([[1, 'kept']]);
  });

  it('draws nothing without a usable mesh', () => {
    expect(faceMarks({ landmarks: null })).toBeNull();
    expect(faceMarks({})).toBeNull();
    expect(faceMarks({ landmarks: [[1, Number.NaN]] })).toBeNull();
  });
});

describe('skinZoneBoxes', () => {
  const zone = (code: string, extra: object) => ({ zoneCode: code, zoneName: code.toLowerCase(), sourceAngle: 'FRONT', isVisible: true, boundingBox: { minX: 0.2, minY: 0.1, maxX: 0.6, maxY: 0.3 }, ...extra });

  it('keeps visible zones on the requested photo, as 0-1 boxes', () => {
    const [box] = skinZoneBoxes({ zoneBreakdown: [zone('ZONE_FOREHEAD', {})] }, 'FRONT');
    expect(box).toMatchObject({ code: 'ZONE_FOREHEAD', name: 'zone_forehead', x: 0.2, y: 0.1 });
    expect(box.w).toBeCloseTo(0.4);
    expect(box.h).toBeCloseTo(0.2);
  });

  it('drops other angles, invisible zones and the all-zero box', () => {
    const r = {
      zoneBreakdown: [
        zone('A', { sourceAngle: 'LEFT' }),
        zone('B', { isVisible: false }),
        zone('C', { boundingBox: { minX: 0, minY: 0, maxX: 0, maxY: 0 } }),
        zone('D', { boundingBox: undefined }),
      ],
    };
    expect(skinZoneBoxes(r, 'FRONT')).toEqual([]);
  });
});

import { FRONT_ANGLE, zoneMetric, zoomBox } from '@/lib/annotations';
import { traitFocus } from '@/components/photo/FaceTab';
import { skinView } from '@/components/photo/SkinTab';

describe('zoom to a trait', () => {
  it('frames the points with a margin, at the photo aspect, inside the photo', () => {
    const b = zoomBox([[400, 500], [600, 520]], 1000, 1250)!;
    expect(b.w / b.h).toBeCloseTo(1000 / 1250);
    expect(b.x).toBeLessThanOrEqual(400);
    expect(b.x + b.w).toBeGreaterThanOrEqual(600);
    expect(b.x).toBeGreaterThanOrEqual(0);
    expect(b.y + b.h).toBeLessThanOrEqual(1250);
  });

  it('never zooms closer than a share of the photo, and stays inside at the edge', () => {
    const b = zoomBox([[5, 5], [6, 6]], 1000, 1000)!;
    expect(b.w).toBeGreaterThan(200);
    expect(b.x).toBe(0);
    expect(b.y).toBe(0);
    expect(zoomBox([], 1000, 1000)).toBeNull();
  });

  it("collects every measurement's anchors and labels a trait's measurements", () => {
    const r = {
      landmarks: mesh(),
      measurements: [
        { key: 'eye_width', value: 0.453, unit: 'iod', landmarks: [33, 133] },
        { key: 'eye_region', value: 1, unit: 'ratio', landmarks: [33, 133, 159, 145] },
      ],
      traits: { EyeSize: { status: 'assessed', label: 'big', measurements: ['eye_width', 'eye_region', 'gone'] } },
    };
    expect(faceMarks(r)?.points.eye_region).toHaveLength(4); // 4 anchors: zoomable, not a numbered mark
    expect(faceMarks(r)?.marks.map((m) => m.key)).toEqual(['eye_width']);
    expect(traitFocus(r, 'EyeSize')).toEqual({
      title: 'EyeSize',
      items: [
        { key: 'eye_width', label: 'eye_width 0.453 iod' },
        { key: 'eye_region', label: 'eye_region 1.000 ratio' },
        { key: 'gone', label: 'gone' },
      ],
    });
    expect(traitFocus(r, null)).toBeNull();
    expect(traitFocus(r, 'Unknown')).toBeNull();
  });
});

describe('skin by zone', () => {
  const r = {
    zoneBreakdown: [
      { zoneCode: 'ZONE_FOREHEAD', zoneName: 'Forehead', sourceAngle: 'FRONT', isVisible: true, metrics: { skinConditions: { acne: { score: 72, severity: 'mild' } } } },
      { zoneCode: 'ZONE_NOSE', zoneName: 'Nose', sourceAngle: 'FRONT', isVisible: true, metrics: { skinConditions: { acne: { score: 30, severity: 'severe' } } } },
      { zoneCode: 'ZONE_CHEEK_L', zoneName: 'Cheek', sourceAngle: 'FRONT', isVisible: true, metrics: { skinConditions: { acne: { measurement: { value: 0.0412, unit: 'density' } } } } },
      { zoneCode: 'ZONE_CHIN', zoneName: 'Chin', sourceAngle: 'FRONT', isVisible: true, metrics: {} },
      { zoneCode: 'ZONE_SIDE', zoneName: 'Side', sourceAngle: 'LEFT', isVisible: true, metrics: { skinConditions: { acne: { score: 10, severity: 'severe' } } } },
    ],
  };

  it("reads one metric in each front zone as the backend gave it", () => {
    expect(zoneMetric(r, FRONT_ANGLE, 'skinConditions', 'acne').map((z) => [z.code, z.display.kind])).toEqual([
      ['ZONE_FOREHEAD', 'score'], ['ZONE_NOSE', 'score'], ['ZONE_CHEEK_L', 'measurement'], ['ZONE_CHIN', 'none'],
    ]);
  });

  it('colours zones by their own severity; a raw reading is neutral; no reading, no entry', () => {
    const v = skinView(r, { kind: 'metric', group: 'skinConditions', key: 'acne' }, FRONT_ANGLE, () => 'Acne')!;
    expect(v.zones).toEqual({
      ZONE_FOREHEAD: { label: '72.0', tone: 'good' },
      ZONE_NOSE: { label: '30.0', tone: 'bad' },
      ZONE_CHEEK_L: { label: '0.04 density', tone: 'neutral' },
    });
    expect(skinView(r, { kind: 'zone', code: 'ZONE_NOSE' }, FRONT_ANGLE, () => 'Nose')).toEqual({ title: 'Nose', zones: {}, highlight: 'ZONE_NOSE' });
    expect(skinView(r, null, FRONT_ANGLE, () => '')).toBeNull();
  });
});
