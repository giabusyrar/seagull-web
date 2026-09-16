'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../utils';
export const TabNav = ({ tabs, activeTab, onTabChange, className = '', }) => {
    return (_jsx("div", { className: cn('flex items-center gap-1 bg-secondary/50 p-1 rounded-xl border border-border text-xs overflow-x-auto max-w-full [scrollbar-width:none] shrink-0 select-none', className), children: tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (_jsxs("button", { type: "button", onClick: () => onTabChange(tab.id), className: cn('px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer text-xs', isActive
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'), children: [tab.stepNumber !== undefined && (_jsx("span", { className: cn('w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold', isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'), children: tab.stepNumber })), tab.icon, _jsx("span", { children: tab.label }), tab.badge !== undefined && (_jsx("span", { className: cn('px-1.5 py-0.2 rounded text-[10px] font-mono', isActive ? 'bg-primary-foreground/20 text-primary-foreground font-extrabold' : 'bg-muted text-muted-foreground'), children: tab.badge }))] }, tab.id));
        }) }));
};
