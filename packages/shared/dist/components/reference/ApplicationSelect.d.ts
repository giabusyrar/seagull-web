import React from 'react';
export interface ApplicationSelectProps {
    value: string;
    onChange: (applicationId: string) => void;
    includeUniversal?: boolean;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}
export declare const ApplicationSelect: React.FC<ApplicationSelectProps>;
