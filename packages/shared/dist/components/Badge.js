'use client';
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '../utils';
export const Badge = (_a) => {
    var { variant = 'default', size = 'md', children, className = '' } = _a, props = __rest(_a, ["variant", "size", "children", "className"]);
    const variantStyles = {
        default: 'bg-secondary border-border text-secondary-foreground',
        secondary: 'bg-muted border-border text-muted-foreground',
        amber: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
        warning: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
        emerald: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
        success: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
        rose: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
        destructive: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
        blue: 'bg-sky-500/15 border-sky-500/30 text-sky-400',
        info: 'bg-sky-500/15 border-sky-500/30 text-sky-400',
        purple: 'bg-purple-500/15 border-purple-500/30 text-purple-400',
        outline: 'border-border text-muted-foreground bg-transparent',
    };
    const sizeStyles = {
        sm: 'px-1.5 py-0.2 text-[9px]',
        md: 'px-2 py-0.5 text-[10px]',
    };
    return (_jsx("span", Object.assign({ className: cn('inline-flex items-center border font-semibold rounded whitespace-nowrap tracking-wide select-none', variantStyles[variant], sizeStyles[size], className) }, props, { children: children })));
};
