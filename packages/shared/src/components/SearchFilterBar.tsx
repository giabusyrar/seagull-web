'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, RefreshCw, Plus, ChevronDown, X } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../utils';

export interface FilterOptionItem {
  value: string;
  label: string;
}

export interface ColumnOptionItem {
  value: string;
  label: string;
}

export interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;

  // Optional Column Select for Search Target
  searchColumn?: string;
  onSearchColumnChange?: (value: string) => void;
  columnOptions?: ColumnOptionItem[];

  // Optional Filter Select
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterOptions?: FilterOptionItem[];

  // Advanced Filter Panel Trigger / Custom Filter Content
  onOpenFilterPanel?: () => void;
  customFilterContent?: React.ReactNode;
  activeFilterCount?: number;

  // Optional Refresh Button
  onRefresh?: () => void;
  isLoading?: boolean;

  // Primary Action Button
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;

  // Custom Actions Slot
  actions?: React.ReactNode;
  className?: string;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search items...',
  filterValue,
  onFilterChange,
  filterOptions,
  onOpenFilterPanel,
  customFilterContent,
  activeFilterCount,
  onRefresh,
  isLoading = false,
  actionLabel,
  onAction,
  actionIcon,
  actions,
  className = '',
}) => {
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterDropdownOpen(false);
      }
    };
    if (isFilterDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterDropdownOpen]);

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border shadow-xs w-full relative',
        className
      )}
    >
      {/* Left Container: Search Input Box */}
      <div className="relative flex-1 min-w-0 w-full flex items-center">
        <Search
          style={{ left: '0.75rem' }}
          className="h-4 w-4 text-muted-foreground absolute top-1/2 -translate-y-1/2 pointer-events-none z-10 shrink-0"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          style={{ paddingLeft: '2.5rem', paddingRight: searchQuery ? '2.25rem' : '1rem' }}
          className="w-full h-9 bg-secondary/50 text-xs text-foreground placeholder:text-muted-foreground rounded-lg pl-10 pr-8 border border-border focus:border-ring focus:ring-1 focus:ring-ring outline-none transition"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            style={{ right: '0.625rem' }}
            className="absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition cursor-pointer p-0.5 rounded-md hover:bg-accent"
            title="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Right Controls Container: Filter Select, Refresh, Action Button */}
      <div className="flex items-center gap-2 justify-between sm:justify-end shrink-0 w-full sm:w-auto">
        {/* Custom Filter Popover or Advanced Filter Button */}
        {customFilterContent ? (
          <div className="relative" ref={filterRef}>
            <Button
              variant={isFilterDropdownOpen || (activeFilterCount && activeFilterCount > 0) ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              leftIcon={<Filter className="h-3.5 w-3.5" />}
              rightIcon={
                activeFilterCount ? (
                  <span className="px-1.5 py-0.2 bg-primary-foreground text-primary font-extrabold text-[10px] rounded-full">
                    {activeFilterCount}
                  </span>
                ) : (
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                )
              }
            >
              Filter
            </Button>

            {isFilterDropdownOpen && (
              <div className="absolute right-0 top-11 z-50 bg-popover border border-border rounded-xl shadow-xl p-4 min-w-[280px] sm:min-w-[320px] space-y-3">
                {customFilterContent}
              </div>
            )}
          </div>
        ) : onOpenFilterPanel ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenFilterPanel}
            leftIcon={<Filter className="h-3.5 w-3.5 text-primary" />}
            rightIcon={
              activeFilterCount ? (
                <span className="px-1.5 py-0.2 bg-primary text-primary-foreground font-extrabold text-[10px] rounded-full">
                  {activeFilterCount}
                </span>
              ) : undefined
            }
          >
            Filter
          </Button>
        ) : (
          /* Single Select Filter Fallback */
          onFilterChange && filterOptions && filterOptions.length > 0 && (
            <div className="relative flex items-center h-9 bg-secondary/50 border border-border rounded-lg px-2.5 shrink-0 text-xs hover:border-accent-foreground/30 focus-within:border-ring transition">
              <Filter className="h-3.5 w-3.5 text-primary shrink-0 mr-1.5" />
              <select
                value={filterValue || filterOptions[0]?.value}
                onChange={(e) => onFilterChange(e.target.value)}
                className="bg-transparent text-xs text-foreground focus:text-foreground outline-none cursor-pointer appearance-none pr-5 py-1 z-10 font-semibold"
              >
                {filterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-popover text-popover-foreground">
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground pointer-events-none absolute right-2 z-0" />
            </div>
          )
        )}

        {onRefresh && (
          <Button
            variant="outline"
            size="icon-sm"
            onClick={onRefresh}
            title="Refresh Data"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', isLoading ? 'animate-spin' : '')} />
          </Button>
        )}

        {actions}

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
    </div>
  );
};
