'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Check } from 'lucide-react';
import { cn } from '../utils';
const TONE_STYLES = {
    primary: { selected: 'border-primary/50 bg-primary/10 text-foreground', count: 'text-primary' },
    cyan: { selected: 'border-cyan-500/50 bg-cyan-50/50 dark:bg-cyan-950/20 text-foreground', count: 'text-cyan-600' },
    amber: { selected: 'border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20 text-foreground', count: 'text-amber-600' },
    indigo: { selected: 'border-indigo-500/50 bg-indigo-50/50 dark:bg-indigo-950/20 text-foreground', count: 'text-indigo-600' },
};
export const ChipMultiSelect = ({ options = [], groups, value, onChange, label, showCount, tone = 'primary', showCheckbox = false, emptyMessage = 'No options available.', disabled = false, className, labelClassName, listClassName, }) => {
    const toneStyles = TONE_STYLES[tone];
    const shouldShowCount = showCount !== null && showCount !== void 0 ? showCount : label !== undefined;
    const isEmpty = groups ? groups.every((g) => g.options.length === 0) : options.length === 0;
    const toggle = (optionValue) => {
        if (disabled)
            return;
        const next = value.includes(optionValue) ? value.filter((v) => v !== optionValue) : [...value, optionValue];
        onChange(next, optionValue);
    };
    const renderChips = (chipOptions) => (_jsx("div", { className: "flex flex-wrap gap-1.5", children: chipOptions.map((opt) => {
            const isSelected = value.includes(opt.value);
            return (_jsxs("button", { type: "button", role: "checkbox", "aria-checked": isSelected, title: opt.description, disabled: disabled, onClick: () => toggle(opt.value), className: cn('inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed', isSelected ? toneStyles.selected : 'border-border bg-background text-muted-foreground hover:border-slate-300'), children: [showCheckbox && (_jsx("span", { className: cn('h-3 w-3 rounded-sm border flex items-center justify-center shrink-0', isSelected ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/40'), children: isSelected && _jsx(Check, { className: "h-2.5 w-2.5 stroke-[3]" }) })), opt.label] }, opt.value));
        }) }));
    return (_jsxs("div", { className: cn('space-y-1.5', className), children: [(label !== undefined || shouldShowCount) && (_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: cn('text-[10px] font-bold text-foreground', labelClassName), children: label }), shouldShowCount && (_jsxs("span", { className: cn('text-[10px] font-bold', toneStyles.count), children: [value.length, " selected"] }))] })), _jsx("div", { className: cn(groups && 'space-y-2.5', listClassName), children: isEmpty ? (_jsx("span", { className: "text-xs text-muted-foreground italic", children: emptyMessage })) : groups ? (groups
                    .filter((group) => group.options.length > 0)
                    .map((group) => (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-1 mb-1 text-muted-foreground", children: [group.icon, _jsx("span", { className: "text-[10px] font-bold uppercase tracking-wide", children: group.label })] }), renderChips(group.options)] }, group.key)))) : (renderChips(options)) })] }));
};
