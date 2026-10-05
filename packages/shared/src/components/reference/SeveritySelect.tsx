'use client';

import React from 'react';
import { CORE_DEFAULT_SEVERITY_BANDS } from './core-default-bands';

export interface SeveritySelectProps {
  value: string;
  onChange: (severity: string) => void;
  /** The severity labels to choose from — normally the severity_bands of the
   *  ruleset being edited, lowest band first. Omitted: core's default bands
   *  (CORE_DEFAULT_SEVERITY_LABELS), which apply to a ruleset that sets none. */
  options?: string[];
  /** When set, an empty value is offered as its own choice with this label
   *  (e.g. "Any level"), instead of the select silently showing the first
   *  option for a value that is not set. */
  emptyLabel?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

// Severity Level is the clinical 5-level scale (Scoring Method doc), health-
// oriented: higher score = healthier. Plain native <select> — no search, no
// colour glyphs.
//
// Omitted options: the labels of core's default severity bands (one mirror,
// core-default-bands.ts), which apply when a ruleset carries no
// severity_bands. A ruleset that sets its own is the authority: pass them.
const CORE_DEFAULT_SEVERITY_LABELS = CORE_DEFAULT_SEVERITY_BANDS.map((b) => b.label);

export const SeveritySelect: React.FC<SeveritySelectProps> = ({
  value,
  onChange,
  options = CORE_DEFAULT_SEVERITY_LABELS,
  emptyLabel,
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
        {emptyLabel !== undefined && (
          <option value="" className="bg-card text-foreground">
            {emptyLabel}
          </option>
        )}
        {value && !options.includes(value) && (
          <option value={value} className="bg-card text-foreground">
            {value} (not a listed severity level)
          </option>
        )}
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-card text-foreground">
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
};
