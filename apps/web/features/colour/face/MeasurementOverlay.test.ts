import { describe, expect, it } from 'vitest';
import { estimateLabelBox, layoutLabels } from './MeasurementOverlay';

describe('layoutLabels', () => {
  it('keeps labels that do not touch where they are', () => {
    const a = estimateLabelBox('0.5', 10, 100, 10);
    const b = estimateLabelBox('0.5', 200, 100, 10);
    expect(layoutLabels([a, b], [])).toEqual([100, 100]);
  });

  it('moves a later label up, clear of an earlier one', () => {
    const a = estimateLabelBox('2.51 IOD', 100, 100, 10);
    const b = estimateLabelBox('3.95 IOD', 100, 100, 10);
    const [ya, yb] = layoutLabels([a, b], []);
    expect(ya).toBe(100);
    expect(ya - yb).toBeGreaterThanOrEqual(a.h);
  });

  it('keeps labels clear of obstacles such as information marks', () => {
    const label = estimateLabelBox('0.43 IOD', 100, 100, 10);
    const [y] = layoutLabels([label], [{ x: 100, y: 100, w: 20, h: 20 }]);
    expect(y).toBeLessThan(100 - 10);
  });
});
