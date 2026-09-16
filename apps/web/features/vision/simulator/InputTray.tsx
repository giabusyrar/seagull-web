'use client';

import React, { useMemo } from 'react';
import { Play, Sliders } from 'lucide-react';
import { ChipMultiSelect, InfoTooltip } from '@gateway-experience/shared';
import type { AngleSlot, ImageAngle } from './types';
import { AngleSlotCard } from './AngleSlotCard';
import {
  toDimensionChipOptions,
  toSkinConditionChipGroups,
  type RegistryDimension,
  type RegistrySkinCondition,
} from '../useVisionRegistry';

interface InputTrayProps {
  slots: Record<ImageAngle, AngleSlot>;
  activeAngle: ImageAngle;
  onSelectAngle: (angle: ImageAngle) => void;
  onUploadFile: (angle: ImageAngle, file: File) => void;
  onClearSlot: (angle: ImageAngle) => void;
  registryDimensions: RegistryDimension[];
  registrySkinConditions: RegistrySkinCondition[];
  isRegistryLoading: boolean;
  registryError: string | null;
  selectedDimensions: string[];
  onToggleDimension: (code: string) => void;
  selectedSkinConditions: string[];
  onToggleSkinCondition: (code: string) => void;
  userAge: number;
  onUserAgeChange: (age: number) => void;
  onRunPipeline: () => void;
  isAnalyzing: boolean;
  className?: string;
}

export function InputTray({
  slots,
  activeAngle,
  onSelectAngle,
  onUploadFile,
  onClearSlot,
  registryDimensions,
  registrySkinConditions,
  isRegistryLoading,
  registryError,
  selectedDimensions,
  onToggleDimension,
  selectedSkinConditions,
  onToggleSkinCondition,
  userAge,
  onUserAgeChange,
  onRunPipeline,
  isAnalyzing,
  className = '',
}: InputTrayProps) {
  const hasUploadedImages = Object.values(slots).some((s) => s.file !== null);
  const hasSelection = selectedDimensions.length > 0 || selectedSkinConditions.length > 0;
  const dimensionOptions = useMemo(() => toDimensionChipOptions(registryDimensions), [registryDimensions]);
  const skinConditionGroups = useMemo(
    () => toSkinConditionChipGroups(registryDimensions, registrySkinConditions),
    [registryDimensions, registrySkinConditions]
  );

  return (
    <div className={`flex flex-col gap-5 p-4 rounded-2xl bg-card border border-border shadow-xs ${className}`}>
      {/* 1. Multi-Angle Upload Slots */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            1. Multi-Angle Facial Captures
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">1 to 3 Images</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {(['FRONT', 'LEFT', 'RIGHT'] as ImageAngle[]).map((angle) => (
            <AngleSlotCard
              key={angle}
              slot={slots[angle]}
              isActive={activeAngle === angle}
              onSelectSlot={onSelectAngle}
              onUploadFile={onUploadFile}
              onClearSlot={onClearSlot}
            />
          ))}
        </div>
      </div>

      {/* 2. Selective Model Orchestration: Dimensions AND/OR Skin Conditions */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            2. Selective Model Dispatch
          </span>
          <InfoTooltip
            content="Dispatch models for the selected dimensions and/or skin conditions. Leave everything unselected to analyze all of them."
            label="About Selective Model Dispatch"
          />
        </div>

        {isRegistryLoading ? (
          <p className="text-[11px] text-muted-foreground">Loading dimensions &amp; skin conditions from Reference Data...</p>
        ) : registryError ? (
          <p className="text-[11px] text-red-500">{registryError}</p>
        ) : (
          <>
            <ChipMultiSelect
              label="Dimensions"
              tone="amber"
              options={dimensionOptions}
              value={selectedDimensions}
              onChange={(_, toggled) => onToggleDimension(toggled)}
              emptyMessage="No dimensions with vision capabilities in Reference Data."
            />

            <ChipMultiSelect
              label="Skin Conditions"
              tone="indigo"
              className="pt-1"
              groups={skinConditionGroups}
              value={selectedSkinConditions}
              onChange={(_, toggled) => onToggleSkinCondition(toggled)}
              listClassName="max-h-64 overflow-y-auto p-0.5"
              emptyMessage="No skin conditions with vision capabilities in Reference Data."
            />
          </>
        )}

        {!hasSelection && !isRegistryLoading && !registryError && (
          <p className="text-[10px] text-amber-600 dark:text-amber-400">
            Nothing selected — every dimension and skin condition listed above will be analyzed.
          </p>
        )}
      </div>

      {/* 3. Demographics & Context */}
      <div className="flex flex-col gap-2.5">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          3. Simulation Context
        </span>

        <div className="flex flex-col gap-1 p-2.5 rounded-xl border border-border bg-slate-50/50 dark:bg-slate-900/30">
          <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
            <Sliders className="h-3 w-3" /> Age (Years)
          </span>
          <input
            type="number"
            min={15}
            max={85}
            value={userAge}
            onChange={(e) => onUserAgeChange(parseInt(e.target.value) || 25)}
            className="bg-transparent text-sm font-bold text-foreground focus:outline-none"
          />
        </div>
      </div>

      {/* 4. Run Pipeline Execution Button */}
      <button
        type="button"
        disabled={!hasUploadedImages || isAnalyzing}
        onClick={onRunPipeline}
        className={`w-full py-3 px-4 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
          !hasUploadedImages
            ? 'bg-muted text-muted-foreground border border-border cursor-not-allowed opacity-60'
            : isAnalyzing
            ? 'bg-amber-600 text-white animate-pulse'
            : 'bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-[1.01]'
        }`}
      >
        {isAnalyzing ? (
          <>
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Running Vision Engine...</span>
          </>
        ) : (
          <>
            <Play className="h-4 w-4 fill-current" />
            <span>Run Multi-Angle Pipeline</span>
          </>
        )}
      </button>
    </div>
  );
}
