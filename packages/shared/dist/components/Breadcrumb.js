'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ChevronRight } from 'lucide-react';
import { cn } from '../utils';
export const Breadcrumb = ({ items, className = '', onItemClick, }) => {
    if (items.length === 0)
        return null;
    return (_jsx("nav", { "aria-label": "Breadcrumb", className: cn('flex items-center gap-1.5 text-xs text-muted-foreground select-none', className), children: _jsx("ol", { className: "flex items-center gap-1.5 flex-wrap", children: items.map((item, index) => {
                const isLast = index === items.length - 1;
                return (_jsxs("li", { className: "flex items-center gap-1.5", children: [index > 0 && _jsx(ChevronRight, { className: "h-3.5 w-3.5 text-muted-foreground/60 shrink-0" }), item.href && !isLast ? (_jsxs("a", { href: item.href, onClick: (e) => {
                                if (onItemClick) {
                                    e.preventDefault();
                                    onItemClick(item);
                                }
                            }, className: "flex items-center gap-1 hover:text-foreground transition font-medium", children: [item.icon, _jsx("span", { children: item.label })] })) : (_jsxs("span", { className: cn('flex items-center gap-1', isLast ? 'text-foreground font-semibold' : 'text-muted-foreground'), "aria-current": isLast ? 'page' : undefined, children: [item.icon, _jsx("span", { children: item.label })] }))] }, item.label + index));
            }) }) }));
};
