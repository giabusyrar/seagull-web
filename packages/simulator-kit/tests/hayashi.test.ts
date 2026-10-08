import { describe, expect, it } from 'vitest';
import { HAYASHI_BANDS, hayashiPosition } from '@/lib/hayashi';

describe('Hayashi scale (J Dermatol 2008)', () => {
  it('has the published edges', () => {
    expect(HAYASHI_BANDS.map((b) => [b.grade, b.upTo])).toEqual([['mild', 5], ['moderate', 20], ['severe', 50], ['very_severe', null]]);
  });
  it('places a count inside its own quarter of the bar', () => {
    expect(hayashiPosition(0)).toBe(0);
    expect(hayashiPosition(5)).toBeCloseTo(0.25);
    expect(hayashiPosition(12.5)).toBeCloseTo(0.375); // halfway through moderate (5..20)
    expect(hayashiPosition(50)).toBeCloseTo(0.75);
    expect(hayashiPosition(65)).toBeCloseTo(0.875); // the open band drawn 50..80
    expect(hayashiPosition(500)).toBe(1);
    expect(hayashiPosition(-3)).toBe(0);
  });
});
