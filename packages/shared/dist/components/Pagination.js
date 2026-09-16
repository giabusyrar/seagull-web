'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, } from 'lucide-react';
import { cn } from '../utils';
export const Pagination = ({ currentPage, totalPages, totalItems, pageSize, onPageChange, onPageSizeChange, pageSizeOptions = [5, 10, 20, 50], className = '', }) => {
    const safeTotalPages = Math.max(1, totalPages);
    const safeCurrentPage = Math.min(Math.max(1, currentPage), safeTotalPages);
    const startItem = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
    const endItem = Math.min(safeCurrentPage * pageSize, totalItems);
    // Generate page numbers array with smart ellipsis
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        if (safeTotalPages <= maxVisible) {
            for (let i = 1; i <= safeTotalPages; i++) {
                pages.push(i);
            }
        }
        else {
            pages.push(1);
            let start = Math.max(2, safeCurrentPage - 1);
            let end = Math.min(safeTotalPages - 1, safeCurrentPage + 1);
            if (safeCurrentPage <= 3) {
                end = 4;
            }
            else if (safeCurrentPage >= safeTotalPages - 2) {
                start = safeTotalPages - 3;
            }
            if (start > 2) {
                pages.push('...');
            }
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
            if (end < safeTotalPages - 1) {
                pages.push('...');
            }
            pages.push(safeTotalPages);
        }
        return pages;
    };
    const pageNumbers = getPageNumbers();
    return (_jsxs("div", { className: cn('flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-2.5 bg-card border border-border rounded-xl text-xs text-foreground', className), children: [_jsxs("div", { className: "flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-start", children: [_jsxs("span", { className: "text-muted-foreground font-medium whitespace-nowrap", children: ["Showing ", _jsx("span", { className: "text-foreground font-semibold", children: startItem }), " to", ' ', _jsx("span", { className: "text-foreground font-semibold", children: endItem }), " of", ' ', _jsx("span", { className: "text-foreground font-semibold", children: totalItems }), " items"] }), onPageSizeChange && (_jsxs("div", { className: "flex items-center gap-1.5 shrink-0", children: [_jsx("span", { className: "text-muted-foreground", children: "Per page:" }), _jsx("select", { value: pageSize, onChange: (e) => onPageSizeChange(Number(e.target.value)), className: "bg-secondary border border-border text-foreground rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer text-xs", children: pageSizeOptions.map((option) => (_jsx("option", { value: option, className: "bg-popover text-popover-foreground", children: option }, option))) })] }))] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("button", { type: "button", onClick: () => onPageChange(1), disabled: safeCurrentPage === 1, title: "First Page", className: "p-1.5 rounded-md border border-border bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer", children: _jsx(ChevronsLeft, { className: "h-3.5 w-3.5" }) }), _jsx("button", { type: "button", onClick: () => onPageChange(safeCurrentPage - 1), disabled: safeCurrentPage === 1, title: "Previous Page", className: "p-1.5 rounded-md border border-border bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer", children: _jsx(ChevronLeft, { className: "h-3.5 w-3.5" }) }), _jsx("div", { className: "flex items-center gap-1 mx-1", children: pageNumbers.map((page, index) => {
                            if (page === '...') {
                                return (_jsx("span", { className: "px-2 py-1 text-muted-foreground/60 select-none text-xs", children: "..." }, `ellipsis-${index}`));
                            }
                            const isCurrent = page === safeCurrentPage;
                            return (_jsx("button", { type: "button", onClick: () => onPageChange(page), className: cn('min-w-[28px] h-7 px-2 rounded-md text-xs font-semibold transition cursor-pointer flex items-center justify-center', isCurrent
                                    ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                                    : 'bg-secondary/50 border border-border text-muted-foreground hover:text-foreground hover:bg-accent'), children: page }, page));
                        }) }), _jsx("button", { type: "button", onClick: () => onPageChange(safeCurrentPage + 1), disabled: safeCurrentPage === safeTotalPages, title: "Next Page", className: "p-1.5 rounded-md border border-border bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer", children: _jsx(ChevronRight, { className: "h-3.5 w-3.5" }) }), _jsx("button", { type: "button", onClick: () => onPageChange(safeTotalPages), disabled: safeCurrentPage === safeTotalPages, title: "Last Page", className: "p-1.5 rounded-md border border-border bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer", children: _jsx(ChevronsRight, { className: "h-3.5 w-3.5" }) })] })] }));
};
