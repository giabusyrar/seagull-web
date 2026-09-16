'use client';

import React, { useState } from 'react';
import { Sparkles, Layers, BarChart3 } from 'lucide-react';
import type { VisionAnalysisResult } from './types';
import { ExecutiveSummaryTab } from './ExecutiveSummaryTab';
import { ZoneDeepDiveTab } from './ZoneDeepDiveTab';
import { DimensionAnalysisTab } from './DimensionAnalysisTab';

interface OutputDashboardProps {
  result: VisionAnalysisResult | null;
  labelFor: (code: string) => string;
  selectedZoneCode: string | null;
  onSelectZone: (zoneCode: string) => void;
  className?: string;
}

type OutputTab = 'summary' | 'zones' | 'dimensions';

export function OutputDashboard({
  result,
  labelFor,
  selectedZoneCode,
  onSelectZone,
  className = '',
}: OutputDashboardProps) {
  const [activeTab, setActiveTab] = useState<OutputTab>('summary');

  if (!result) {
    return (
      <div
        className={`p-10 rounded-2xl border border-dashed border-border bg-card/40 flex flex-col items-center justify-center text-center ${className}`}
      >
        <Sparkles className="h-8 w-8 text-muted-foreground/60 mb-2" />
        <h4 className="text-xs font-bold text-foreground">Awaiting Execution</h4>
        <p className="text-[11px] text-muted-foreground mt-1 max-w-xs">
          Upload facial captures in the input tray and click &quot;Run Multi-Angle Pipeline&quot; to inspect clinical diagnostic analytics.
        </p>
      </div>
    );
  }

  const scoredCount =
    Object.keys(result.globalAggregation.dimensions).length +
    Object.keys(result.globalAggregation.skinConditions).length;

  const tabs: { id: OutputTab; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    { id: 'summary', label: 'Summary', icon: <Sparkles className="h-3.5 w-3.5" /> },
    { id: 'zones', label: 'Zones', icon: <Layers className="h-3.5 w-3.5" />, badge: result.zoneBreakdown.length },
    {
      id: 'dimensions',
      label: 'Dimensions & Conditions',
      icon: <BarChart3 className="h-3.5 w-3.5" />,
      badge: scoredCount,
    },
  ];

  return (
    <div className={`flex flex-col gap-4 p-4 rounded-2xl bg-card border border-border shadow-xs ${className}`}>
      {/* Tab Navigation Header */}
      <div className="flex border-b border-border gap-1 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="bg-slate-200 dark:bg-slate-800 text-foreground text-[9px] font-mono px-1.5 py-0.2 rounded-full ml-0.5">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Tab Content */}
      <div className="flex-1">
        {activeTab === 'summary' && <ExecutiveSummaryTab result={result} />}
        {activeTab === 'zones' && (
          <ZoneDeepDiveTab
            zones={result.zoneBreakdown}
            selectedZoneCode={selectedZoneCode}
            onSelectZone={onSelectZone}
          />
        )}
        {activeTab === 'dimensions' && <DimensionAnalysisTab result={result} labelFor={labelFor} />}
      </div>
    </div>
  );
}
