import React from 'react';

export interface DimensionOption {
  value: string;
  label: string;
  description?: string;
}

export interface DimensionSelectorProps {
  dimension: string;
  label?: string;
  options: (string | DimensionOption)[];
  value?: string | string[];
  mode?: 'single' | 'multi';
  onChange?: (val: string | string[]) => void;
  className?: string;
}

export const DimensionSelector: React.FC<DimensionSelectorProps> = ({
  dimension,
  label,
  options,
  value,
  mode = 'single',
  onChange,
  className = '',
}) => {
  const normalizedOptions: DimensionOption[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedValues: string[] = Array.isArray(value)
    ? value
    : typeof value === 'string' && value
    ? [value]
    : [];

  const handleSelect = (optVal: string) => {
    if (!onChange) return;
    if (mode === 'single') {
      onChange(optVal);
    } else {
      if (selectedValues.includes(optVal)) {
        onChange(selectedValues.filter((v) => v !== optVal));
      } else {
        onChange([...selectedValues, optVal]);
      }
    }
  };

  return (
    <div className={`dimension-selector space-y-3 ${className}`} data-dimension={dimension}>
      {label && <label className="block text-sm font-semibold text-gray-800">{label}</label>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {normalizedOptions.map((opt) => {
          const isSelected = selectedValues.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt.value)}
              className={`p-3 text-left rounded-xl border transition-all flex flex-col justify-center ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 font-medium'
                  : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
              }`}
            >
              <span className="text-sm">{opt.label}</span>
              {opt.description && (
                <span className="text-xs text-gray-500 mt-0.5">{opt.description}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
