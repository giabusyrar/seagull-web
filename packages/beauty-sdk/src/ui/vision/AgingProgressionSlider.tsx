'use client';
import React, { useState } from 'react';
import type { AgingProgressionResult } from '../../core/types';

export interface AgingProgressionSliderProps {
  agingData?: AgingProgressionResult;
  className?: string;
}

export const AgingProgressionSlider: React.FC<AgingProgressionSliderProps> = ({
  agingData,
  className = '',
}) => {
  if (!agingData) return null;

  const timelinePoints = agingData.timeline && agingData.timeline.length > 0
    ? agingData.timeline
    : [
        { targetAge: agingData.currentAge, yearsAhead: 0, withRegimen: agingData.scoreNow, withoutRegimen: agingData.scoreNow },
        { targetAge: agingData.currentAge + 10, yearsAhead: 10, withRegimen: agingData.scorePlus10WithRegimen, withoutRegimen: agingData.scorePlus10WithoutRegimen },
        { targetAge: agingData.currentAge + 20, yearsAhead: 20, withRegimen: agingData.scorePlus20WithRegimen, withoutRegimen: agingData.scorePlus20WithoutRegimen },
      ];

  const [selectedYearsAhead, setSelectedYearsAhead] = useState<number>(10);

  const activePoint = timelinePoints.find((p) => p.yearsAhead === selectedYearsAhead) || timelinePoints[1] || timelinePoints[0];

  return (
    <div className={`rounded-2xl border border-white/10 bg-neutral-950/80 p-6 backdrop-blur-xl shadow-xl ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white tracking-wide">Skin Longevity & Aging Simulation</h3>
          <p className="text-xs text-neutral-400 mt-0.5">Time-lapse progression projection with vs without clinical skincare regimen</p>
        </div>
        <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
          Bio-Age Offset: {agingData.biologicalAgeOffset > 0 ? `+${agingData.biologicalAgeOffset}` : agingData.biologicalAgeOffset} yrs
        </div>
      </div>

      {/* Timeline Toggle Buttons */}
      <div className="mt-5 flex flex-wrap gap-1.5 rounded-xl bg-white/5 p-1.5 border border-white/5">
        {timelinePoints.map((point) => {
          const isSelected = activePoint.yearsAhead === point.yearsAhead;
          const label = point.yearsAhead === 0 ? `Now (${point.targetAge}y)` : `+${point.yearsAhead}y (${point.targetAge}y)`;
          return (
            <button
              key={point.yearsAhead}
              onClick={() => setSelectedYearsAhead(point.yearsAhead)}
              className={`flex-1 min-w-[70px] rounded-lg py-2 px-1 text-center text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Projection Comparison Cards */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* With Regimen Card */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">With Targeted Regimen</span>
            <span className="text-xs text-emerald-300 font-medium">Optimal Defense</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400">{activePoint.withRegimen.toFixed(1)}</span>
            <span className="text-xs text-neutral-400">/ 100 Longevity Score</span>
          </div>
          <p className="mt-2 text-xs text-neutral-300">Preserves collagen integrity and slows cellular UV photo-damage.</p>
        </div>

        {/* Without Regimen Card */}
        <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Without Protection</span>
            <span className="text-xs text-rose-300 font-medium">Accelerated Aging</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-400">{activePoint.withoutRegimen.toFixed(1)}</span>
            <span className="text-xs text-neutral-400">/ 100 Longevity Score</span>
          </div>
          <p className="mt-2 text-xs text-neutral-300">Susceptible to solar elastosis, deep wrinkles, and moisture barrier erosion.</p>
        </div>
      </div>
    </div>
  );
};
