'use client';

import React, { useState } from 'react';
import type { ImageAngle, AngleSlot, LayerHUDState, VisionAnalysisResult } from './types';
import { InputTray } from './InputTray';
import { CanvasVisualizer } from './CanvasVisualizer';
import { OutputDashboard } from './OutputDashboard';
import { useToast } from '@/components/ui/toast';
import { useCoreCollection } from '@/lib/hooks/use-core-collection';
import { useVisionRegistry } from '../useVisionRegistry';

interface VisionSimulatorProps {
  selectedBrand?: string;
  selectedApp?: string;
  // Default dimensions/skin conditions from the brand/application's saved
  // Vision Setting; selection starts empty (= analyze all) when omitted.
  defaultDimensions?: string[];
  defaultSkinConditions?: string[];
}

const ANGLE_FIELD_NAME: Record<ImageAngle, string> = {
  FRONT: 'image_front',
  LEFT: 'image_left',
  RIGHT: 'image_right',
};

// Turns a failed analyze response into a message the operator can act on.
function describeAnalysisError(status: number, json: any): string {
  if (status === 400) {
    const reasons = (json?.invalidParameters || [])
      .map((p: any) => `${p.field} "${p.value}": ${p.reason}`)
      .join('; ');
    return reasons || json?.message || 'Invalid analysis request';
  }
  if (status === 503) {
    return 'Reference Data is unavailable. Check that reference-service is running, then try again.';
  }
  if (status === 502) {
    return 'The vision AI worker is unavailable. Check that vision-ai-worker is running, then try again.';
  }
  return json?.message || 'Vision pipeline analysis failed';
}

