'use client';

import React, { useState } from 'react';
import type {
  NormalizedPoint,
  ZoneDiagnosticMetric,
  LayerHUDState,
  ImageAngle,
} from './types';
import { CanvasHUDToolbar } from './CanvasHUDToolbar';

interface CanvasVisualizerProps {
  imageSrc: string | null;
  zones: ZoneDiagnosticMetric[];
  selectedZoneCode: string | null;
  onSelectZone: (zoneCode: string) => void;
  layerState: LayerHUDState;
  onToggleLayer: (key: keyof LayerHUDState) => void;
  activeAngle: ImageAngle;
  className?: string;
}

// Scores are health-oriented (100 = optimal), so a zone is judged by its lowest score.
function zoneSeverity(zone: ZoneDiagnosticMetric): 'optimal' | 'moderate_issue' | 'severe_issue' {
  const scores = [
    ...Object.values(zone.metrics.dimensions),
    ...Object.values(zone.metrics.skinConditions),
  ].map((m) => m.score);
  if (scores.length === 0) return 'optimal';
  const worst = Math.min(...scores);
  if (worst <= 35) return 'severe_issue';
  if (worst <= 65) return 'moderate_issue';
  return 'optimal';
}

export function CanvasVisualizer({
  imageSrc,
  zones,
  selectedZoneCode,
  onSelectZone,
  layerState,
  onToggleLayer,
  activeAngle,
  className = '',
}: CanvasVisualizerProps) {
  const [hoveredZoneCode, setHoveredZoneCode] = useState<string | null>(null);

  if (!imageSrc) {
    return (
      <div
        className={`aspect-square w-full rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900/50 flex flex-col items-center justify-center p-6 text-center ${className}`}
      >
        <div className="h-12 w-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
          📷
        </div>
        <p className="mt-3 text-xs font-semibold text-slate-300">No Image Uploaded</p>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Select or upload an angle ({activeAngle}) to view the interactive spatial canvas.
        </p>
      </div>
    );
  }

  // Convert NormalizedPoint[] (0.0 to 1.0) to SVG polygon points string
  const getPointsString = (polygon: NormalizedPoint[]): string => {
    if (!polygon || polygon.length === 0) return '';
    return polygon.map((pt) => `${pt.x * 1000},${pt.y * 1000}`).join(' ');
  };

  const hoveredZone = zones.find((z) => z.zoneCode === hoveredZoneCode);

  return (
    <div
      className={`relative w-full aspect-square rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl select-none group ${className}`}
    >
      {/* 1. Base Image Layer */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        alt={`Facial view ${activeAngle}`}
        className="w-full h-full object-cover object-center"
      />

      {/* 2. SVG Vector Overlays */}
      <svg
        viewBox="0 0 1000 1000"
        className="absolute inset-0 w-full h-full pointer-events-auto"
        preserveAspectRatio="none"
      >
        {/* Render Detected Facial Zones */}
        {layerState.showZones &&
          zones.map((zone) => {
            const isSelected = selectedZoneCode === zone.zoneCode;
            const isHovered = hoveredZoneCode === zone.zoneCode;
            const pointsStr = getPointsString(zone.polygon);
            if (!pointsStr) return null;

            const severity = zoneSeverity(zone);

            // Determine Fill & Stroke Styles
            let fillColor = 'rgba(16, 185, 129, 0.25)'; // Optimal green
            let strokeColor = '#10b981';
            let strokeDash = 'none';

            if (zone.isOccluded) {
              fillColor = 'rgba(100, 116, 139, 0.2)';
              strokeColor = '#64748b';
              strokeDash = '6,5';
            } else if (severity === 'moderate_issue') {
              fillColor = 'rgba(245, 158, 11, 0.25)'; // Amber
              strokeColor = '#f59e0b';
            } else if (severity === 'severe_issue') {
              fillColor = 'rgba(239, 68, 68, 0.35)'; // Red
              strokeColor = '#ef4444';
            }

            return (
              <g key={zone.zoneCode}>
                <polygon
                  points={pointsStr}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={isSelected || isHovered ? 5 : 2}
                  strokeDasharray={strokeDash}
                  className="transition-all duration-200 cursor-pointer"
                  onClick={() => onSelectZone(zone.zoneCode)}
                  onMouseEnter={() => setHoveredZoneCode(zone.zoneCode)}
                  onMouseLeave={() => setHoveredZoneCode(null)}
                />

                {zone.isOccluded && zone.polygon[0] && (
                  <text
                    x={zone.polygon[0].x * 1000 + 10}
                    y={zone.polygon[0].y * 1000 + 20}
                    fill="#94a3b8"
                    fontSize="18"
                    fontWeight="bold"
                    className="pointer-events-none drop-shadow-md select-none"
                  >
                    Occluded
                  </text>
                )}
              </g>
            );
          })}

        {/* Defect Heatmap Points */}
        {layerState.showDefectHeatmap &&
          zones
            .filter((z) => !z.isOccluded && zoneSeverity(z) !== 'optimal')
            .map((zone) => {
              if (!zone.polygon || zone.polygon.length === 0) return null;
              const avgX = (zone.polygon.reduce((acc, p) => acc + p.x, 0) / zone.polygon.length) * 1000;
              const avgY = (zone.polygon.reduce((acc, p) => acc + p.y, 0) / zone.polygon.length) * 1000;

              return (
                <g key={`defect-${zone.zoneCode}`} className="pointer-events-none">
                  <circle
                    cx={avgX}
                    cy={avgY}
                    r="12"
                    fill="#ef4444"
                    fillOpacity="0.7"
                    className="animate-ping"
                  />
                  <circle
                    cx={avgX}
                    cy={avgY}
                    r="6"
                    fill="#ef4444"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                </g>
              );
            })}
      </svg>

      {/* 3. Top Floating Layer Toolbar */}
      <div className="absolute top-3 left-3 z-10">
        <CanvasHUDToolbar
          layerState={layerState}
          onToggleLayer={onToggleLayer}
        />
      </div>

      {/* 4. Zone Hover Tooltip */}
      {hoveredZone && (
        <div className="absolute bottom-3 left-3 z-10 bg-slate-950/90 backdrop-blur-md border border-slate-700 text-white p-2.5 rounded-xl shadow-2xl pointer-events-none text-xs flex flex-col gap-1 max-w-[260px]">
          <div className="flex items-center justify-between gap-3">
            <span className="font-bold text-amber-400">{hoveredZone.zoneName}</span>
            <span className="font-mono text-[10px] text-slate-400">{hoveredZone.zoneCode}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-300">
            <span>Confidence:</span>
            <span className="font-bold text-cyan-300 font-mono">
              {Math.round(hoveredZone.confidence * 100)}%
            </span>
            {hoveredZone.isOccluded && (
              <span className="bg-slate-500/20 text-slate-300 border border-slate-500/30 text-[9px] px-1 rounded">
                Occluded
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
