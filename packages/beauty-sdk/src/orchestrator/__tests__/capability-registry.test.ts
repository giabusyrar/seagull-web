import { describe, it, expect } from 'vitest';
import { resolveRequiredCapabilities } from '../capability-registry';

describe('CapabilityRegistry', () => {
  it('should map oily skin conditions to sebum detector', () => {
    const caps = resolveRequiredCapabilities(['concern_oiliness', 'skin_shine']);
    expect(caps).toContain('sebum_shine_detector');
  });

  it('should map acne conditions to comedone detector', () => {
    const caps = resolveRequiredCapabilities(['concern_acne']);
    expect(caps).toContain('comedone_pore_detector');
  });

  it('should return empty array for unrecognized conditions', () => {
    const caps = resolveRequiredCapabilities(['unknown_item']);
    expect(caps).toEqual([]);
  });
});
