import React from 'react';
import { Clock, Archive, CheckCircle, AlertCircle } from 'lucide-react';

export interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status = 'ACTIVE',
  size = 'sm',
  className = '',
}) => {
  const s = (status || 'ACTIVE').toUpperCase().trim();
  const padding = size === 'md' ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[11px]';

  switch (s) {
    case 'ACTIVE':
    case 'PUBLISHED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 ${padding} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
          Active
        </span>
      );
    case 'DRAFT':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-amber-50 text-amber-800 border border-amber-200 ${padding} ${className}`}
        >
          <Clock className="w-3 h-3 shrink-0" />
          Draft
        </span>
      );
    case 'ARCHIVED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-rose-50 text-rose-800 border border-rose-200 ${padding} ${className}`}
        >
          <Archive className="w-3 h-3 shrink-0" />
          Archived
        </span>
      );
    case 'INACTIVE':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-slate-100 text-slate-700 border border-slate-200 ${padding} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
          Inactive
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-secondary text-secondary-foreground border border-border ${padding} ${className}`}
        >
          {status}
        </span>
      );
  }
};
