'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../utils';
export const StatWidget = ({ icon, title, value, subtext, description, trend, onClick, className = '', }) => {
    return (_jsxs("div", { onClick: onClick, className: cn('bg-card border border-border rounded-xl p-4 space-y-2 shadow-xs transition', onClick ? 'cursor-pointer hover:border-accent-foreground/30 hover:shadow-sm' : '', className), children: [_jsxs("div", { className: "flex items-center justify-between text-muted-foreground", children: [_jsx("span", { className: "text-xs font-medium", children: title }), _jsx("div", { className: "p-2 bg-beak/10 rounded-lg text-primary border border-beak/20", children: icon })] }), _jsxs("div", { className: "flex items-baseline gap-2", children: [_jsx("div", { className: "text-2xl font-bold text-foreground tracking-tight", children: value }), trend && (_jsx("span", { className: cn('text-[10px] font-bold px-1.5 py-0.5 rounded', trend.isPositive
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'), children: trend.value }))] }), (description || subtext) && (_jsx("div", { className: "text-xs text-muted-foreground", children: description || subtext }))] }));
};
