import React from 'react';

/** How a card is coloured. `neutral` when nothing graded the score. */
export type DimensionScoreTone = 'good' | 'warning' | 'bad' | 'neutral';

export interface DimensionScoreCardProps {
  dimension: string;
  title?: string;
  score: number;
  gradeName?: string;
  /** The engine's grading of this score (its severity or tier name). Colours
   *  the badge and bar when it is one of the known names; otherwise the card
   *  stays neutral. Omitted: neutral. */
  severity?: 'optimal' | 'mild' | 'moderate' | 'severe' | 'critical' | string;
  /** Colour to use, overriding `severity` — for an integrator whose grading
   *  uses other names. The card never derives a colour from the number. */
  tone?: DimensionScoreTone;
  variant?: 'gauge' | 'spectrum-bar';
  className?: string;
}

// Core's severity words, read exactly. Identical to SEVERITY_TONES in
// @gateway-experience/shared (this package does not depend on it); keep both in step.
const SEVERITY_TONES: Record<string, DimensionScoreTone> = {
  optimal: 'good',
  mild: 'good',
  moderate: 'warning',
  severe: 'bad',
  critical: 'bad',
};

const BADGE_CLASSES: Record<DimensionScoreTone, string> = {
  good: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  warning: 'bg-amber-100 text-amber-800 border-amber-200',
  bad: 'bg-rose-100 text-rose-800 border-rose-200',
  neutral: 'bg-gray-100 text-gray-700 border-gray-200',
};

const BAR_CLASSES: Record<DimensionScoreTone, string> = {
  good: 'bg-emerald-500',
  warning: 'bg-amber-500',
  bad: 'bg-rose-500',
  neutral: 'bg-gray-400',
};

export const DimensionScoreCard: React.FC<DimensionScoreCardProps> = ({
  dimension,
  title,
  score,
  gradeName,
  severity,
  tone,
  variant = 'spectrum-bar',
  className = '',
}) => {
  const displayTitle = title || dimension.replace(/_/g, ' ');
  const normalizedScore = Math.min(100, Math.max(0, Math.round(score)));
  const resolvedTone: DimensionScoreTone =
    tone ?? (severity ? SEVERITY_TONES[severity.toLowerCase()] : undefined) ?? 'neutral';

  return (
    <div
      className={`dimension-score-card p-4 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-3 ${className}`}
      data-dimension={dimension}
      data-tone={resolvedTone}
    >
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-800 text-sm">{displayTitle}</h4>
        {gradeName && (
          <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${BADGE_CLASSES[resolvedTone]}`}>
            {gradeName}
          </span>
        )}
      </div>

      <div className="flex items-baseline justify-between">
        <span className="text-3xl font-bold tracking-tight text-gray-900">{normalizedScore}</span>
        <span className="text-xs text-gray-400 font-medium">/ 100 Index</span>
      </div>

      {variant === 'spectrum-bar' && (
        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${BAR_CLASSES[resolvedTone]}`}
            style={{ width: `${normalizedScore}%` }}
          />
        </div>
      )}
    </div>
  );
};
