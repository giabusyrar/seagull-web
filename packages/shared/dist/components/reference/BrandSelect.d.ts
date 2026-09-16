import React from 'react';
export interface BrandSelectProps {
    value: string;
    onChange: (brandId: string) => void;
    includeUniversal?: boolean;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}
export declare const BrandSelect: React.FC<BrandSelectProps>;
