'use client';

import React, { useEffect, useState } from 'react';
import { loadBlob, readPersisted, saveBlob, usePersistentState, writePersisted } from '@gateway-experience/shared';
import type { ImageAngle, AngleSlot, LayerHUDState, VisionAnalysisResult } from './types';
import { InputTray } from './InputTray';
import { CanvasVisualizer } from './CanvasVisualizer';
import { OutputDashboard } from './OutputDashboard';
import { useToast } from '@/components/ui/toast';
import { useCoreCollection } from '@/lib/hooks/use-core-collection';
import { useVisionRegistry } from '../useVisionRegistry';
import { analyzeImages } from '../api';

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

  // The last experiment — photos, selections, result — survives a reload,
  // scoped to this brand/application (this component is keyed by both).
  // Photos are files, so they go to IndexedDB; the rest to localStorage.
  const persistKey = (name: string) => `xg.visionEngine.simulator.${selectedBrand}::${selectedApp}.${name}`;

  // 1. Multi-Angle Upload Slots State
  const [slots, setSlots] = useState<Record<ImageAngle, AngleSlot>>({
    FRONT: { angle: 'FRONT', file: null, previewUrl: null, status: 'empty' },
    LEFT: { angle: 'LEFT', file: null, previewUrl: null, status: 'empty' },
    RIGHT: { angle: 'RIGHT', file: null, previewUrl: null, status: 'empty' },
  });
  type SlotStatuses = Partial<Record<ImageAngle, AngleSlot['status']>>;
  const statusesKey = persistKey('slotStatuses');

  // Restore saved photos once. A slot the operator already filled in the
  // meantime is left alone.
  useEffect(() => {
    let cancelled = false;
    const savedStatuses = readPersisted<SlotStatuses>(statusesKey) ?? {};
    (Object.keys(ANGLE_FIELD_NAME) as ImageAngle[]).forEach(async (angle) => {
      const file = await loadBlob<File>(persistKey(`photo.${angle}`));
      if (cancelled || !file) return;
      setSlots((prev) =>
        prev[angle].file
          ? prev
          : {
              ...prev,
              [angle]: { angle, file, previewUrl: URL.createObjectURL(file), status: savedStatuses[angle] ?? 'uploading' },
            },
      );
    });
    return () => {
      cancelled = true;
    };
    // Runs once on mount: the scope never changes for a mounted instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the saved statuses in step with the slots.
  useEffect(() => {
    const next: SlotStatuses = {};
    for (const slot of Object.values(slots) as AngleSlot[]) if (slot.file) next[slot.angle] = slot.status;
    // Only once a photo is actually present — before the restore above
    // lands, the empty slots would otherwise erase the saved statuses.
    // (Clearing a slot removes its entry in handleClearSlot.)
    if (Object.keys(next).length > 0) writePersisted(statusesKey, next);
  }, [slots, statusesKey]);

  const [activeAngle, setActiveAngle] = usePersistentState<ImageAngle>(persistKey('activeAngle'), 'FRONT');

  // 2. Selective Model Dispatch State (Reference Data codes), seeded from the
  // active brand/application's saved Vision Setting.
  const [selectedDimensions, setSelectedDimensions] = usePersistentState<string[]>(
    persistKey('dimensions'),
    defaultDimensions || [],
  );
  const [selectedSkinConditions, setSelectedSkinConditions] = usePersistentState<string[]>(
    persistKey('skinConditions'),
    defaultSkinConditions || [],
  );

  // 3. Context State
  const [userAge, setUserAge] = usePersistentState(persistKey('userAge'), 28);

  // 4. Layer HUD State
  const [layerState, setLayerState] = usePersistentState<LayerHUDState>(persistKey('layers'), {
    showZones: true,
    showDefectHeatmap: false,
  });

  // 5. Analysis Execution & Results State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = usePersistentState<VisionAnalysisResult | null>(persistKey('result'), null);
  const [selectedZoneCode, setSelectedZoneCode] = useState<string | null>(null);

  // Handlers for Upload / Slots
  const handleUploadFile = (angle: ImageAngle, file: File) => {
    const previewUrl = URL.createObjectURL(file);
    void saveBlob(persistKey(`photo.${angle}`), file);
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
    void saveBlob(persistKey(`photo.${angle}`), null);
    const statuses = readPersisted<SlotStatuses>(statusesKey) ?? {};
    delete statuses[angle];
    writePersisted(statusesKey, statuses);
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
      const parsedResult = await analyzeImages(getEndpoint, formData);
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
