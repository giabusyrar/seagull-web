import React from 'react';
export interface ChipOption {
    value: string;
    label: string;
    description?: string;
}
export interface ChipGroup {
    key: string;
    label: string;
    icon?: React.ReactNode;
    options: ChipOption[];
}
export type ChipTone = 'primary' | 'cyan' | 'amber' | 'indigo';
export interface ChipMultiSelectProps {
    /** Flat option list. Ignored when `groups` is provided. */
    options?: ChipOption[];
    /** Options split under labelled sub-headers (e.g. skin conditions by dimension). */
    groups?: ChipGroup[];
    value: string[];
    /** Receives the next selection plus the value that was just toggled. */
    onChange: (next: string[], toggled: string) => void;
    label?: React.ReactNode;
    /** Shows "N selected" next to the label. Defaults to true when a label is set. */
    showCount?: boolean;
    tone?: ChipTone;
    /** Renders a checkbox indicator inside each chip — for permission-style pickers. */
    showCheckbox?: boolean;
    emptyMessage?: string;
    disabled?: boolean;
    className?: string;
    labelClassName?: string;
    /** Classes for the chip container, e.g. `max-h-72 overflow-y-auto`. */
    listClassName?: string;
}
export declare const ChipMultiSelect: React.FC<ChipMultiSelectProps>;
