import React from 'react';
export interface FilterPillOption {
    id: string;
    label: string;
    icon?: React.ReactNode;
    badge?: string | number;
}
export interface FilterSelectOption {
    value: string;
    label: string;
    description?: string;
}
export interface FilterSection {
    id: string;
    label: string;
    type: 'pills' | 'select' | 'range' | 'checkbox';
    options?: (FilterPillOption | FilterSelectOption)[];
    isMultiSelect?: boolean;
    searchPlaceholder?: string;
    minLabel?: string;
    maxLabel?: string;
}
export interface FilterPanelProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    sections: FilterSection[];
    initialFilters?: Record<string, any>;
    onApply: (filters: Record<string, any>) => void;
    onReset?: () => void;
    resultCount?: number | ((currentFilters: Record<string, any>) => number);
}
export declare const FilterPanel: React.FC<FilterPanelProps>;
