import { describe, expect, it } from 'vitest';
import { metricDisplay } from '@/lib/types/skin';

describe('metricDisplay', () => {
  it('shows a score when the engine scored', () => {
    expect(metricDisplay({ score: 72, severity: 'mild' })).toEqual({ kind: 'score', score: 72, severity: 'mild' });
  });

  it('shows an uncalibrated measurement as a raw value in its unit, never as a score', () => {
    expect(metricDisplay({ score: null, measurement: { value: 0.137, unit: 'fraction of skin area', calibrated: false } }))
      .toEqual({ kind: 'measurement', value: 0.137, unit: 'fraction of skin area' });
  });

  it('carries the proxy note for a visual stand-in', () => {
    const d = metricDisplay({ measurement: { value: 3.2, unit: 'edge density', calibrated: false, proxy: 'fine-line texture, not elasticity' } });
    expect(d).toMatchObject({ kind: 'measurement', proxy: 'fine-line texture, not elasticity' });
  });

  it('shows nothing when there is neither', () => {
    expect(metricDisplay({ score: null })).toEqual({ kind: 'none' });
    expect(metricDisplay(undefined)).toEqual({ kind: 'none' });
  });
});
