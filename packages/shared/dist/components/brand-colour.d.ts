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
export declare const BRAND_COLOUR_PALETTE: readonly BrandColour[];
/** Deterministic palette entry for a brand id (case and surrounding space ignored). */
export declare function brandColour(id: string | null | undefined): BrandColour;
