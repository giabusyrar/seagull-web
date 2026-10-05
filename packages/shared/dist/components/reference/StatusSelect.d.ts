import React from 'react';
export interface StatusSelectProps {
    value: string;
    onChange: (status: string) => void;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}
/** A ruleset's lifecycle states, fixed by the engine (it scores only ACTIVE); defined once. */
export declare const LIFECYCLE_STATUSES: readonly {
    code: string;
    name: string;
}[];
export declare const StatusSelect: React.FC<StatusSelectProps>;
