import { describe, expect, it } from 'vitest';
import { chromaHue, labReport, labToHex } from '@/lib/lab';

describe('labReport', () => {
  it('reads core debug as sent today (untagged Go names)', () => {
    const r = labReport({
      debug: {
        measurement: { SkinLab: [62.1, 12.4, 18.9], LipLab: [48, 30, 12], IrisLab: null, HairLab: null, LPerSite: { forehead: 63.2, cheek_l: 61 }, PatchesUsed: ['forehead'], Illuminant: { Method: 'shades_of_gray_p6_full_frame', Residual: 1.2 } },
        bMinusA: 6.5,
      },
    });
    expect(r?.sites).toEqual({ skin: [62.1, 12.4, 18.9], lip: [48, 30, 12], iris: null, hair: null });
    expect(r?.lPerSite).toEqual([['forehead', 63.2], ['cheek_l', 61]]);
    expect(r?.patchesUsed).toEqual(['forehead']);
    expect(r?.illuminant).toEqual({ method: 'shades_of_gray_p6_full_frame', residual: 1.2 });
    expect(r?.bMinusA).toBe(6.5);
  });

  it('reads the contract names core sends now, with ITA', () => {
    const r = labReport({ debug: { measurement: { skinLab: [60, 10, 15], lPerSite: { forehead: 61 }, illuminant: { method: 'm', residual: null } }, skinITA: 33.69 } });
    expect(r?.sites.skin).toEqual([60, 10, 15]);
    expect(r?.lPerSite).toEqual([['forehead', 61]]);
    expect(r?.illuminant).toEqual({ method: 'm', residual: null });
    expect(r?.skinITA).toBe(33.69);
  });

  it('is null when core withheld the readings', () => {
    expect(labReport({ debug: null })).toBeNull();
    expect(labReport({})).toBeNull();
    expect(labReport({ debug: { measurement: { SkinLab: [1, Number.NaN, 2] } } })).toBeNull();
  });
});

describe('chromaHue', () => {
  it('follows CIE 15', () => {
    const { c, h } = chromaHue([50, 3, 4]);
    expect(c).toBeCloseTo(5);
    expect(h).toBeCloseTo(53.13, 2);
    expect(chromaHue([50, 0, -1]).h).toBeCloseTo(270);
  });
});

describe('labToHex', () => {
  it('maps the reference points', () => {
    expect(labToHex([100, 0, 0])).toBe('#ffffff');
    expect(labToHex([0, 0, 0])).toBe('#000000');
    // sRGB red is L*53.24 a*80.09 b*67.20 under D65.
    expect(labToHex([53.24, 80.09, 67.2])).toBe('#ff0000');
  });
});
