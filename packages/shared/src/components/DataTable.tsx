'use client';

import React from 'react';
import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';
import { Pagination, PaginationProps } from './Pagination';
import { cn } from '../utils';

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

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  keyField,
  emptyMessage = 'No items found',
  emptyState,
  isLoading = false,
  loadingRowCount = 5,
  pagination,
  onRowClick,
  className = '',
  tableClassName = '',
}: DataTableProps<T>): React.ReactElement {
  const getKey = (item: T, index: number): string => {
    if (keyExtractor) return keyExtractor(item);
    if (typeof keyField === 'function') return keyField(item);
    if (keyField && item[keyField] !== undefined) return String(item[keyField]);
    return String(index);
  };

  return (
    <div className={cn('bg-card border border-border rounded-xl overflow-hidden shadow-xs flex flex-col', className)}>
      <div className="overflow-x-auto w-full">
        <table className={cn('w-full text-left text-xs text-foreground border-collapse min-w-[600px] sm:min-w-full', tableClassName)}>
          <thead className="bg-muted/80 text-muted-foreground font-bold text-[10px] uppercase tracking-wider border-b border-border select-none">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                  className={cn(
                    'px-4 py-3',
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left',
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {isLoading ? (
              Array.from({ length: loadingRowCount }).map((_, rIdx) => (
                <tr key={`loading-row-${rIdx}`} className="bg-card/50">
                  {columns.map((col) => (
                    <td key={`loading-col-${col.key}`} className="px-4 py-3">
                      <Skeleton className="h-4 w-full max-w-[80%]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  {emptyState || (
                    <div className="p-8">
                      <EmptyState title="No Records" description={emptyMessage} />
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={getKey(item, index)}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={cn(
                    'hover:bg-accent/50 transition-colors',
                    onRowClick ? 'cursor-pointer select-none' : ''
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-4 py-3 text-xs',
                        col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left',
                        col.className
                      )}
                    >
                      {col.render ? col.render(item) : String((item as any)[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && !isLoading && data.length > 0 && (
        <div className="border-t border-border p-3 bg-card">
          <Pagination {...pagination} />
        </div>
      )}
    </div>
  );
}
