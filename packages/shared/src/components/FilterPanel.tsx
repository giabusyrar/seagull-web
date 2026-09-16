'use client';

import React, { useState, useEffect } from 'react';
import { X, RotateCcw, Check, SlidersHorizontal } from 'lucide-react';
import { SearchableSelect } from './SearchableSelect';
import { Button } from './Button';
import { cn } from '../utils';

export interface FilterPillOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface FilterSelectOption {
  value: string;
  label: string;
  description?: string;
}

export interface FilterSection {
  id: string;
  label: string;
  type: 'pills' | 'select' | 'range' | 'checkbox';
  options?: (FilterPillOption | FilterSelectOption)[];
  isMultiSelect?: boolean;
  searchPlaceholder?: string;
  minLabel?: string;
  maxLabel?: string;
}

export interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  sections: FilterSection[];
  initialFilters?: Record<string, any>;
  onApply: (filters: Record<string, any>) => void;
  onReset?: () => void;
  resultCount?: number | ((currentFilters: Record<string, any>) => number);
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  isOpen,
  onClose,
  title = 'Filter Options',
  sections,
  initialFilters = {},
  onApply,
  onReset,
  resultCount,
}) => {
  const [filters, setFilters] = useState<Record<string, any>>(initialFilters);
  const currentCount = typeof resultCount === 'function' ? resultCount(filters) : resultCount;

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePillClick = (sectionId: string, optionId: string, isMultiSelect?: boolean) => {
    const current = filters[sectionId];
    if (isMultiSelect) {
      const currentList: string[] = Array.isArray(current) ? current : [];
      const updated = currentList.includes(optionId)
        ? currentList.filter((item) => item !== optionId)
        : [...currentList, optionId];
      setFilters({ ...filters, [sectionId]: updated });
    } else {
      setFilters({ ...filters, [sectionId]: current === optionId ? 'all' : optionId });
    }
  };

  const handleReset = () => {
    setFilters({});
    if (onReset) onReset();
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md transition-all duration-200 animate-in fade-in flex items-center justify-center p-4">
      <div className="bg-popover border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-beak/15 border border-beak/30 rounded-lg text-primary flex items-center justify-center shrink-0">
              <SlidersHorizontal className="h-4 w-4" />
            </div>
            <h3 className="font-bold text-foreground text-sm tracking-tight">{title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-medium text-muted-foreground hover:text-primary flex items-center gap-1 px-2 py-1 rounded-md hover:bg-accent transition cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-accent transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filter Sections Container */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 select-none">
          {sections.map((section) => (
            <div key={section.id} className="space-y-1.5">
              <label className="block text-xs font-semibold text-foreground">
                {section.label}
              </label>

              {/* PILLS TYPE */}
              {section.type === 'pills' && (
                <div className="flex flex-wrap gap-2">
                  {section.options?.map((opt: any) => {
                    const optionId = opt.id !== undefined ? opt.id : opt.value;
                    const isSelected = section.isMultiSelect
                      ? Array.isArray(filters[section.id]) && filters[section.id].includes(optionId)
                      : (filters[section.id] || 'all') === optionId;

                    return (
                      <button
                        key={optionId}
                        type="button"
                        onClick={() => handlePillClick(section.id, optionId, section.isMultiSelect)}
                        className={cn(
                          'px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border transition cursor-pointer',
                          isSelected
                            ? 'bg-primary border-primary text-primary-foreground shadow-xs'
                            : 'bg-secondary/60 border-border text-foreground hover:bg-accent'
                        )}
                      >
                        {isSelected ? (
                          <Check className="h-3.5 w-3.5 text-primary-foreground stroke-[3]" />
                        ) : (
                          opt.icon
                        )}
                        <span>{opt.label}</span>
                        {opt.badge !== undefined && (
                          <span
                            className={cn(
                              'px-1.5 py-0.2 rounded-full text-[10px]',
                              isSelected ? 'bg-primary-foreground/20 text-primary-foreground font-extrabold' : 'bg-muted text-muted-foreground'
                            )}
                          >
                            {opt.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* SEARCHABLE MULTI-SELECT DROPDOWN TYPE */}
              {section.type === 'select' && (
                <SearchableSelect
                  options={(section.options || []).map((opt: any) => ({
                    value: opt.value !== undefined ? opt.value : opt.id,
                    label: opt.label,
                    description: opt.description,
                  }))}
                  placeholder={`Select ${section.label.toLowerCase()}...`}
                  searchPlaceholder={section.searchPlaceholder || `Search ${section.label.toLowerCase()}...`}
                  multiple={section.isMultiSelect !== false}
                  value={
                    section.isMultiSelect !== false
                      ? Array.isArray(filters[section.id])
                        ? filters[section.id]
                        : []
                      : (filters[section.id] as string) || ''
                  }
                  onChange={(val: string | string[]) => setFilters({ ...filters, [section.id]: val })}
                />
              )}

              {/* RANGE TYPE */}
              {section.type === 'range' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="block text-[10px] text-muted-foreground mb-1">{section.minLabel || 'Min'}</span>
                    <input
                      type="number"
                      value={filters[`${section.id}_min`] || ''}
                      onChange={(e) => setFilters({ ...filters, [`${section.id}_min`]: e.target.value })}
                      placeholder="0"
                      className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-1.5 text-xs text-foreground font-mono outline-none focus:border-ring"
                    />
                  </div>
                  <div>
                    <span className="block text-[10px] text-muted-foreground mb-1">{section.maxLabel || 'Max'}</span>
                    <input
                      type="number"
                      value={filters[`${section.id}_max`] || ''}
                      onChange={(e) => setFilters({ ...filters, [`${section.id}_max`]: e.target.value })}
                      placeholder="100"
                      className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-1.5 text-xs text-foreground font-mono outline-none focus:border-ring"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer Action Button */}
        <div className="p-5 border-t border-border bg-muted/20">
          <Button
            variant="primary"
            size="md"
            onClick={handleApply}
            className="w-full"
          >
            {currentCount !== undefined
              ? `Apply Filters (${currentCount})`
              : 'Apply Filters'}
          </Button>
        </div>
      </div>
    </div>
  );
};
