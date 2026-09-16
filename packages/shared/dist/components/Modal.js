'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { InfoTooltip } from './InfoTooltip';
import { cn } from '../utils';
export const Modal = ({ isOpen, onClose, title, subtitle, icon, headerBadge, headerRight, size = 'md', maxHeight = 'max-h-[90vh]', maxWidth, scrollable = true, children, footer, primaryActionLabel, onPrimaryAction, isPrimaryLoading = false, isPrimaryDisabled = false, primaryActionVariant = 'primary', secondaryActionLabel, onSecondaryAction, closeOnOverlayClick = true, closeOnEscape = true, className = '', bodyClassName = '', isLoading = false, loadingText, }) => {
    useEffect(() => {
        if (!isOpen)
            return;
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const handleKeyDown = (e) => {
            if (!isLoading && closeOnEscape && e.key === 'Escape')
                onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = originalOverflow;
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, closeOnEscape, onClose, isLoading]);
    if (!isOpen)
        return null;
    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        '5xl': 'max-w-5xl',
        '6xl': 'max-w-6xl',
        full: 'max-w-full m-2',
    };
    return (_jsx("div", { className: "fixed inset-0 z-[100] bg-black/80 backdrop-blur-md transition-all duration-200 animate-in fade-in flex items-center justify-center p-3 sm:p-4 text-xs text-foreground select-none", onClick: (e) => {
            if (!isLoading && closeOnOverlayClick && e.target === e.currentTarget) {
                onClose();
            }
        }, children: _jsxs("div", { className: cn('relative bg-popover border border-border rounded-xl shadow-2xl w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150', maxWidth || sizeClasses[size] || 'max-w-md', maxHeight, className), children: [isLoading && (_jsxs("div", { className: "absolute inset-0 z-30 bg-popover/80 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2.5 animate-in fade-in duration-150 select-none", children: [_jsx(Loader2, { className: "h-7 w-7 animate-spin text-primary" }), _jsx("span", { className: "text-xs font-semibold text-foreground tracking-wide", children: loadingText || 'Saving changes...' })] })), title && (_jsxs("div", { className: "px-4 py-3 border-b border-border flex items-center justify-between bg-muted/40 shrink-0", children: [_jsxs("div", { className: "flex items-center gap-2.5 min-w-0", children: [icon && _jsx("div", { className: "shrink-0 text-primary", children: icon }), _jsx("div", { className: "min-w-0", children: _jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [typeof title === 'string' ? _jsx("h3", { className: "font-bold text-sm text-foreground truncate", children: title }) : title, subtitle && _jsx(InfoTooltip, { content: subtitle, label: "About this dialog" }), headerBadge] }) })] }), _jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [headerRight, _jsx("button", { type: "button", onClick: onClose, disabled: isLoading, className: "p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition cursor-pointer disabled:opacity-40 disabled:pointer-events-none", children: _jsx(X, { className: "h-4 w-4" }) })] })] })), _jsx("div", { className: cn('p-4 space-y-4 flex-1', scrollable ? 'overflow-y-auto' : '', bodyClassName), children: children }), (footer || primaryActionLabel || secondaryActionLabel) && (_jsx("div", { className: "px-4 py-3 border-t border-border flex items-center justify-end gap-2 bg-muted/20 shrink-0", children: footer || (_jsxs(_Fragment, { children: [secondaryActionLabel && (_jsx(Button, { variant: "outline", size: "sm", onClick: onSecondaryAction || onClose, children: secondaryActionLabel })), primaryActionLabel && onPrimaryAction && (_jsx(Button, { variant: primaryActionVariant, size: "sm", disabled: isPrimaryDisabled || isLoading, isLoading: isPrimaryLoading || isLoading, onClick: onPrimaryAction, children: primaryActionLabel }))] })) }))] }) }));
};
