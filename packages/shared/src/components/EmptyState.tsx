'use client';

import React from 'react';
import { PackageOpen, Plus } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../utils';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon = <Plus className="h-3.5 w-3.5" />,
  className = '',
}) => {
  return (
    <div
      className={cn(
        'p-8 text-center bg-card border border-border rounded-xl text-muted-foreground space-y-3 flex flex-col items-center justify-center shadow-xs',
        className
      )}
    >
      <div className="p-3 bg-muted/80 rounded-full text-muted-foreground/80 border border-border/50">
        {icon || <PackageOpen className="h-6 w-6" />}
      </div>
      <div className="space-y-1 text-center">
        <div className="font-bold text-foreground text-sm">{title}</div>
        {description && <div className="text-xs text-muted-foreground max-w-sm">{description}</div>}
      </div>
      {actionLabel && onAction && (
        <Button
          variant="primary"
          size="sm"
          onClick={onAction}
          leftIcon={actionIcon}
          className="mt-2"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
