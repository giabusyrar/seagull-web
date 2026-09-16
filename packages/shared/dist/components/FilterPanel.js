'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { X, RotateCcw, Check, SlidersHorizontal } from 'lucide-react';
import { SearchableSelect } from './SearchableSelect';
import { Button } from './Button';
import { cn } from '../utils';
export const FilterPanel = ({ isOpen, onClose, title = 'Filter Options', sections, initialFilters = {}, onApply, onReset, resultCount, }) => {
    const [filters, setFilters] = useState(initialFilters);
    const currentCount = typeof resultCount === 'function' ? resultCount(filters) : resultCount;
    useEffect(() => {
        setFilters(initialFilters);
    }, [initialFilters, isOpen]);
    useEffect(() => {
        if (!isOpen)
            return;
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [isOpen]);
    if (!isOpen)
        return null;
    const handlePillClick = (sectionId, optionId, isMultiSelect) => {
        const current = filters[sectionId];
        if (isMultiSelect) {
            const currentList = Array.isArray(current) ? current : [];
            const updated = currentList.includes(optionId)
                ? currentList.filter((item) => item !== optionId)
                : [...currentList, optionId];
            setFilters(Object.assign(Object.assign({}, filters), { [sectionId]: updated }));
        }
        else {
            setFilters(Object.assign(Object.assign({}, filters), { [sectionId]: current === optionId ? 'all' : optionId }));
        }
    };
    const handleReset = () => {
        setFilters({});
        if (onReset)
            onReset();
    };
    const handleApply = () => {
        onApply(filters);
        onClose();
    };
    return (_jsx("div", { className: "fixed inset-0 z-[100] bg-black/80 backdrop-blur-md transition-all duration-200 animate-in fade-in flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-popover border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]", children: [_jsxs("div", { className: "px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40", children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("div", { className: "p-1.5 bg-beak/15 border border-beak/30 rounded-lg text-primary flex items-center justify-center shrink-0", children: _jsx(SlidersHorizontal, { className: "h-4 w-4" }) }), _jsx("h3", { className: "font-bold text-foreground text-sm tracking-tight", children: title })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("button", { type: "button", onClick: handleReset, className: "text-xs font-medium text-muted-foreground hover:text-primary flex items-center gap-1 px-2 py-1 rounded-md hover:bg-accent transition cursor-pointer", children: [_jsx(RotateCcw, { className: "h-3 w-3" }), _jsx("span", { children: "Reset" })] }), _jsx("button", { type: "button", onClick: onClose, className: "text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-accent transition cursor-pointer", children: _jsx(X, { className: "h-4 w-4" }) })] })] }), _jsx("div", { className: "p-6 overflow-y-auto space-y-5 flex-1 select-none", children: sections.map((section) => {
                        var _a;
                        return (_jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "block text-xs font-semibold text-foreground", children: section.label }), section.type === 'pills' && (_jsx("div", { className: "flex flex-wrap gap-2", children: (_a = section.options) === null || _a === void 0 ? void 0 : _a.map((opt) => {
                                        const optionId = opt.id !== undefined ? opt.id : opt.value;
                                        const isSelected = section.isMultiSelect
                                            ? Array.isArray(filters[section.id]) && filters[section.id].includes(optionId)
                                            : (filters[section.id] || 'all') === optionId;
                                        return (_jsxs("button", { type: "button", onClick: () => handlePillClick(section.id, optionId, section.isMultiSelect), className: cn('px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border transition cursor-pointer', isSelected
                                                ? 'bg-primary border-primary text-primary-foreground shadow-xs'
                                                : 'bg-secondary/60 border-border text-foreground hover:bg-accent'), children: [isSelected ? (_jsx(Check, { className: "h-3.5 w-3.5 text-primary-foreground stroke-[3]" })) : (opt.icon), _jsx("span", { children: opt.label }), opt.badge !== undefined && (_jsx("span", { className: cn('px-1.5 py-0.2 rounded-full text-[10px]', isSelected ? 'bg-primary-foreground/20 text-primary-foreground font-extrabold' : 'bg-muted text-muted-foreground'), children: opt.badge }))] }, optionId));
                                    }) })), section.type === 'select' && (_jsx(SearchableSelect, { options: (section.options || []).map((opt) => ({
                                        value: opt.value !== undefined ? opt.value : opt.id,
                                        label: opt.label,
                                        description: opt.description,
                                    })), placeholder: `Select ${section.label.toLowerCase()}...`, searchPlaceholder: section.searchPlaceholder || `Search ${section.label.toLowerCase()}...`, multiple: section.isMultiSelect !== false, value: section.isMultiSelect !== false
                                        ? Array.isArray(filters[section.id])
                                            ? filters[section.id]
                                            : []
                                        : filters[section.id] || '', onChange: (val) => setFilters(Object.assign(Object.assign({}, filters), { [section.id]: val })) })), section.type === 'range' && (_jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("span", { className: "block text-[10px] text-muted-foreground mb-1", children: section.minLabel || 'Min' }), _jsx("input", { type: "number", value: filters[`${section.id}_min`] || '', onChange: (e) => setFilters(Object.assign(Object.assign({}, filters), { [`${section.id}_min`]: e.target.value })), placeholder: "0", className: "w-full bg-secondary/50 border border-border rounded-lg px-3 py-1.5 text-xs text-foreground font-mono outline-none focus:border-ring" })] }), _jsxs("div", { children: [_jsx("span", { className: "block text-[10px] text-muted-foreground mb-1", children: section.maxLabel || 'Max' }), _jsx("input", { type: "number", value: filters[`${section.id}_max`] || '', onChange: (e) => setFilters(Object.assign(Object.assign({}, filters), { [`${section.id}_max`]: e.target.value })), placeholder: "100", className: "w-full bg-secondary/50 border border-border rounded-lg px-3 py-1.5 text-xs text-foreground font-mono outline-none focus:border-ring" })] })] }))] }, section.id));
                    }) }), _jsx("div", { className: "p-5 border-t border-border bg-muted/20", children: _jsx(Button, { variant: "primary", size: "md", onClick: handleApply, className: "w-full", children: currentCount !== undefined
                            ? `Apply Filters (${currentCount})`
                            : 'Apply Filters' }) })] }) }));
};
