import React from 'react';
export interface SeveritySelectProps {
    value: string;
    onChange: (severity: string) => void;
    /** The severity labels to choose from — normally the severity_bands of the
     *  ruleset being edited, lowest band first. Omitted: core's default bands
     *  (CORE_DEFAULT_SEVERITY_LABELS), which apply to a ruleset that sets none. */
    options?: string[];
    /** When set, an empty value is offered as its own choice with this label
     *  (e.g. "Any level"), instead of the select silently showing the first
     *  option for a value that is not set. */
    emptyLabel?: string;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}
export declare const SeveritySelect: React.FC<SeveritySelectProps>;
