'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '../utils';
export const MonospaceBadge = ({ children, variant = 'default', className = '', }) => {
    const variantStyles = {
        default: 'bg-secondary border-border text-muted-foreground',
        amber: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
        emerald: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
        rose: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
        blue: 'bg-sky-500/15 border-sky-500/30 text-sky-400',
        purple: 'bg-purple-500/15 border-purple-500/30 text-purple-400',
    };
    return (_jsx("span", { className: cn('inline-flex items-center px-2 py-0.5 border text-[10px] font-mono rounded select-none', variantStyles[variant], className), children: children }));
};
