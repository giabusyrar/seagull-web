'use client';

import React from 'react';
import { Layers, Target } from 'lucide-react';
import type { LayerHUDState } from './types';

interface CanvasHUDToolbarProps {
  layerState: LayerHUDState;
  onToggleLayer: (key: keyof LayerHUDState) => void;
  className?: string;
}

export function CanvasHUDToolbar({
  layerState,
  onToggleLayer,
  className = '',
}: CanvasHUDToolbarProps) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 shadow-2xl ${className}`}
    >
      {/* 8-Zone Polygons */}
      <button
        type="button"
        onClick={() => onToggleLayer('showZones')}
        title="Toggle 8-Zone Anatomical Polygons"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
          layerState.showZones
            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
            : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
        }`}
      >
        <Layers className="h-3.5 w-3.5" />
        <span>8 Zones</span>
      </button>

      {/* Defect Heatmap */}
      <button
        type="button"
        onClick={() => onToggleLayer('showDefectHeatmap')}
        title="Toggle Clinical Defect Heatmap"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
          layerState.showDefectHeatmap
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
            : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
        }`}
      >
        <Target className="h-3.5 w-3.5" />
        <span>Defect Heatmap</span>
      </button>
    </div>
  );
}
