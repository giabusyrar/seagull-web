'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { Search, Filter, RefreshCw, Plus, ChevronDown, X } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../utils';
export const SearchFilterBar = ({ searchQuery, onSearchChange, searchPlaceholder = 'Search items...', filterValue, onFilterChange, filterOptions, onOpenFilterPanel, customFilterContent, activeFilterCount, onRefresh, isLoading = false, actionLabel, onAction, actionIcon, actions, className = '', }) => {
    var _a;
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
    const filterRef = useRef(null);
    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setIsFilterDropdownOpen(false);
            }
        };
        if (isFilterDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isFilterDropdownOpen]);
    return (_jsxs("div", { className: cn('flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border shadow-xs w-full relative', className), children: [_jsxs("div", { className: "relative flex-1 min-w-0 w-full flex items-center", children: [_jsx(Search, { style: { left: '0.75rem' }, className: "h-4 w-4 text-muted-foreground absolute top-1/2 -translate-y-1/2 pointer-events-none z-10 shrink-0" }), _jsx("input", { type: "text", value: searchQuery, onChange: (e) => onSearchChange(e.target.value), placeholder: searchPlaceholder, style: { paddingLeft: '2.5rem', paddingRight: searchQuery ? '2.25rem' : '1rem' }, className: "w-full h-9 bg-secondary/50 text-xs text-foreground placeholder:text-muted-foreground rounded-lg pl-10 pr-8 border border-border focus:border-ring focus:ring-1 focus:ring-ring outline-none transition" }), searchQuery && (_jsx("button", { type: "button", onClick: () => onSearchChange(''), style: { right: '0.625rem' }, className: "absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition cursor-pointer p-0.5 rounded-md hover:bg-accent", title: "Clear search", children: _jsx(X, { className: "h-3.5 w-3.5" }) }))] }), _jsxs("div", { className: "flex items-center gap-2 justify-between sm:justify-end shrink-0 w-full sm:w-auto", children: [customFilterContent ? (_jsxs("div", { className: "relative", ref: filterRef, children: [_jsx(Button, { variant: isFilterDropdownOpen || (activeFilterCount && activeFilterCount > 0) ? 'primary' : 'outline', size: "sm", onClick: () => setIsFilterDropdownOpen(!isFilterDropdownOpen), leftIcon: _jsx(Filter, { className: "h-3.5 w-3.5" }), rightIcon: activeFilterCount ? (_jsx("span", { className: "px-1.5 py-0.2 bg-primary-foreground text-primary font-extrabold text-[10px] rounded-full", children: activeFilterCount })) : (_jsx(ChevronDown, { className: "h-3 w-3 text-muted-foreground" })), children: "Filter" }), isFilterDropdownOpen && (_jsx("div", { className: "absolute right-0 top-11 z-50 bg-popover border border-border rounded-xl shadow-xl p-4 min-w-[280px] sm:min-w-[320px] space-y-3", children: customFilterContent }))] })) : onOpenFilterPanel ? (_jsx(Button, { variant: "outline", size: "sm", onClick: onOpenFilterPanel, leftIcon: _jsx(Filter, { className: "h-3.5 w-3.5 text-primary" }), rightIcon: activeFilterCount ? (_jsx("span", { className: "px-1.5 py-0.2 bg-primary text-primary-foreground font-extrabold text-[10px] rounded-full", children: activeFilterCount })) : undefined, children: "Filter" })) : (
                    /* Single Select Filter Fallback */
                    onFilterChange && filterOptions && filterOptions.length > 0 && (_jsxs("div", { className: "relative flex items-center h-9 bg-secondary/50 border border-border rounded-lg px-2.5 shrink-0 text-xs hover:border-accent-foreground/30 focus-within:border-ring transition", children: [_jsx(Filter, { className: "h-3.5 w-3.5 text-primary shrink-0 mr-1.5" }), _jsx("select", { value: filterValue || ((_a = filterOptions[0]) === null || _a === void 0 ? void 0 : _a.value), onChange: (e) => onFilterChange(e.target.value), className: "bg-transparent text-xs text-foreground focus:text-foreground outline-none cursor-pointer appearance-none pr-5 py-1 z-10 font-semibold", children: filterOptions.map((opt) => (_jsx("option", { value: opt.value, className: "bg-popover text-popover-foreground", children: opt.label }, opt.value))) }), _jsx(ChevronDown, { className: "h-3.5 w-3.5 text-muted-foreground pointer-events-none absolute right-2 z-0" })] }))), onRefresh && (_jsx(Button, { variant: "outline", size: "icon-sm", onClick: onRefresh, title: "Refresh Data", children: _jsx(RefreshCw, { className: cn('h-3.5 w-3.5', isLoading ? 'animate-spin' : '') }) })), actions, actionLabel && onAction && (_jsx(Button, { variant: "primary", size: "sm", onClick: onAction, leftIcon: actionIcon || _jsx(Plus, { className: "h-3.5 w-3.5" }), children: actionLabel }))] })] }));
};
