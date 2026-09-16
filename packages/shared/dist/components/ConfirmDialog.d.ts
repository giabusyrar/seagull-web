import React from 'react';
export interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    title?: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isDestructive?: boolean;
    variant?: 'danger' | 'warning' | 'info' | 'default';
    isLoading?: boolean;
}
export declare const ConfirmDialog: React.FC<ConfirmDialogProps>;
