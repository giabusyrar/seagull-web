'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../utils';

export interface ChipOption {
  value: string;
  label: string;
  description?: string;
}

export interface ChipGroup {
  key: string;
  label: string;
  icon?: React.ReactNode;
  options: ChipOption[];
}

export type ChipTone = 'primary' | 'cyan' | 'amber' | 'indigo';

export interface ChipMultiSelectProps {
  /** Flat option list. Ignored when `groups` is provided. */
  options?: ChipOption[];
  /** Options split under labelled sub-headers (e.g. skin conditions by dimension). */
  groups?: ChipGroup[];
  value: string[];
  /** Receives the next selection plus the value that was just toggled. */
  onChange: (next: string[], toggled: string) => void;
  label?: React.ReactNode;
  /** Shows "N selected" next to the label. Defaults to true when a label is set. */
  showCount?: boolean;
  tone?: ChipTone;
  /** Renders a checkbox indicator inside each chip — for permission-style pickers. */
  showCheckbox?: boolean;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
  /** Classes for the chip container, e.g. `max-h-72 overflow-y-auto`. */
  listClassName?: string;
}

const TONE_STYLES: Record<ChipTone, { selected: string; count: string }> = {
  primary: { selected: 'border-primary/50 bg-primary/10 text-foreground', count: 'text-primary' },
  cyan: { selected: 'border-cyan-500/50 bg-cyan-50/50 dark:bg-cyan-950/20 text-foreground', count: 'text-cyan-600' },
  amber: { selected: 'border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20 text-foreground', count: 'text-amber-600' },
  indigo: { selected: 'border-indigo-500/50 bg-indigo-50/50 dark:bg-indigo-950/20 text-foreground', count: 'text-indigo-600' },
};

export const ChipMultiSelect: React.FC<ChipMultiSelectProps> = ({
  options = [],
  groups,
  value,
  onChange,
  label,
  showCount,
  tone = 'primary',
  showCheckbox = false,
  emptyMessage = 'No options available.',
  disabled = false,
  className,
  labelClassName,
  listClassName,
}) => {
  const toneStyles = TONE_STYLES[tone];
  const shouldShowCount = showCount ?? label !== undefined;
  const isEmpty = groups ? groups.every((g) => g.options.length === 0) : options.length === 0;

  const toggle = (optionValue: string) => {
    if (disabled) return;
    const next = value.includes(optionValue) ? value.filter((v) => v !== optionValue) : [...value, optionValue];
    onChange(next, optionValue);
  };

  const renderChips = (chipOptions: ChipOption[]) => (
    <div className="flex flex-wrap gap-1.5">
      {chipOptions.map((opt) => {
        const isSelected = value.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            role="checkbox"
            aria-checked={isSelected}
            title={opt.description}
            disabled={disabled}
            onClick={() => toggle(opt.value)}
            className={cn(
              'inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
              isSelected ? toneStyles.selected : 'border-border bg-background text-muted-foreground hover:border-slate-300'
            )}
          >
            {showCheckbox && (
              <span
                className={cn(
                  'h-3 w-3 rounded-sm border flex items-center justify-center shrink-0',
                  isSelected ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/40'
                )}
              >
                {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
              </span>
            )}
            {opt.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className={cn('space-y-1.5', className)}>
      {(label !== undefined || shouldShowCount) && (
        <div className="flex items-center justify-between">
          <span className={cn('text-[10px] font-bold text-foreground', labelClassName)}>{label}</span>
          {shouldShowCount && (
            <span className={cn('text-[10px] font-bold', toneStyles.count)}>{value.length} selected</span>
          )}
        </div>
      )}
      <div className={cn(groups && 'space-y-2.5', listClassName)}>
        {isEmpty ? (
          <span className="text-xs text-muted-foreground italic">{emptyMessage}</span>
        ) : groups ? (
          groups
            .filter((group) => group.options.length > 0)
            .map((group) => (
              <div key={group.key}>
                <div className="flex items-center gap-1 mb-1 text-muted-foreground">
                  {group.icon}
                  <span className="text-[10px] font-bold uppercase tracking-wide">{group.label}</span>
                </div>
                {renderChips(group.options)}
              </div>
            ))
        ) : (
          renderChips(options)
        )}
      </div>
    </div>
  );
};
