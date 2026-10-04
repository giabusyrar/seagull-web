'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { SearchableSelect, type SelectOption } from '../SearchableSelect';
import { extractReferenceList } from './extractReferenceList';
import { NO_REFERENCE_SOURCE_PLACEHOLDER, useReferenceDataSource } from './ReferenceDataProvider';

export interface DimensionSelectProps {
  value: string;
  onChange: (dimensionKey: string, dimension?: { code: string; name: string }) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const DimensionSelect: React.FC<DimensionSelectProps> = ({
  value,
  onChange,
  label = 'Target Dimension',
  placeholder = 'Select Dimension...',
  disabled = false,
  className = '',
}) => {
  const [dimensions, setDimensions] = useState<Array<{ code: string; name: string; category?: string }>>([
    { code: 'sebum', name: 'Sebum Secretion' },
    { code: 'sensitivity', name: 'Epidermal Reactivity' },
    { code: 'pigmentation', name: 'Melanogenesis & Spots' },
    { code: 'aging', name: 'Elasticity & Wrinkles' },
    { code: 'barrier', name: 'Moisture Barrier' },
    { code: 'hydration', name: 'Skin Hydration' },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const source = useReferenceDataSource();

  useEffect(() => {
    if (!source) return;
    setIsLoading(true);
    source
      .dimensions()
      .then((data) => {
        const list = extractReferenceList(data, 'dimensions');
        if (list.length > 0) {
          setDimensions(list.map((d: any) => ({ code: d.code, name: d.name || d.code, category: d.category })));
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [source]);

  const options: SelectOption[] = useMemo(() => {
    // If the currently saved value isn't in the fetched catalog (e.g. its
    // entry was later removed), still surface it as its raw code instead of
    // silently falling back to the empty placeholder — the saved config is
    // still intact, it just no longer has a friendly label to show.
    const known = dimensions.some((d) => d.code === value);
    const options = dimensions.map((d) => ({
      value: d.code,
      label: `${d.name} (${d.code})`,
      description: d.category || `Dimension key: ${d.code}`,
    }));
    if (value && !known) {
      options.push({ value, label: value, description: 'Not in the current dimension catalog' });
    }
    return options;
  }, [dimensions, value]);

  const handleChange = (dimKey: string) => {
    const matched = dimensions.find((d) => d.code === dimKey);
    onChange(dimKey, matched);
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
          {label}
        </label>
      )}
      <SearchableSelect
        options={options}
        value={value}
        onChange={handleChange}
        disabled={disabled || isLoading}
        placeholder={!source ? NO_REFERENCE_SOURCE_PLACEHOLDER : isLoading ? 'Loading dimensions...' : placeholder}
        searchPlaceholder="Search dimensions..."
      />
    </div>
  );
};
