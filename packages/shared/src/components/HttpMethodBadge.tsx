'use client';

import React from 'react';
import { cn } from '../utils';

export interface HttpMethodBadgeProps {
  method: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const HttpMethodBadge: React.FC<HttpMethodBadgeProps> = ({
  method,
  size = 'md',
  className = '',
}) => {
  const upper = (method || 'GET').toUpperCase();
  const styles: Record<string, string> = {
    GET: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    POST: 'bg-amber-50 border-amber-200 text-amber-800',
    PUT: 'bg-sky-50 border-sky-200 text-sky-700',
    PATCH: 'bg-purple-50 border-purple-200 text-purple-700',
    DELETE: 'bg-rose-50 border-rose-200 text-rose-700',
    OPTIONS: 'bg-teal-50 border-teal-200 text-teal-700',
    HEAD: 'bg-slate-100 border-slate-300 text-slate-700',
  };

  const badgeStyle = styles[upper] || 'bg-secondary border-border text-secondary-foreground';

  const sizeStyles = {
    sm: 'px-1.5 py-0.2 text-[9px]',
    md: 'px-2 py-0.5 text-[10px]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center border font-mono font-bold rounded uppercase tracking-wider select-none shrink-0',
        badgeStyle,
        sizeStyles[size],
        className
      )}
    >
      {upper}
    </span>
  );
};
