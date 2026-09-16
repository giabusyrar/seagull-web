'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { PackageOpen, Plus } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../utils';
export const EmptyState = ({ icon, title, description, actionLabel, onAction, actionIcon = _jsx(Plus, { className: "h-3.5 w-3.5" }), className = '', }) => {
    return (_jsxs("div", { className: cn('p-8 text-center bg-card border border-border rounded-xl text-muted-foreground space-y-3 flex flex-col items-center justify-center shadow-xs', className), children: [_jsx("div", { className: "p-3 bg-muted/80 rounded-full text-muted-foreground/80 border border-border/50", children: icon || _jsx(PackageOpen, { className: "h-6 w-6" }) }), _jsxs("div", { className: "space-y-1 text-center", children: [_jsx("div", { className: "font-bold text-foreground text-sm", children: title }), description && _jsx("div", { className: "text-xs text-muted-foreground max-w-sm", children: description })] }), actionLabel && onAction && (_jsx(Button, { variant: "primary", size: "sm", onClick: onAction, leftIcon: actionIcon, className: "mt-2", children: actionLabel }))] }));
};
