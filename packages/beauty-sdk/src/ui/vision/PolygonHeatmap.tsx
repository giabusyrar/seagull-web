'use client';
import React, { useState } from 'react';
import type { FacialZoneData, ZoneUvMetric } from '../../core/types';

export interface PolygonHeatmapProps {
  imageSrc: string;
  zones: FacialZoneData[];
  zoneMetrics?: Record<string, ZoneUvMetric>;
  selectedZoneCode?: string | null;
  onSelectZone?: (zoneCode: string) => void;
  className?: string;
}

export const PolygonHeatmap: React.FC<PolygonHeatmapProps> = ({
  imageSrc,
  zones,
  zoneMetrics = {},
  selectedZoneCode,
  onSelectZone,
  className = '',
}) => {
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  const getZoneColor = (zoneCode: string) => {
    const metric = zoneMetrics[zoneCode];
    if (!metric) return { stroke: '#3b82f6', fill: 'rgba(59, 130, 246, 0.25)' };

    if (metric.status === 'uncovered') {
      return { stroke: '#ef4444', fill: 'rgba(239, 68, 68, 0.4)' }; // Red: Missed
    }
    if (metric.status === 'moderate_issue') {
      return { stroke: '#f59e0b', fill: 'rgba(245, 158, 11, 0.35)' }; // Yellow: Uneven
    }
    return { stroke: '#10b981', fill: 'rgba(16, 185, 129, 0.25)' }; // Green: Optimal
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-black/60 shadow-2xl ${className}`}>
      {/* Background Image */}
      <img
        src={imageSrc}
        alt="Facial Diagnostic Overlay"
        className="w-full h-full object-cover block select-none pointer-events-none"
      />

      {/* SVG Multi-Zone Overlay */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full cursor-pointer pointer-events-auto"
      >
        {zones.map((zone) => {
          const isSelected = selectedZoneCode === zone.zoneCode;
          const isHovered = hoveredZone === zone.zoneCode;
          const colors = getZoneColor(zone.zoneCode);

          const pointsStr = zone.polygon
            .map((p) => `${(p.x * 100).toFixed(2)},${(p.y * 100).toFixed(2)}`)
            .join(' ');

          return (
            <polygon
              key={zone.zoneCode}
              points={pointsStr}
              fill={isSelected || isHovered ? colors.fill.replace('0.25', '0.55').replace('0.35', '0.65').replace('0.4', '0.7') : colors.fill}
              stroke={isSelected ? '#ffffff' : colors.stroke}
              strokeWidth={isSelected ? '0.8' : isHovered ? '0.6' : '0.4'}
              className="transition-all duration-200"
              onMouseEnter={() => setHoveredZone(zone.zoneCode)}
              onMouseLeave={() => setHoveredZone(null)}
              onClick={() => onSelectZone && onSelectZone(zone.zoneCode)}
            >
              <title>{`${zone.zoneName} (${zoneMetrics[zone.zoneCode]?.coverageScore || 0}% Coverage)`}</title>
            </polygon>
          );
        })}
      </svg>

      {/* Interactive Legend Overlay */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-xl bg-black/70 backdrop-blur-md px-3 py-1.5 border border-white/10 text-[11px] text-white">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
          <span>Optimal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm" />
          <span>Uneven</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm" />
          <span>Missed</span>
        </div>
        {selectedZoneCode && (
          <span className="font-bold text-blue-400 pl-2 border-l border-white/20">
            {zones.find((z) => z.zoneCode === selectedZoneCode)?.zoneName || selectedZoneCode}
          </span>
        )}
      </div>
    </div>
  );
};
