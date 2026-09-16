'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';
import { cn } from '../utils';
export const SearchableSelect = (props) => {
    const { options = [], placeholder = 'Select option...', searchPlaceholder = 'Search options...', disabled = false, className = '', inline = false, } = props;
    const isMultiple = props.multiple === true;
    const singleValue = !isMultiple ? props.value || '' : '';
    const multiValue = isMultiple ? (Array.isArray(props.value) ? props.value : []) : [];
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const containerRef = useRef(null);
    const selectedOptions = options.filter((opt) => isMultiple ? multiValue.includes(opt.value) : opt.value === singleValue);
    const filteredOptions = options.filter((opt) => opt.label.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        opt.value.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        (opt.description && opt.description.toLowerCase().includes(searchQuery.toLowerCase().trim())));
    useEffect(() => {
        if (inline)
            return;
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        const handleKeyDown = (event) => {
            if (isOpen && event.key === 'Escape') {
                event.stopPropagation();
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('keydown', handleKeyDown, true);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('keydown', handleKeyDown, true);
        };
    }, [inline, isOpen]);
    const handleSelect = (optionValue) => {
        if (!isMultiple) {
            props.onChange(optionValue);
            setIsOpen(false);
            setSearchQuery('');
        }
        else {
            const multiProps = props;
            const currentVals = Array.isArray(multiProps.value) ? multiProps.value : [];
            if (currentVals.includes(optionValue)) {
                multiProps.onChange(currentVals.filter((v) => v !== optionValue));
            }
            else {
                multiProps.onChange([...currentVals, optionValue]);
            }
        }
    };
    const handleRemovePill = (e, optionValue) => {
        e.stopPropagation();
        if (isMultiple) {
            const multiProps = props;
            const currentVals = Array.isArray(multiProps.value) ? multiProps.value : [];
            multiProps.onChange(currentVals.filter((v) => v !== optionValue));
        }
    };
    const handleSelectAll = () => {
        if (isMultiple) {
            const multiProps = props;
            multiProps.onChange(options.map((opt) => opt.value));
        }
    };
    const handleClearAll = () => {
        if (isMultiple) {
            props.onChange([]);
        }
        else {
            props.onChange('');
        }
    };
    const renderListContent = () => (_jsxs("div", { className: "flex flex-col w-full text-xs", children: [_jsxs("div", { className: "p-2 border-b border-border relative flex items-center justify-between gap-2 bg-muted/40", children: [_jsxs("div", { className: "relative flex-1 flex items-center", children: [_jsx(Search, { style: { left: '0.625rem' }, className: "h-3.5 w-3.5 text-muted-foreground absolute top-1/2 -translate-y-1/2 pointer-events-none z-10 shrink-0" }), _jsx("input", { type: "text", autoFocus: !inline && isOpen, value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: searchPlaceholder, style: { paddingLeft: '2rem', paddingRight: searchQuery ? '1.75rem' : '0.5rem' }, className: "w-full h-8 bg-secondary/50 text-xs text-foreground placeholder:text-muted-foreground rounded-md border border-border focus:border-ring outline-none pl-8 pr-7 transition" }), searchQuery && (_jsx("button", { type: "button", onClick: () => setSearchQuery(''), style: { right: '0.5rem' }, className: "absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition cursor-pointer", children: _jsx(X, { className: "h-3.5 w-3.5" }) }))] }), isMultiple && options.length > 0 && (_jsxs("div", { className: "flex items-center gap-1 text-[11px] shrink-0", children: [_jsx("button", { type: "button", onClick: handleSelectAll, className: "text-primary hover:underline px-1 py-0.5 rounded cursor-pointer font-medium", children: "All" }), _jsx("span", { className: "text-muted-foreground/40", children: "|" }), _jsx("button", { type: "button", onClick: handleClearAll, className: "text-muted-foreground hover:text-destructive px-1 py-0.5 rounded cursor-pointer", children: "Reset" })] }))] }), _jsx("div", { className: "overflow-y-auto p-1.5 space-y-0.5 max-h-60", children: filteredOptions.length === 0 ? (_jsx("div", { className: "px-3 py-3 text-center text-xs text-muted-foreground italic", children: "No options matching search" })) : (filteredOptions.map((opt) => {
                    const isSelected = isMultiple ? multiValue.includes(opt.value) : singleValue === opt.value;
                    return (_jsxs("button", { type: "button", onClick: () => handleSelect(opt.value), className: cn('w-full text-left px-2.5 py-1.5 rounded-md flex items-center justify-between gap-2 transition cursor-pointer text-xs', isSelected
                            ? isMultiple
                                ? 'bg-beak/10 text-primary font-medium border border-beak/30'
                                : 'bg-beak/15 text-primary font-semibold'
                            : 'hover:bg-accent text-foreground'), children: [_jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [isMultiple && (_jsx("input", { type: "checkbox", checked: isSelected, readOnly: true, className: "accent-[#d97706] rounded h-3.5 w-3.5 shrink-0 pointer-events-none" })), _jsxs("div", { className: "truncate", children: [_jsx("div", { className: "truncate font-medium", children: opt.label }), opt.description && _jsx("div", { className: "text-[10px] text-muted-foreground truncate", children: opt.description })] })] }), !isMultiple && isSelected && _jsx(Check, { className: "h-3.5 w-3.5 text-primary shrink-0" })] }, opt.value));
                })) }), isMultiple && (_jsxs("div", { className: "px-2.5 py-1.5 border-t border-border bg-muted/20 flex items-center justify-between text-[11px] text-muted-foreground", children: [_jsxs("span", { children: [multiValue.length, " of ", options.length, " selected"] }), multiValue.length > 0 && (_jsx("button", { type: "button", onClick: handleClearAll, className: "text-destructive hover:underline cursor-pointer", children: "Clear selected" }))] }))] }));
    if (inline) {
        return (_jsx("div", { className: cn('bg-card border border-border rounded-xl overflow-hidden', className), children: renderListContent() }));
    }
    return (_jsxs("div", { ref: containerRef, className: cn('relative inline-block w-full text-xs select-none', isOpen ? 'z-50' : 'z-10', className), children: [_jsxs("div", { onClick: () => !disabled && setIsOpen(!isOpen), className: cn('w-full min-h-[38px] bg-secondary/50 hover:bg-accent/40 border border-border rounded-lg px-3 py-1.5 flex items-center justify-between gap-2 text-foreground outline-none transition cursor-pointer', isOpen ? 'border-ring ring-1 ring-ring/30' : '', disabled ? 'opacity-50 cursor-not-allowed' : ''), children: [_jsx("div", { className: "flex-1 flex flex-wrap items-center gap-1.5 min-w-0 max-h-20 overflow-y-auto py-0.5", children: !isMultiple ? (_jsx("span", { className: "truncate text-left font-normal text-xs", children: selectedOptions[0] ? selectedOptions[0].label : _jsx("span", { className: "text-muted-foreground", children: placeholder }) })) : multiValue.length === 0 ? (_jsx("span", { className: "text-muted-foreground text-xs font-normal", children: placeholder })) : (selectedOptions.map((opt) => (_jsxs("span", { className: "inline-flex items-center gap-1 bg-beak/15 border border-beak/30 text-primary font-medium text-[11px] px-2 py-0.5 rounded-md", children: [_jsx("span", { className: "truncate max-w-[120px]", children: opt.label }), _jsx(X, { onClick: (e) => handleRemovePill(e, opt.value), className: "h-3 w-3 hover:text-foreground transition shrink-0 cursor-pointer" })] }, opt.value)))) }), _jsxs("div", { className: "flex items-center gap-1.5 shrink-0 self-center", children: [((!isMultiple && singleValue && singleValue !== 'all') || (isMultiple && multiValue.length > 0)) && (_jsx("span", { role: "button", onClick: (e) => {
                                    e.stopPropagation();
                                    handleClearAll();
                                }, className: "p-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded transition cursor-pointer flex items-center justify-center", title: "Clear", children: _jsx(X, { className: "h-3.5 w-3.5" }) })), _jsx(ChevronDown, { className: cn('h-4 w-4 text-muted-foreground transition-transform duration-150', isOpen ? 'rotate-180 text-primary' : '') })] })] }), isOpen && (_jsx("div", { className: "absolute left-0 right-0 top-full mt-1.5 bg-popover border border-border rounded-xl shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-100", children: renderListContent() }))] }));
};
