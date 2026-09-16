'use client';

import React from 'react';
import { MonospaceBadge } from './MonospaceBadge';
import { cn } from '../utils';

export interface FeatureCardProps {
  title: string;
  badgeKey?: string;
  description?: string;
  statsText?: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  badgeKey,
  description,
  statsText,
  actionLabel,
  onAction,
  children,
  className = '',
}) => {
  return (
    <div
      className={cn(
        'bg-card border border-border rounded-xl p-5 space-y-3 shadow-xs hover:border-accent-foreground/25 transition flex flex-col justify-between',
        className
      )}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-bold text-foreground text-sm truncate">{title}</h3>
          {badgeKey && <MonospaceBadge>{badgeKey}</MonospaceBadge>}
        </div>

        {description && <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>}

        {children}
      </div>

      {(statsText || (actionLabel && onAction)) && (
        <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground mt-auto">
          <span>{statsText}</span>
          {actionLabel && onAction && (
            <button
              type="button"
              onClick={onAction}
              className="text-primary hover:underline font-semibold cursor-pointer"
            >
              {actionLabel} &rarr;
            </button>
          )}
        </div>
      )}
    </div>
  );
};
