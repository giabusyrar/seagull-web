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
