/**
 * A display colour for a brand, derived from its id.
 *
 * No brand names live here: the colour is a hash of the id into a fixed
 * palette, so the same brand always gets the same colour and a new brand gets
 * one without a code change. A brand's own `colorCode` from reference data
 * always takes precedence where the caller has it; this is only the fallback,
 * and callers showing it as a value should say it is derived.
 */

export interface BrandColour {
  /** Tailwind classes for a tag / badge. */
  bg: string;
  border: string;
  text: string;
  dot: string;
  /** Hex swatch of the same hue, for places that need a raw colour. */
  hex: string;
}

/** Display palette, not data: any order works so long as it stays stable. */
export const BRAND_COLOUR_PALETTE: readonly BrandColour[] = [
  { bg: 'bg-amber-500/15', border: 'border-amber-500/40', text: 'text-amber-300', dot: 'bg-amber-400', hex: '#f59e0b' },
  { bg: 'bg-emerald-500/15', border: 'border-emerald-500/40', text: 'text-emerald-300', dot: 'bg-emerald-400', hex: '#10b981' },
  { bg: 'bg-rose-500/15', border: 'border-rose-500/40', text: 'text-rose-300', dot: 'bg-rose-400', hex: '#f43f5e' },
  { bg: 'bg-sky-500/15', border: 'border-sky-500/40', text: 'text-sky-300', dot: 'bg-sky-400', hex: '#0ea5e9' },
  { bg: 'bg-purple-500/15', border: 'border-purple-500/40', text: 'text-purple-300', dot: 'bg-purple-400', hex: '#a855f7' },
  { bg: 'bg-pink-500/15', border: 'border-pink-500/40', text: 'text-pink-300', dot: 'bg-pink-400', hex: '#ec4899' },
  { bg: 'bg-teal-500/15', border: 'border-teal-500/40', text: 'text-teal-300', dot: 'bg-teal-400', hex: '#14b8a6' },
  { bg: 'bg-indigo-500/15', border: 'border-indigo-500/40', text: 'text-indigo-300', dot: 'bg-indigo-400', hex: '#6366f1' },
  { bg: 'bg-orange-500/15', border: 'border-orange-500/40', text: 'text-orange-300', dot: 'bg-orange-400', hex: '#f97316' },
  { bg: 'bg-violet-500/15', border: 'border-violet-500/40', text: 'text-violet-300', dot: 'bg-violet-400', hex: '#8b5cf6' },
];

/** Deterministic palette entry for a brand id (case and surrounding space ignored). */
export function brandColour(id: string | null | undefined): BrandColour {
  const key = (id || '').toLowerCase().trim();
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (key.charCodeAt(i) + ((hash << 5) - hash)) | 0;
  }
  return BRAND_COLOUR_PALETTE[Math.abs(hash) % BRAND_COLOUR_PALETTE.length];
}
