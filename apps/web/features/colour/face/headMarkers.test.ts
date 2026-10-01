import { describe, expect, it } from 'vitest';
import type { Measurement } from './faceTypes';
import { headMarkers } from './headMarkers';

const m = (over: Partial<Measurement>): Measurement => ({
  key: 'k',
  value: 1,
  unit: 'iod',
  band: null,
  visibility: 'observed',
  proxy: false,
  landmarks: [0, 1],
  reason: null,
  ...over,
});

// 468 points, point i at (i, 0, 0).
const points = Array.from({ length: 468 }, (_, i) => [i, 0, 0] as [number, number, number]);

describe('headMarkers', () => {
  it('maps MediaPipe indices straight to landmarkPoints', () => {
    const [mk] = headMarkers([m({ landmarks: [10, 20] })], points, null);
    expect(mk).toEqual({ key: 'k', kind: 'segment', points: [[10, 0, 0], [20, 0, 0]], selected: false });
  });

  it('draws a three-point degree measurement as its angle, other sets as points', () => {
    expect(headMarkers([m({ unit: 'deg', landmarks: [1, 2, 3] })], points, null)[0].kind).toBe('angle');
    expect(headMarkers([m({ landmarks: [1, 2, 3, 4] })], points, null)[0].kind).toBe('points');
  });

  it('skips a measurement touching the iris, which has no point on the head', () => {
    expect(headMarkers([m({ landmarks: [33, 468] })], points, null)).toEqual([]);
  });

  it('skips a measurement with no value', () => {
    expect(headMarkers([m({ value: null })], points, null)).toEqual([]);
  });

  it('draws nothing when the head carries no landmarkPoints', () => {
    expect(headMarkers([m({})], undefined, null)).toEqual([]);
  });

  it('marks the selected measurement', () => {
    expect(headMarkers([m({ key: 'a' }), m({ key: 'b' })], points, 'b').map((x) => x.selected)).toEqual([false, true]);
  });
});
