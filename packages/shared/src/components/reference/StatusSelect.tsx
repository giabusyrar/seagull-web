'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { SearchableSelect, type SelectOption } from '../SearchableSelect';
import { extractReferenceList } from './extractReferenceList';

export interface StatusSelectProps {
  value: string;
  onChange: (status: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const StatusSelect: React.FC<StatusSelectProps> = ({
  value,
  onChange,
  label = 'Lifecycle Status',
  placeholder = 'Select Status...',
  disabled = false,
  className = '',
}) => {
  const [statuses, setStatuses] = useState<Array<{ code: string; name: string }>>([
    { code: 'ACTIVE', name: 'Active' },
    { code: 'DRAFT', name: 'Draft' },
    { code: 'INACTIVE', name: 'Inactive' },
    { code: 'ARCHIVED', name: 'Archived' },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetch('/api/statuses')
      .then((res) => res.json())
      .then((data) => {
        const list = extractReferenceList(data, 'statuses');
        if (list.length > 0) {
          setStatuses(list.map((s: any) => ({ code: s.code, name: s.name || s.code })));
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const options: SelectOption[] = useMemo(() => {
    return statuses.map((s) => {
      const isLive = s.code === 'ACTIVE' || s.code === 'PUBLISHED';
      return {
        value: s.code,
        label: `${s.name} (${s.code})`,
        description: isLive ? 'Production live and active in assessments' : `Lifecycle state: ${s.code}`,
      };
    });
  }, [statuses]);

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
        placeholder={isLoading ? 'Loading statuses...' : placeholder}
        searchPlaceholder="Search statuses..."
      />
    </div>
  );
};
