import { describe, expect, it } from 'vitest';
import { normaliseName } from './normalise-product-name.mjs';

// The pairs Reference [b84716] found against the live VPS data: the name in
// the brand's catalogue (what the seed carries) and the name of the row
// already stored. Each stored row holds try-on shades, so a missed match
// would create an empty twin of a product that already works.
const SAME = [
  ['Wardah', 'Wardah Colorfit Quad Eye Palette Sunlit Blaze', 'Wardah Colorfit Quad Eye Palette 03 Sunlit Blaze'],
  ['Wardah', 'Wardah Colorfit Quad Eye Palette Brunette Dawn', 'Wardah Colorfit Quad Eye Palette 01 Brunette Dawn'],
  ['Wardah', 'Wardah Colorfit Quad Eye Palette Rose Aurora', 'Wardah Colorfit Quad Eye Palette 02 Rose Aurora'],
  ['Wardah', 'Wardah EyeXpert Perfect Precision Liner', 'Wardah EyeXpert Perfect Precision Liner'],
  ['Wardah', 'Wardah Colorfit Cream Blush', 'Wardah Colorfit Cream Blush'],
  ['Make Over', 'Make Over Powerstay 24H Weightless Liquid Foundation', 'Make Over Powerstay 24H Weightless Liquid Foundation'],
  ['Make Over', 'Make Over Powerstay 24H Matte Powder Foundation', 'Make Over Powerstay 24H Matte Powder Foundation'],
  ['Make Over', 'Make Over Hydrastay Prismatic Glass Cushion', 'Make Over Hydrastay Prismatic Glass Cushion'],
  ['Make Over', 'Make Over Powerstay Sync Matte Cushion', 'Make Over Powerstay Sync Matte Cushion'],
  ['Make Over', 'Make Over Powerstay Transferproof Matte Lip Cream', 'Make Over Powerstay Transferproof Matte Lip Cream'],
  ['Make Over', 'Make Over Powerstay Glazed Lock Lip Pigment', 'Make Over Powerstay Glazed Lock Lip Pigment'],
  ['Make Over', 'Make Over Hyperblack Superstay Liner 1 g', 'Make Over Hyperblack Superstay Liner'],
];

// Products that must stay apart. Over-normalising is the opposite failure:
// it would silently drop a product that should have been created.
const DIFFERENT = [
  ['Wardah', 'Wardah Colorfit Quad Eye Palette Rose Aurora', 'Wardah Colorfit Quad Eye Palette Sunlit Blaze'],
  ['Wardah', 'Wardah Colorfit Perfect Glow Cushion', 'Wardah Refill Colorfit Perfect Glow Cushion SPF 33 PA++'],
  ['Wardah', 'Wardah Matte Lip Cream', 'Wardah Colorfit Fresh Lip Ink Serum'],
  ['Make Over', 'Make Over Perfect Cover Powder Foundation', 'Make Over Perfect Cover Two Way Cake 12 g'],
  ['Make Over', 'Make Over Ultra Cover Liquid Matt Foundation', 'Make Over Powerstay 24H Weightless Liquid Foundation'],
];

describe('normaliseName', () => {
  it.each(SAME)('%s: treats "%s" as the stored "%s"', (brand, catalogue, stored) => {
    expect(normaliseName(catalogue, brand)).toBe(normaliseName(stored, brand));
  });

  it.each(DIFFERENT)('%s: keeps "%s" apart from "%s"', (brand, a, b) => {
    expect(normaliseName(a, brand)).not.toBe(normaliseName(b, brand));
  });

  it('strips the brand prefix, so both conventions meet', () => {
    expect(normaliseName('Wardah Matte Lip Cream', 'Wardah')).toBe('matte lip cream');
  });

  it('leaves a figure that is part of the name alone', () => {
    // 24H and 5D name the product; 1 g and 01 do not.
    expect(normaliseName('Make Over Powerstay 24H Matte Powder Foundation', 'Make Over')).toContain('24h');
    expect(normaliseName('Wardah Colorfit 5D Blur Cloud Cushion', 'Wardah')).toContain('5d');
  });
});
