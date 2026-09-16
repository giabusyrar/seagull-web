'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';
import { cn } from '../utils';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

export interface SearchableSelectBaseProps {
  options: SelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  inline?: boolean;
}

export interface SingleSearchableSelectProps extends SearchableSelectBaseProps {
  multiple?: false;
  value?: string;
  onChange: (value: string) => void;
}

export interface MultiSearchableSelectProps extends SearchableSelectBaseProps {
  multiple: true;
  value?: string[];
  onChange: (value: string[]) => void;
}

export type SearchableSelectProps = SingleSearchableSelectProps | MultiSearchableSelectProps;

export const SearchableSelect: React.FC<SearchableSelectProps> = (props) => {
  const {
    options = [],
    placeholder = 'Select option...',
    searchPlaceholder = 'Search options...',
    disabled = false,
    className = '',
    inline = false,
  } = props;

  const isMultiple = props.multiple === true;
  const singleValue = !isMultiple ? (props.value as string) || '' : '';
  const multiValue = isMultiple ? (Array.isArray(props.value) ? props.value : []) : [];

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOptions = options.filter((opt) =>
    isMultiple ? multiValue.includes(opt.value) : opt.value === singleValue
  );

  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      opt.value.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      (opt.description && opt.description.toLowerCase().includes(searchQuery.toLowerCase().trim()))
  );

  useEffect(() => {
    if (inline) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isOpen && event.key === 'Escape') {
        event.stopPropagation();
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [inline, isOpen]);

  const handleSelect = (optionValue: string) => {
    if (!isMultiple) {
      (props as SingleSearchableSelectProps).onChange(optionValue);
      setIsOpen(false);
      setSearchQuery('');
    } else {
      const multiProps = props as MultiSearchableSelectProps;
      const currentVals = Array.isArray(multiProps.value) ? multiProps.value : [];
      if (currentVals.includes(optionValue)) {
        multiProps.onChange(currentVals.filter((v) => v !== optionValue));
      } else {
        multiProps.onChange([...currentVals, optionValue]);
      }
    }
  };

  const handleRemovePill = (e: React.MouseEvent, optionValue: string) => {
    e.stopPropagation();
    if (isMultiple) {
      const multiProps = props as MultiSearchableSelectProps;
      const currentVals = Array.isArray(multiProps.value) ? multiProps.value : [];
      multiProps.onChange(currentVals.filter((v) => v !== optionValue));
    }
  };

  const handleSelectAll = () => {
    if (isMultiple) {
      const multiProps = props as MultiSearchableSelectProps;
      multiProps.onChange(options.map((opt) => opt.value));
    }
  };

  const handleClearAll = () => {
    if (isMultiple) {
      (props as MultiSearchableSelectProps).onChange([]);
    } else {
      (props as SingleSearchableSelectProps).onChange('');
    }
  };

  const renderListContent = () => (
    <div className="flex flex-col w-full text-xs">
      {/* Search Bar Header */}
      <div className="p-2 border-b border-border relative flex items-center justify-between gap-2 bg-muted/40">
        <div className="relative flex-1 flex items-center">
          <Search
            style={{ left: '0.625rem' }}
            className="h-3.5 w-3.5 text-muted-foreground absolute top-1/2 -translate-y-1/2 pointer-events-none z-10 shrink-0"
          />
          <input
            type="text"
            autoFocus={!inline && isOpen}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
            style={{ paddingLeft: '2rem', paddingRight: searchQuery ? '1.75rem' : '0.5rem' }}
            className="w-full h-8 bg-secondary/50 text-xs text-foreground placeholder:text-muted-foreground rounded-md border border-border focus:border-ring outline-none pl-8 pr-7 transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{ right: '0.5rem' }}
              className="absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {isMultiple && options.length > 0 && (
          <div className="flex items-center gap-1 text-[11px] shrink-0">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-primary hover:underline px-1 py-0.5 rounded cursor-pointer font-medium"
            >
              All
            </button>
            <span className="text-muted-foreground/40">|</span>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-muted-foreground hover:text-destructive px-1 py-0.5 rounded cursor-pointer"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      {/* Options List */}
      <div className="overflow-y-auto p-1.5 space-y-0.5 max-h-60">
        {filteredOptions.length === 0 ? (
          <div className="px-3 py-3 text-center text-xs text-muted-foreground italic">No options matching search</div>
        ) : (
          filteredOptions.map((opt) => {
            const isSelected = isMultiple ? multiValue.includes(opt.value) : singleValue === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={cn(
                  'w-full text-left px-2.5 py-1.5 rounded-md flex items-center justify-between gap-2 transition cursor-pointer text-xs',
                  isSelected
                    ? isMultiple
                      ? 'bg-beak/10 text-primary font-medium border border-beak/30'
                      : 'bg-beak/15 text-primary font-semibold'
                    : 'hover:bg-accent text-foreground'
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {isMultiple && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="accent-[#d97706] rounded h-3.5 w-3.5 shrink-0 pointer-events-none"
                    />
                  )}
                  <div className="truncate">
                    <div className="truncate font-medium">{opt.label}</div>
                    {opt.description && <div className="text-[10px] text-muted-foreground truncate">{opt.description}</div>}
                  </div>
                </div>
                {!isMultiple && isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
              </button>
            );
          })
        )}
      </div>

      {isMultiple && (
        <div className="px-2.5 py-1.5 border-t border-border bg-muted/20 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            {multiValue.length} of {options.length} selected
          </span>
          {multiValue.length > 0 && (
            <button type="button" onClick={handleClearAll} className="text-destructive hover:underline cursor-pointer">
              Clear selected
            </button>
          )}
        </div>
      )}
    </div>
  );

  if (inline) {
    return (
      <div className={cn('bg-card border border-border rounded-xl overflow-hidden', className)}>
        {renderListContent()}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn('relative inline-block w-full text-xs select-none', isOpen ? 'z-50' : 'z-10', className)}>
      {/* Trigger Button */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          'w-full min-h-[38px] bg-secondary/50 hover:bg-accent/40 border border-border rounded-lg px-3 py-1.5 flex items-center justify-between gap-2 text-foreground outline-none transition cursor-pointer',
          isOpen ? 'border-ring ring-1 ring-ring/30' : '',
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        )}
      >
        <div className="flex-1 flex flex-wrap items-center gap-1.5 min-w-0 max-h-20 overflow-y-auto py-0.5">
          {!isMultiple ? (
            <span className="truncate text-left font-normal text-xs">
              {selectedOptions[0] ? selectedOptions[0].label : <span className="text-muted-foreground">{placeholder}</span>}
            </span>
          ) : multiValue.length === 0 ? (
            <span className="text-muted-foreground text-xs font-normal">{placeholder}</span>
          ) : (
            selectedOptions.map((opt) => (
              <span
                key={opt.value}
                className="inline-flex items-center gap-1 bg-beak/15 border border-beak/30 text-primary font-medium text-[11px] px-2 py-0.5 rounded-md"
              >
                <span className="truncate max-w-[120px]">{opt.label}</span>
                <X
                  onClick={(e) => handleRemovePill(e, opt.value)}
                  className="h-3 w-3 hover:text-foreground transition shrink-0 cursor-pointer"
                />
              </span>
            ))
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 self-center">
          {((!isMultiple && singleValue && singleValue !== 'all') || (isMultiple && multiValue.length > 0)) && (
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClearAll();
              }}
              className="p-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded transition cursor-pointer flex items-center justify-center"
              title="Clear"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
          <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform duration-150', isOpen ? 'rotate-180 text-primary' : '')} />
        </div>
      </div>

      {/* Dropdown Menu Popup */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-popover border border-border rounded-xl shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {renderListContent()}
        </div>
      )}
    </div>
  );
};
