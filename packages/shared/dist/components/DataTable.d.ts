import React from 'react';
import { PaginationProps } from './Pagination';
export interface ColumnDef<T> {
    key: string;
    header: React.ReactNode;
    render?: (item: T) => React.ReactNode;
    align?: 'left' | 'center' | 'right';
    className?: string;
    width?: string;
    sortable?: boolean;
}
export interface DataTableProps<T> {
    columns: ColumnDef<T>[];
    data: T[];
    keyExtractor?: (item: T) => string;
    keyField?: keyof T | ((item: T) => string);
    emptyMessage?: string;
    emptyState?: React.ReactNode;
    isLoading?: boolean;
    loadingRowCount?: number;
    pagination?: PaginationProps;
    onRowClick?: (item: T) => void;
    className?: string;
    tableClassName?: string;
}
export declare function DataTable<T>({ columns, data, keyExtractor, keyField, emptyMessage, emptyState, isLoading, loadingRowCount, pagination, onRowClick, className, tableClassName, }: DataTableProps<T>): React.ReactElement;
