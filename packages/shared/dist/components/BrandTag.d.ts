import React from 'react';
import { type BrandColour } from './brand-colour';
export { brandColour, BRAND_COLOUR_PALETTE, type BrandColour } from './brand-colour';
export declare function getDomainFromUrl(url?: string | null): string;
/**
 * Kept for existing callers; same as brandColour(name). The colour is derived
 * from the name, never looked up from a list of brands.
 */
export declare function getBrandColorTheme(name: string): BrandColour;
export interface BrandTagProps {
    name: string;
    website?: string | null;
    colorCode?: string | null;
    className?: string;
    showWebsiteLink?: boolean;
}
export declare const BrandTag: React.FC<BrandTagProps>;
