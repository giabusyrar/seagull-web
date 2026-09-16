'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AlertTriangle, Trash2, Info } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { cn } from '../utils';
export const ConfirmDialog = ({ isOpen, onClose, onConfirm, title = 'Confirm Action', message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', isDestructive, variant, isLoading = false, }) => {
    const isDanger = variant === 'danger' || (isDestructive !== null && isDestructive !== void 0 ? isDestructive : true);
    const isWarning = variant === 'warning';
    return (_jsx(Modal, { isOpen: isOpen, onClose: onClose, size: "sm", children: _jsxs("div", { className: "py-2 px-1 text-center space-y-4", children: [_jsx("div", { className: cn('mx-auto w-12 h-12 rounded-full flex items-center justify-center shadow-md', isDanger
                        ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
                        : isWarning
                            ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                            : 'bg-beak/15 border border-beak/30 text-primary'), children: isDanger ? (_jsx(Trash2, { className: "h-5 w-5" })) : isWarning ? (_jsx(AlertTriangle, { className: "h-5 w-5" })) : (_jsx(Info, { className: "h-5 w-5" })) }), _jsxs("div", { className: "space-y-1.5 px-2", children: [_jsx("h4", { className: "font-bold text-foreground text-sm sm:text-base tracking-tight", children: title }), _jsx("p", { className: "text-xs text-muted-foreground leading-relaxed max-w-[280px] mx-auto break-words", children: message })] }), _jsxs("div", { className: "pt-2 flex items-center justify-between gap-3 w-full", children: [_jsx(Button, { variant: "outline", size: "md", onClick: onClose, className: "flex-1", children: cancelLabel }), _jsx(Button, { variant: isDanger ? 'destructive' : 'primary', size: "md", disabled: isLoading, isLoading: isLoading, onClick: onConfirm, className: "flex-1", children: confirmLabel })] })] }) }));
};
