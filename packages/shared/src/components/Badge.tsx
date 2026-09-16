'use client';

import React from 'react';
import { cn } from '../utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'amber' | 'emerald' | 'rose' | 'blue' | 'purple' | 'outline' | 'success' | 'warning' | 'destructive' | 'info';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-secondary border-border text-secondary-foreground',
    secondary: 'bg-muted border-border text-muted-foreground',
    amber: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
    warning: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
    emerald: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
    success: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
    rose: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
    destructive: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
    blue: 'bg-sky-500/15 border-sky-500/30 text-sky-400',
    info: 'bg-sky-500/15 border-sky-500/30 text-sky-400',
    purple: 'bg-purple-500/15 border-purple-500/30 text-purple-400',
    outline: 'border-border text-muted-foreground bg-transparent',
  };

  const sizeStyles = {
    sm: 'px-1.5 py-0.2 text-[9px]',
    md: 'px-2 py-0.5 text-[10px]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center border font-semibold rounded whitespace-nowrap tracking-wide select-none',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
