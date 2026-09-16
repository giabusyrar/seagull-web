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
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../utils';
export const Button = React.forwardRef((_a, ref) => {
    var { variant = 'primary', size = 'md', isLoading = false, leftIcon, rightIcon, children, className = '', disabled } = _a, props = __rest(_a, ["variant", "size", "isLoading", "leftIcon", "rightIcon", "children", "className", "disabled"]);
    const variantStyles = {
        primary: 'bg-primary hover:bg-primary/90 active:scale-[0.98] text-primary-foreground font-bold shadow-xs',
        secondary: 'bg-secondary hover:bg-secondary/80 active:scale-[0.98] text-secondary-foreground font-semibold border border-border/50',
        outline: 'border border-border hover:bg-accent hover:text-accent-foreground text-foreground font-semibold',
        ghost: 'hover:bg-accent hover:text-accent-foreground text-muted-foreground hover:text-foreground font-medium',
        destructive: 'bg-destructive hover:bg-destructive/90 active:scale-[0.98] text-destructive-foreground font-bold shadow-xs',
        subtle: 'bg-beak/15 hover:bg-beak/25 active:scale-[0.98] text-primary font-semibold border border-beak/30',
    };
    const sizeStyles = {
        xs: 'h-7 px-2 text-[11px] rounded-md gap-1',
        sm: 'h-8 px-3 text-xs rounded-md gap-1.5',
        md: 'h-9 px-4 text-xs rounded-md gap-1.5',
        lg: 'h-10 px-5 text-sm rounded-lg gap-2',
        icon: 'h-9 w-9 p-0 rounded-md flex items-center justify-center',
        'icon-xs': 'h-6 w-6 p-0 rounded-md flex items-center justify-center text-xs',
        'icon-sm': 'h-7 w-7 p-0 rounded-md flex items-center justify-center text-xs',
        'icon-lg': 'h-10 w-10 p-0 rounded-lg flex items-center justify-center text-sm',
    };
    return (_jsxs("button", Object.assign({ ref: ref, type: "button", disabled: disabled || isLoading, className: cn('inline-flex items-center justify-center whitespace-nowrap transition cursor-pointer select-none disabled:opacity-50 disabled:pointer-events-none rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1', variantStyles[variant], sizeStyles[size], className) }, props, { children: [isLoading ? _jsx(Loader2, { className: "h-4 w-4 animate-spin shrink-0" }) : leftIcon, children, !isLoading && rightIcon] })));
});
Button.displayName = 'Button';
