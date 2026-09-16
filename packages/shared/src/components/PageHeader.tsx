'use client';

import React from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem } from './Breadcrumb';
import { Button } from './Button';
import { InfoTooltip } from './InfoTooltip';
import { cn } from '../utils';

export interface PageHeaderProps {
  icon?: React.ReactNode;
  eyebrow?: string;
  breadcrumbs?: BreadcrumbItem[];
  title: string;
  description?: string;
  badge?: React.ReactNode;
  onBack?: () => void;
  backLabel?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  icon,
  eyebrow,
  breadcrumbs,
  title,
  description,
  badge,
  onBack,
  backLabel = 'Back',
  actionLabel,
  onAction,
  actionIcon,
  children,
  className = '',
}) => {
  return (
    <header
      className={cn(
        'px-4 sm:px-6 py-4 bg-card border-b border-border flex flex-col lg:flex-row items-start lg:items-center justify-between shrink-0 gap-3 min-w-0',
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0 shrink-0">
        {onBack && (
          <Button
            variant="outline"
            size="icon-sm"
            onClick={onBack}
            title={backLabel}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          />
        )}

        {icon && (
          <div className="p-2 bg-beak/10 rounded-lg border border-beak/20 text-primary shrink-0">
            {icon}
          </div>
        )}

        <div className="space-y-0.5 min-w-0">
          {breadcrumbs && breadcrumbs.length > 0 ? (
            <Breadcrumb items={breadcrumbs} className="mb-1" />
          ) : eyebrow ? (
            <div className="text-[10px] font-bold text-primary uppercase tracking-wider">
              {eyebrow}
            </div>
          ) : null}
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-base sm:text-lg font-bold text-foreground leading-tight truncate">{title}</h1>
            {description && <InfoTooltip content={description} label={`About ${title}`} />}
            {badge}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap shrink-0">
        {children && (
          <div className="min-w-0 max-w-full overflow-x-auto flex items-center shrink-0">
            {children}
          </div>
        )}

        {actionLabel && onAction && (
          <Button
            variant="primary"
            size="sm"
            onClick={onAction}
            leftIcon={actionIcon || <Plus className="h-3.5 w-3.5" />}
          >
            {actionLabel}
          </Button>
        )}
      </div>
    </header>
  );
};
