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
import { cn } from '../utils';
export const Input = React.forwardRef((_a, ref) => {
    var { leftIcon, rightIcon, error, helperText, className = '' } = _a, props = __rest(_a, ["leftIcon", "rightIcon", "error", "helperText", "className"]);
    return (_jsxs("div", { className: "w-full space-y-1", children: [_jsxs("div", { className: "relative flex items-center", children: [leftIcon && (_jsx("div", { className: "absolute left-3 text-muted-foreground pointer-events-none shrink-0 flex items-center justify-center", children: leftIcon })), _jsx("input", Object.assign({ ref: ref, className: cn('w-full h-9 bg-secondary/50 border border-border rounded-lg text-foreground text-xs outline-none focus:border-ring focus:ring-1 focus:ring-ring transition placeholder:text-muted-foreground', leftIcon ? 'pl-9' : 'px-3', rightIcon ? 'pr-9' : 'pr-3', error ? 'border-destructive focus:border-destructive focus:ring-destructive/30' : '', className) }, props)), rightIcon && (_jsx("div", { className: "absolute right-3 text-muted-foreground shrink-0 flex items-center justify-center", children: rightIcon }))] }), error && _jsx("div", { className: "text-[10px] text-destructive font-medium", children: error }), !error && helperText && _jsx("div", { className: "text-[10px] text-muted-foreground", children: helperText })] }));
});
Input.displayName = 'Input';