export function VisionSimulator({
  selectedBrand = 'brand_wardah',
  selectedApp = 'app_uv_aging_kiosk',
  defaultDimensions,
  defaultSkinConditions,
}: VisionSimulatorProps) {
  const { toastSuccess, toastError } = useToast();
  const { getEndpoint } = useCoreCollection();
  const {
    dimensions: registryDimensions,
    skinConditions: registrySkinConditions,
    isLoading: isRegistryLoading,
    error: registryError,
    labelFor,
  } = useVisionRegistry();

  // 1. Multi-Angle Upload Slots State
  const [slots, setSlots] = useState<Record<ImageAngle, AngleSlot>>({
    FRONT: { angle: 'FRONT', file: null, previewUrl: null, status: 'empty' },
    LEFT: { angle: 'LEFT', file: null, previewUrl: null, status: 'empty' },
    RIGHT: { angle: 'RIGHT', file: null, previewUrl: null, status: 'empty' },
  });

  const [activeAngle, setActiveAngle] = useState<ImageAngle>('FRONT');

  // 2. Selective Model Dispatch State (Reference Data codes), seeded from the
  // active brand/application's saved Vision Setting.
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>(defaultDimensions || []);
  const [selectedSkinConditions, setSelectedSkinConditions] = useState<string[]>(defaultSkinConditions || []);

  // 3. Context State
  const [userAge, setUserAge] = useState(28);

  // 4. Layer HUD State
  const [layerState, setLayerState] = useState<LayerHUDState>({
    showZones: true,
    showDefectHeatmap: false,
  });

  // 5. Analysis Execution & Results State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<VisionAnalysisResult | null>(null);
  const [selectedZoneCode, setSelectedZoneCode] = useState<string | null>(null);

  // Handlers for Upload / Slots
  const handleUploadFile = (angle: ImageAngle, file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setSlots((prev) => ({
      ...prev,
      [angle]: {
        ...prev[angle],
        file,
        previewUrl,
        status: 'uploading',
      },
    }));
    setActiveAngle(angle);
  };

  const handleClearSlot = (angle: ImageAngle) => {
    setSlots((prev) => ({
      ...prev,
      [angle]: {
        angle,
        file: null,
        previewUrl: null,
        status: 'empty',
      },
    }));
  };

  const handleToggleDimension = (code: string) => {
    setSelectedDimensions((prev) => (prev.includes(code) ? prev.filter((d) => d !== code) : [...prev, code]));
  };

  const handleToggleSkinCondition = (code: string) => {
    setSelectedSkinConditions((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  };

  const handleToggleLayer = (key: keyof LayerHUDState) => {
    setLayerState((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Run the Go-level Vision Engine Orchestrator: per-zone capability dispatch
  // for the requested dimensions and/or skin conditions across all uploaded angles.
  const handleRunPipeline = async () => {
    const uploadedAngles = (Object.values(slots) as AngleSlot[]).filter((s) => s.file);
    if (uploadedAngles.length === 0) {
      toastError('No Images', 'Please upload at least one facial capture.');
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    const formData = new FormData();
    for (const slot of uploadedAngles) {
      formData.append(ANGLE_FIELD_NAME[slot.angle], slot.file as File);
    }
    formData.append('brandId', selectedBrand);
    formData.append('applicationId', selectedApp);
    formData.append('currentAge', userAge.toString());
    formData.append('dimensions', selectedDimensions.join(','));
    formData.append('skinConditions', selectedSkinConditions.join(','));

    try {
      const endpoint = getEndpoint('vision', '/analyze-image');
      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(describeAnalysisError(res.status, json));
      }

      const parsedResult = json as VisionAnalysisResult;
      setResult(parsedResult);

      setSlots((prev) => ({
        ...prev,
        ...Object.fromEntries(
          uploadedAngles.map((slot) => [slot.angle, { ...slot, status: 'analyzed' as const }])
        ),
      }));

      toastSuccess(
        'Pipeline Complete',
        `Scored ${parsedResult.executionMetrics.executedModelsCount} zone × capability pairs (${parsedResult.executionMetrics.skippedModelsCount} capabilities without a score) in ${parsedResult.executionMetrics.totalLatencyMs}ms.`
      );
    } catch (err: any) {
      toastError('Analysis Error', err.message || 'Failed to process image');
      setSlots((prev) => ({
        ...prev,
        ...Object.fromEntries(
          uploadedAngles.map((slot) => [slot.angle, { ...slot, status: 'error' as const }])
        ),
      }));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const currentPreview = slots[activeAngle]?.previewUrl || null;
  const currentZones = result?.zoneBreakdown.filter((z) => z.sourceAngle === activeAngle) || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
      {/* Column 1: Input Tray & Selective Dispatch Config (3 cols) */}
      <div className="lg:col-span-4 xl:col-span-3">
        <InputTray
          slots={slots}
          activeAngle={activeAngle}
          onSelectAngle={setActiveAngle}
          onUploadFile={handleUploadFile}
          onClearSlot={handleClearSlot}
          registryDimensions={registryDimensions}
          registrySkinConditions={registrySkinConditions}
          isRegistryLoading={isRegistryLoading}
          registryError={registryError}
          selectedDimensions={selectedDimensions}
          onToggleDimension={handleToggleDimension}
          selectedSkinConditions={selectedSkinConditions}
          onToggleSkinCondition={handleToggleSkinCondition}
          userAge={userAge}
          onUserAgeChange={setUserAge}
          onRunPipeline={handleRunPipeline}
          isAnalyzing={isAnalyzing}
        />
      </div>

      {/* Column 2: Interactive Canvas Visualizer & HUD (5 cols) */}
      <div className="lg:col-span-8 xl:col-span-5 flex flex-col gap-3">
        <CanvasVisualizer
          imageSrc={currentPreview}
          zones={currentZones}
          selectedZoneCode={selectedZoneCode}
          onSelectZone={setSelectedZoneCode}
          layerState={layerState}
          onToggleLayer={handleToggleLayer}
          activeAngle={activeAngle}
        />

        {/* Status Bar */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-card border border-border text-xs text-muted-foreground shadow-2xs">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active Perspective: <strong className="text-foreground">{activeAngle}</strong></span>
          </span>
          {result && (
            <span className="font-mono text-[11px]">
              Latency: <strong className="text-amber-600">{result.executionMetrics.totalLatencyMs}ms</strong>
            </span>
          )}
        </div>
      </div>

      {/* Column 3: Clinical Diagnostic Output Dashboard (4 cols) */}
      <div className="lg:col-span-12 xl:col-span-4">
        <OutputDashboard
          result={result}
          labelFor={labelFor}
          selectedZoneCode={selectedZoneCode}
          onSelectZone={setSelectedZoneCode}
        />
      </div>
    </div>
  );
}
