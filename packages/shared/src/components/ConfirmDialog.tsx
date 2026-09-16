'use client';

import React from 'react';
import { AlertTriangle, Trash2, Info } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { cn } from '../utils';

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

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive,
  variant,
  isLoading = false,
}) => {
  const isDanger = variant === 'danger' || (isDestructive ?? true);
  const isWarning = variant === 'warning';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="py-2 px-1 text-center space-y-4">
        {/* Icon Badge */}
        <div
          className={cn(
            'mx-auto w-12 h-12 rounded-full flex items-center justify-center shadow-md',
            isDanger
              ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
              : isWarning
              ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
              : 'bg-beak/15 border border-beak/30 text-primary'
          )}
        >
          {isDanger ? (
            <Trash2 className="h-5 w-5" />
          ) : isWarning ? (
            <AlertTriangle className="h-5 w-5" />
          ) : (
            <Info className="h-5 w-5" />
          )}
        </div>

        {/* Header & Message */}
        <div className="space-y-1.5 px-2">
          <h4 className="font-bold text-foreground text-sm sm:text-base tracking-tight">{title}</h4>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-[280px] mx-auto break-words">{message}</p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-between gap-3 w-full">
          <Button
            variant="outline"
            size="md"
            onClick={onClose}
            className="flex-1"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={isDanger ? 'destructive' : 'primary'}
            size="md"
            disabled={isLoading}
            isLoading={isLoading}
            onClick={onConfirm}
            className="flex-1"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
