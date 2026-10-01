'use client';

import React, { useMemo } from 'react';
import { SearchableSelect, type SelectOption } from '../SearchableSelect';

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
  // A lifecycle state is not reference data: core-engine scores a ruleset only
  // when its status is ACTIVE (score/entity/ruleset.go), so the set is fixed by
  // the engine, not by a brand. reference-service dropped its statuses entity
  // on 2026-10-01 — the list below is the whole truth, and it used to be
  // silently overwritten by whatever that endpoint happened to return.
  const statuses = [
    { code: 'ACTIVE', name: 'Active' },
    { code: 'DRAFT', name: 'Draft' },
    { code: 'INACTIVE', name: 'Inactive' },
    { code: 'ARCHIVED', name: 'Archived' },
  ];


  const options: SelectOption[] = useMemo(() => {
    return statuses.map((s) => {
      const isLive = s.code === 'ACTIVE' || s.code === 'PUBLISHED';
      return {
        value: s.code,
        label: `${s.name} (${s.code})`,
        description: isLive ? 'Production live and active in assessments' : `Lifecycle state: ${s.code}`,
      };
    });
  }, []);

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
        disabled={disabled}
        placeholder={placeholder}
        searchPlaceholder="Search statuses..."
      />
    </div>
  );
};
