'use client';

import React from 'react';

export interface SeveritySelectProps {
  value: string;
  onChange: (severity: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

// Severity Level is the clinical 5-level scale (Scoring Method doc), health-
// oriented: higher score = healthier. Plain native <select> — no search, no
// colour glyphs.
const OPTIONS = ['Sangat Parah', 'Parah', 'Sedang', 'Ringan', 'Sehat'];

export const SeveritySelect: React.FC<SeveritySelectProps> = ({
  value,
  onChange,
  label,
  disabled = false,
  className = '',
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </label>
      )}
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-full rounded-md border border-border bg-muted/40 px-2 text-xs text-foreground outline-none focus:border-ring disabled:opacity-50"
      >
        {OPTIONS.map((opt) => (
          <option key={opt} value={opt} className="bg-card text-foreground">
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
};
