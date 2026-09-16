'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MonospaceBadge } from './MonospaceBadge';
import { cn } from '../utils';
export const FeatureCard = ({ title, badgeKey, description, statsText, actionLabel, onAction, children, className = '', }) => {
    return (_jsxs("div", { className: cn('bg-card border border-border rounded-xl p-5 space-y-3 shadow-xs hover:border-accent-foreground/25 transition flex flex-col justify-between', className), children: [_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between gap-2", children: [_jsx("h3", { className: "font-bold text-foreground text-sm truncate", children: title }), badgeKey && _jsx(MonospaceBadge, { children: badgeKey })] }), description && _jsx("p", { className: "text-xs text-muted-foreground line-clamp-2", children: description }), children] }), (statsText || (actionLabel && onAction)) && (_jsxs("div", { className: "pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground mt-auto", children: [_jsx("span", { children: statsText }), actionLabel && onAction && (_jsxs("button", { type: "button", onClick: onAction, className: "text-primary hover:underline font-semibold cursor-pointer", children: [actionLabel, " \u2192"] }))] }))] }));
};
