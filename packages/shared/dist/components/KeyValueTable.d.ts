import React from 'react';
export interface KeyValueItem {
    id: string;
    key: string;
    value: string;
    description?: string;
    enabled: boolean;
    isInherited?: boolean;
}
export interface KeyValueTableProps {
    items: KeyValueItem[];
    onChange: (items: KeyValueItem[]) => void;
    keyPlaceholder?: string;
    valuePlaceholder?: string;
    descriptionPlaceholder?: string;
    showDescription?: boolean;
    readOnly?: boolean;
    title?: string;
    className?: string;
}
export declare const KeyValueTable: React.FC<KeyValueTableProps>;
