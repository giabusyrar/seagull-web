import React from 'react';
export declare function getDomainFromUrl(url?: string | null): string;
export declare function getBrandColorTheme(name: string): {
    bg: string;
    border: string;
    text: string;
    dot: string;
};
export interface BrandTagProps {
    name: string;
    website?: string | null;
    colorCode?: string | null;
    className?: string;
    showWebsiteLink?: boolean;
}
export declare const BrandTag: React.FC<BrandTagProps>;
