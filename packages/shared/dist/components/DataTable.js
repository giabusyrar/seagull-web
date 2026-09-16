'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';
import { Pagination } from './Pagination';
import { cn } from '../utils';
export function DataTable({ columns, data, keyExtractor, keyField, emptyMessage = 'No items found', emptyState, isLoading = false, loadingRowCount = 5, pagination, onRowClick, className = '', tableClassName = '', }) {
    const getKey = (item, index) => {
        if (keyExtractor)
            return keyExtractor(item);
        if (typeof keyField === 'function')
            return keyField(item);
        if (keyField && item[keyField] !== undefined)
            return String(item[keyField]);
        return String(index);
    };
    return (_jsxs("div", { className: cn('bg-card border border-border rounded-xl overflow-hidden shadow-xs flex flex-col', className), children: [_jsx("div", { className: "overflow-x-auto w-full", children: _jsxs("table", { className: cn('w-full text-left text-xs text-foreground border-collapse min-w-[600px] sm:min-w-full', tableClassName), children: [_jsx("thead", { className: "bg-muted/80 text-muted-foreground font-bold text-[10px] uppercase tracking-wider border-b border-border select-none", children: _jsx("tr", { children: columns.map((col) => (_jsx("th", { style: col.width ? { width: col.width } : undefined, className: cn('px-4 py-3', col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left', col.className), children: col.header }, col.key))) }) }), _jsx("tbody", { className: "divide-y divide-border/60", children: isLoading ? (Array.from({ length: loadingRowCount }).map((_, rIdx) => (_jsx("tr", { className: "bg-card/50", children: columns.map((col) => (_jsx("td", { className: "px-4 py-3", children: _jsx(Skeleton, { className: "h-4 w-full max-w-[80%]" }) }, `loading-col-${col.key}`))) }, `loading-row-${rIdx}`)))) : data.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: columns.length, className: "p-0", children: emptyState || (_jsx("div", { className: "p-8", children: _jsx(EmptyState, { title: "No Records", description: emptyMessage }) })) }) })) : (data.map((item, index) => (_jsx("tr", { onClick: () => onRowClick && onRowClick(item), className: cn('hover:bg-accent/50 transition-colors', onRowClick ? 'cursor-pointer select-none' : ''), children: columns.map((col) => {
                                    var _a;
                                    return (_jsx("td", { className: cn('px-4 py-3 text-xs', col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left', col.className), children: col.render ? col.render(item) : String((_a = item[col.key]) !== null && _a !== void 0 ? _a : '') }, col.key));
                                }) }, getKey(item, index))))) })] }) }), pagination && !isLoading && data.length > 0 && (_jsx("div", { className: "border-t border-border p-3 bg-card", children: _jsx(Pagination, Object.assign({}, pagination)) }))] }));
}
