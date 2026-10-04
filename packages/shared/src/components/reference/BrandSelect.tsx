'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { SearchableSelect, type SelectOption } from '../SearchableSelect';
import { extractReferenceList } from './extractReferenceList';
import { NO_REFERENCE_SOURCE_PLACEHOLDER, useReferenceDataSource } from './ReferenceDataProvider';

export interface BrandSelectProps {
  value: string;
  onChange: (brandId: string) => void;
  includeUniversal?: boolean;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const BrandSelect: React.FC<BrandSelectProps> = ({
  value,
  onChange,
  includeUniversal = true,
  label = 'Brand Scope',
  placeholder = 'Select Brand...',
  disabled = false,
  className = '',
}) => {
  const [brands, setBrands] = useState<Array<{ code: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const source = useReferenceDataSource();

  useEffect(() => {
    if (!source) return;
    setIsLoading(true);
    source
      .brands()
      .then((data) => {
        const list = extractReferenceList(data, 'brands');
        if (list.length > 0) {
          setBrands(list.map((b: any) => ({ code: b.code || b.id, name: b.name || b.code })));
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [source]);

  const options: SelectOption[] = useMemo(() => {
    const list: SelectOption[] = [];
    if (includeUniversal) {
      list.push({ value: '*', label: '* (Universal / All Brands)', description: 'Universal fallback for all brand tenants' });
    }
    brands.forEach((b) => {
      list.push({
        value: b.code,
        label: `${b.name} (${b.code})`,
        description: `Brand tenant: ${b.code}`,
      });
    });
    return list;
  }, [brands, includeUniversal]);

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <SearchableSelect
        options={options}
        value={value}
        onChange={onChange}
        disabled={disabled || isLoading}
        placeholder={!source ? NO_REFERENCE_SOURCE_PLACEHOLDER : isLoading ? 'Loading brands...' : placeholder}
        searchPlaceholder="Search brands..."
      />
    </div>
  );
};
