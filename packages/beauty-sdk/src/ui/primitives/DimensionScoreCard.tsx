import React from 'react';

export interface DimensionScoreCardProps {
  dimension: string;
  title?: string;
  score: number;
  gradeName?: string;
  severity?: 'mild' | 'moderate' | 'severe' | string;
  variant?: 'gauge' | 'spectrum-bar';
  className?: string;
}

export const DimensionScoreCard: React.FC<DimensionScoreCardProps> = ({
  dimension,
  title,
  score,
  gradeName,
  severity = 'moderate',
  variant = 'spectrum-bar',
  className = '',
}) => {
  const displayTitle = title || dimension.replace(/_/g, ' ');
  const normalizedScore = Math.min(100, Math.max(0, Math.round(score)));

  const getSeverityBadge = () => {
    switch (severity.toLowerCase()) {
      case 'mild':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'severe':
      case 'critical':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div
      className={`dimension-score-card p-4 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-3 ${className}`}
      data-dimension={dimension}
    >
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-800 text-sm">{displayTitle}</h4>
        {gradeName && (
          <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${getSeverityBadge()}`}>
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
            className={`h-full transition-all duration-500 rounded-full ${
              normalizedScore > 70
                ? 'bg-rose-500'
                : normalizedScore >= 35
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${normalizedScore}%` }}
          />
        </div>
      )}
    </div>
  );
};
