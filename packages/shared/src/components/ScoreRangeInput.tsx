import React from 'react';

export interface ScoreRangeInputProps {
  minScore: number;
  maxScore: number;
  minLimit?: number;
  maxLimit?: number;
  onChange: (min: number, max: number) => void;
  disabled?: boolean;
  className?: string;
}

export const ScoreRangeInput: React.FC<ScoreRangeInputProps> = ({
  minScore,
  maxScore,
  minLimit = 0,
  maxLimit = 100,
  onChange,
  disabled = false,
  className = '',
}) => {
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    const clamped = isNaN(val) ? minLimit : Math.max(minLimit, Math.min(maxLimit, val));
    onChange(clamped, Math.max(clamped, maxScore));
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    const clamped = isNaN(val) ? maxLimit : Math.max(minLimit, Math.min(maxLimit, val));
    onChange(Math.min(clamped, minScore), clamped);
  };

  return (
    <div className={`inline-flex items-center gap-1.5 font-mono ${className}`}>
      <input
        type="number"
        min={minLimit}
        max={maxLimit}
        disabled={disabled}
        value={minScore}
        onChange={handleMinChange}
        className="w-14 px-2 py-1 bg-muted/40 border border-border rounded text-sky-800 text-xs font-semibold text-center focus:outline-none focus:border-ring disabled:opacity-50"
      />
      <span className="text-muted-foreground text-xs select-none">to</span>
      <input
        type="number"
        min={minLimit}
        max={maxLimit}
        disabled={disabled}
        value={maxScore}
        onChange={handleMaxChange}
        className="w-14 px-2 py-1 bg-muted/40 border border-border rounded text-sky-800 text-xs font-semibold text-center focus:outline-none focus:border-ring disabled:opacity-50"
      />
    </div>
  );
};
