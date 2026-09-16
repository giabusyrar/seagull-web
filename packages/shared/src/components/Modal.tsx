'use client';

import React, { useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { InfoTooltip } from './InfoTooltip';
import { cn } from '../utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: string;
  icon?: React.ReactNode;
  headerBadge?: React.ReactNode;
  headerRight?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | 'full';
  maxHeight?: string;
  maxWidth?: string;
  scrollable?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  isPrimaryLoading?: boolean;
  isPrimaryDisabled?: boolean;
  primaryActionVariant?: 'primary' | 'destructive' | 'secondary' | 'outline';
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  bodyClassName?: string;
  isLoading?: boolean;
  loadingText?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  headerBadge,
  headerRight,
  size = 'md',
  maxHeight = 'max-h-[90vh]',
  maxWidth,
  scrollable = true,
  children,
  footer,
  primaryActionLabel,
  onPrimaryAction,
  isPrimaryLoading = false,
  isPrimaryDisabled = false,
  primaryActionVariant = 'primary',
  secondaryActionLabel,
  onSecondaryAction,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = '',
  bodyClassName = '',
  isLoading = false,
  loadingText,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLoading && closeOnEscape && e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeOnEscape, onClose, isLoading]);

  if (!isOpen) return null;

  const sizeClasses: Record<string, string> = {
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

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md transition-all duration-200 animate-in fade-in flex items-center justify-center p-3 sm:p-4 text-xs text-foreground select-none"
      onClick={(e) => {
        if (!isLoading && closeOnOverlayClick && e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={cn(
          'relative bg-popover border border-border rounded-xl shadow-2xl w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150',
          maxWidth || sizeClasses[size] || 'max-w-md',
          maxHeight,
          className
        )}
      >
        {isLoading && (
          <div className="absolute inset-0 z-30 bg-popover/80 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2.5 animate-in fade-in duration-150 select-none">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <span className="text-xs font-semibold text-foreground tracking-wide">
              {loadingText || 'Saving changes...'}
            </span>
          </div>
        )}

        {title && (
          <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/40 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              {icon && <div className="shrink-0 text-primary">{icon}</div>}
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {typeof title === 'string' ? <h3 className="font-bold text-sm text-foreground truncate">{title}</h3> : title}
                  {subtitle && <InfoTooltip content={subtitle} label="About this dialog" />}
                  {headerBadge}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {headerRight}
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <div className={cn('p-4 space-y-4 flex-1', scrollable ? 'overflow-y-auto' : '', bodyClassName)}>
          {children}
        </div>

        {(footer || primaryActionLabel || secondaryActionLabel) && (
          <div className="px-4 py-3 border-t border-border flex items-center justify-end gap-2 bg-muted/20 shrink-0">
            {footer || (
              <>
                {secondaryActionLabel && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onSecondaryAction || onClose}
                  >
                    {secondaryActionLabel}
                  </Button>
                )}
                {primaryActionLabel && onPrimaryAction && (
                  <Button
                    variant={primaryActionVariant}
                    size="sm"
                    disabled={isPrimaryDisabled || isLoading}
                    isLoading={isPrimaryLoading || isLoading}
                    onClick={onPrimaryAction}
                  >
                    {primaryActionLabel}
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
