import React from 'react';
export interface DimensionSelectProps {
    value: string;
    onChange: (dimensionKey: string, dimension?: {
        code: string;
        name: string;
    }) => void;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}
export declare const DimensionSelect: React.FC<DimensionSelectProps>;
