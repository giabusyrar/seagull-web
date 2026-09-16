import React from 'react';
export interface SeveritySelectProps {
    value: string;
    onChange: (severity: string) => void;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}
export declare const SeveritySelect: React.FC<SeveritySelectProps>;
