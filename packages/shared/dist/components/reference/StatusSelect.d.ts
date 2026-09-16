import React from 'react';
export interface StatusSelectProps {
    value: string;
    onChange: (status: string) => void;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}
export declare const StatusSelect: React.FC<StatusSelectProps>;
