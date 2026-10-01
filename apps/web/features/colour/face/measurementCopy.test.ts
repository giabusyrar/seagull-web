import { describe, expect, it } from 'vitest';
import type { Measurement } from './faceTypes';
import { MEASUREMENT_COPY_CATALOGUE, friendlyValue, measurementName } from './measurementCopy';

const m = (over: Partial<Measurement>): Measurement => ({
  key: 'eye_width',
  value: 0.468,
  unit: 'iod',
  band: null,
  visibility: 'observed',
  proxy: false,
  landmarks: [],
  reason: null,
  ...over,
});

const CAT = MEASUREMENT_COPY_CATALOGUE;

describe('friendlyValue', () => {
  it('reads an IOD length as a multiple of the eye distance', () => {
    expect(friendlyValue(m({}), CAT)).toEqual({ short: '0.47×', long: '0.47× jarak antar mata', band: undefined });
  });

  it('reads a ratio as a percentage of what it is relative to', () => {
    const v = friendlyValue(m({ key: 'upper_to_mid_width_ratio', unit: 'ratio', value: 0.882, band: [0.84, 0.921] }), CAT);
    expect(v).toEqual({ short: '88%', long: '88% dari lebar wajah', band: '84% – 92%' });
  });

  it('says which way an angle leans', () => {
    expect(friendlyValue(m({ key: 'canthal_tilt_deg', unit: 'deg', value: 1.396 }), CAT)?.long).toBe(
      '1.4°, ujung luar lebih tinggi',
    );
    expect(friendlyValue(m({ key: 'canthal_tilt_deg', unit: 'deg', value: -2 }), CAT)?.long).toBe(
      '-2°, ujung luar lebih rendah',
    );
  });

  it('reads the fifths as shares of the face width', () => {
    const v = friendlyValue(m({ key: 'fifths', unit: 'ratio', value: [0.162, 0.206, 0.238, 0.213, 0.181] }), CAT);
    expect(v?.long).toBe('16% · 21% · 24% · 21% · 18% dari lebar wajah');
  });

  it('falls back to the raw key and number for another catalogue version', () => {
    const other = m({ key: 'upper_to_mid_width_ratio', unit: 'ratio', value: 0.882 });
    expect(measurementName(other, 'fa-measure/2')).toBe('upper_to_mid_width_ratio');
    expect(friendlyValue(other, 'fa-measure/2')?.long).toBe('0.88');
  });

  it('has nothing to say for a missing value', () => {
    expect(friendlyValue(m({ value: null }), CAT)).toBeNull();
  });
});
