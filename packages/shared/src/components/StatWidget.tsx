'use client';

import React from 'react';
import { cn } from '../utils';

export interface StatWidgetProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtext?: string;
  description?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  onClick?: () => void;
  className?: string;
}

export const StatWidget: React.FC<StatWidgetProps> = ({
  icon,
  title,
  value,
  subtext,
  description,
  trend,
  onClick,
  className = '',
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-card border border-border rounded-xl p-4 space-y-2 shadow-xs transition',
        onClick ? 'cursor-pointer hover:border-accent-foreground/30 hover:shadow-sm' : '',
        className
      )}
    >
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs font-medium">{title}</span>
        <div className="p-2 bg-beak/10 rounded-lg text-primary border border-beak/20">{icon}</div>
      </div>
      <div className="flex items-baseline gap-2">
        <div className="text-2xl font-bold text-foreground tracking-tight">{value}</div>
        {trend && (
          <span
            className={cn(
              'text-[10px] font-bold px-1.5 py-0.5 rounded',
              trend.isPositive
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
            )}
          >
            {trend.value}
          </span>
        )}
      </div>
      {(description || subtext) && (
        <div className="text-xs text-muted-foreground">{description || subtext}</div>
      )}
    </div>
  );
};
