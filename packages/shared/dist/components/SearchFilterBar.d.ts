import React from 'react';
export interface FilterOptionItem {
    value: string;
    label: string;
}
export interface ColumnOptionItem {
    value: string;
    label: string;
}
export interface SearchFilterBarProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    searchPlaceholder?: string;
    searchColumn?: string;
    onSearchColumnChange?: (value: string) => void;
    columnOptions?: ColumnOptionItem[];
    filterValue?: string;
    onFilterChange?: (value: string) => void;
    filterOptions?: FilterOptionItem[];
    onOpenFilterPanel?: () => void;
    customFilterContent?: React.ReactNode;
    activeFilterCount?: number;
    onRefresh?: () => void;
    isLoading?: boolean;
    actionLabel?: string;
    onAction?: () => void;
    actionIcon?: React.ReactNode;
    actions?: React.ReactNode;
    className?: string;
}
export declare const SearchFilterBar: React.FC<SearchFilterBarProps>;
