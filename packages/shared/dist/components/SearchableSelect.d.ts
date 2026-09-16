import React from 'react';
export interface SelectOption {
    value: string;
    label: string;
    description?: string;
}
export interface SearchableSelectBaseProps {
    options: SelectOption[];
    placeholder?: string;
    searchPlaceholder?: string;
    disabled?: boolean;
    className?: string;
    required?: boolean;
    inline?: boolean;
}
export interface SingleSearchableSelectProps extends SearchableSelectBaseProps {
    multiple?: false;
    value?: string;
    onChange: (value: string) => void;
}
export interface MultiSearchableSelectProps extends SearchableSelectBaseProps {
    multiple: true;
    value?: string[];
    onChange: (value: string[]) => void;
}
export type SearchableSelectProps = SingleSearchableSelectProps | MultiSearchableSelectProps;
export declare const SearchableSelect: React.FC<SearchableSelectProps>;
