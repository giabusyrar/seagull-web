'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Sliders, Building, Smartphone, Layers, Sparkles, Code2 } from 'lucide-react';
import {
  Modal,
  SearchableSelect,
  ChipMultiSelect,
  InfoTooltip,
  type SelectOption,
  type ChipOption,
} from '@gateway-experience/shared';
import type { VisionSettingItem } from './VisionSettingsTab';
import { useVisionRegistry, toDimensionChipOptions, toSkinConditionChipGroups } from './useVisionRegistry';

const FEATURE_OPTIONS: ChipOption[] = [
  { value: 'skin_analyzer', label: 'Skin Analyzer' },
  { value: 'virtual_try_on', label: 'Virtual Try On' },
  { value: 'face_shape_analysis', label: 'Face Shape Analysis' },
  { value: 'hair_scalp_analysis', label: 'Hair & Scalp Analysis' },
  { value: 'color_intelligence', label: 'Color Intelligence' },
];

interface VisionSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<VisionSettingItem>) => Promise<void> | void;
  editingItem: VisionSettingItem | null;
}

export const VisionSettingModal: React.FC<VisionSettingModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
}) => {
  const [brandId, setBrandId] = useState('brand_wardah');
  const [applicationId, setApplicationId] = useState('app_uv_aging_kiosk');

  // Real data state
  const [brands, setBrands] = useState<Array<{ id: string; name: string; description?: string }>>([]);
  const [applications, setApplications] = useState<Array<{ id: string; key: string; name: string; description?: string }>>([]);
  const [loading, setLoading] = useState(false);

  // Selective Model Dispatch Defaults (Vision Engine orchestration)
  const {
    dimensions: registryDimensions,
    skinConditions: registrySkinConditions,
    isLoading: isRegistryLoading,
  } = useVisionRegistry();
  const [enabledDimensions, setEnabledDimensions] = useState<string[]>([]);
  const [enabledSkinConditions, setEnabledSkinConditions] = useState<string[]>([]);

  // Feature Selection (which experiences this brand/application exposes)
  const [enabledFeatures, setEnabledFeatures] = useState<string[]>([]);

  // Feature Toggles
  const [agingFilterEnabled, setAgingFilterEnabled] = useState(true);
  const [uvCamEnabled, setUvCamEnabled] = useState(true);
  const [polygonOverlayEnabled, setPolygonOverlayEnabled] = useState(true);

  // Aging Config
  const [regimenEfficacyFactor, setRegimenEfficacyFactor] = useState(0.5);
  const [maxSimulatedAge, setMaxSimulatedAge] = useState(65);
  const [wrinkleIntensity, setWrinkleIntensity] = useState(1.0);
  const [saggingIntensity, setSaggingIntensity] = useState(1.0);
  const [spotIntensity, setSpotIntensity] = useState(1.0);

  // UV Cam Config
  const [coverageThreshold, setCoverageThreshold] = useState(85.0);
  const [absorptionDarknessMin, setAbsorptionDarknessMin] = useState(0.3);
  const [recommendedSpfLevel, setRecommendedSpfLevel] = useState(50);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      Promise.all([
        fetch('/api/reference/brands')
          .then((res) => res.json())
          .then((data) => {
            const list = data?.brands || data?.items || data?.data;
            if (list && Array.isArray(list)) {
              setBrands(list);
            }
          })
          .catch(() => {}),
        fetch('/api/reference/applications')
          .then((res) => res.json())
          .then((data) => {
            const list = data?.applications || data?.items || data?.data;
            if (list && Array.isArray(list)) {
              setApplications(list);
            }
          })
          .catch(() => {}),
      ]).finally(() => setLoading(false));
    }
  }, [isOpen]);

  useEffect(() => {
    if (editingItem) {
      setBrandId(editingItem.brandId);
      setApplicationId(editingItem.applicationId);
      setEnabledDimensions(editingItem.enabledDimensions ?? []);
      setEnabledSkinConditions(editingItem.enabledSkinConditions ?? []);
      setEnabledFeatures(editingItem.enabledFeatures ?? []);
      setAgingFilterEnabled(editingItem.agingFilterEnabled ?? true);
      setUvCamEnabled(editingItem.uvCamEnabled ?? true);
      setPolygonOverlayEnabled(editingItem.polygonOverlayEnabled ?? true);
      setRegimenEfficacyFactor(editingItem.regimenEfficacyFactor ?? 0.5);
      setMaxSimulatedAge(editingItem.maxSimulatedAge ?? 65);
      setWrinkleIntensity(editingItem.wrinkleIntensity ?? 1.0);
      setSaggingIntensity(editingItem.saggingIntensity ?? 1.0);
      setSpotIntensity(editingItem.spotIntensity ?? 1.0);
      setCoverageThreshold(editingItem.coverageThreshold ?? 85.0);
      setAbsorptionDarknessMin(editingItem.absorptionDarknessMin ?? 0.3);
      setRecommendedSpfLevel(editingItem.recommendedSpfLevel ?? 50);
    } else {
      setEnabledDimensions([]);
      setEnabledSkinConditions([]);
      setEnabledFeatures([]);
      setAgingFilterEnabled(true);
      setUvCamEnabled(true);
      setPolygonOverlayEnabled(true);
      setRegimenEfficacyFactor(0.5);
      setMaxSimulatedAge(65);
      setWrinkleIntensity(1.0);
      setSaggingIntensity(1.0);
      setSpotIntensity(1.0);
      setCoverageThreshold(85.0);
      setAbsorptionDarknessMin(0.3);
      setRecommendedSpfLevel(50);
    }
  }, [editingItem, isOpen]);

  const brandOptions: SelectOption[] = useMemo(() => {
    if (brands.length > 0) {
      return brands.map((b) => ({
        value: `brand_${b.name.toLowerCase().replace(/\s+/g, '_')}`,
        label: b.name,
        description: b.description || `Master Brand ID: ${b.id}`,
      }));
    }
    return [
      { value: 'brand_wardah', label: 'Wardah Beauty', description: 'Halal Beauty' },
      { value: 'brand_kahf', label: 'Kahf Men', description: 'Men Grooming' },
      { value: 'brand_makeover', label: 'Make Over', description: 'Cosmetics' },
      { value: 'brand_labore', label: 'Laboré', description: 'Dermatological' },
      { value: 'brand_emina', label: 'Emina', description: 'Youth Beauty' },
    ];
  }, [brands]);

  const appOptions: SelectOption[] = useMemo(() => {
    if (applications.length > 0) {
      return applications.map((a) => ({
        value: a.key || a.id,
        label: a.name,
        description: a.description || a.key,
      }));
    }
    return [
      { value: 'app_uv_aging_kiosk', label: 'UV & Aging Kiosk', description: 'Physical Device' },
      { value: 'app_mobile_survey', label: 'Mobile Web Survey', description: 'DTC Web App' },
      { value: 'app_counter_consultation', label: 'Beauty Advisor Counter', description: 'Consultation' },
    ];
  }, [applications]);

  const dimensionChipOptions = useMemo(() => toDimensionChipOptions(registryDimensions), [registryDimensions]);
  const skinConditionChipGroups = useMemo(
    () => toSkinConditionChipGroups(registryDimensions, registrySkinConditions),
    [registryDimensions, registrySkinConditions]
  );

  const skinAnalyzerEnabled = enabledFeatures.includes('skin_analyzer');

  const toggleFeature = (featureId: string) => {
    setEnabledFeatures((prev) => {
      const next = prev.includes(featureId) ? prev.filter((f) => f !== featureId) : [...prev, featureId];
      // Dispatch defaults are meaningless without Skin Analyzer — clear them when it's turned off.
      if (featureId === 'skin_analyzer' && prev.includes(featureId)) {
        setEnabledDimensions([]);
        setEnabledSkinConditions([]);
      }
      return next;
    });
  };

  // Illustrative preview of what /api/vision/analyze would return for this
  // brand/application. Nothing selected means every vision-relevant dimension
  // and skin condition in Reference Data is analyzed. Scores are placeholders.
  const outcomePreview = useMemo(() => {
    if (!skinAnalyzerEnabled) {
      return {
        features: enabledFeatures,
        note: 'Enable "Skin Analyzer" above to preview its dimension/skin-condition scoring output.',
      };
    }

    const isAutoDispatch = enabledDimensions.length === 0 && enabledSkinConditions.length === 0;
    const dimensionCodes = isAutoDispatch ? registryDimensions.map((d) => d.code) : enabledDimensions;
    const plannedConditions = isAutoDispatch
      ? registrySkinConditions
      : registrySkinConditions.filter(
          (c) => enabledSkinConditions.includes(c.code) || enabledDimensions.includes(c.dimensionCode)
        );
    const capabilities = Array.from(new Set(plannedConditions.flatMap((c) => c.capabilities)));

    const buildMetricMap = (keys: string[]) =>
      keys.reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = { score: '<0-100, 100 = optimal>', confidence: '<0-1>' };
        return acc;
      }, {});

    return {
      features: enabledFeatures,
      dispatchMode: isAutoDispatch ? 'AUTO_ALL' : 'SELECTIVE',
      globalAggregation: {
        overallSkinHealthScore: '<0-100, 100 = optimal>',
        dimensions: buildMetricMap(dimensionCodes),
        skinConditions: buildMetricMap(plannedConditions.map((c) => c.code)),
      },
      executionMetrics: {
        executedModels: capabilities,
        executedModelsCount: '<scored zone × capability pairs>',
        skippedModelsCount: '<capabilities without a score>',
      },
    };
  }, [
    skinAnalyzerEnabled,
    enabledFeatures,
    enabledDimensions,
    enabledSkinConditions,
    registryDimensions,
    registrySkinConditions,
  ]);

  const handleSubmit = async () => {
    if (!brandId.trim() || !applicationId.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        brandId: brandId.trim().toLowerCase(),
        applicationId: applicationId.trim().toLowerCase(),
        enabledDimensions,
        enabledSkinConditions,
        enabledFeatures,
        agingFilterEnabled,
        uvCamEnabled,
        polygonOverlayEnabled,
        regimenEfficacyFactor,
        maxSimulatedAge,
        wrinkleIntensity,
        saggingIntensity,
        spotIntensity,
        coverageThreshold,
        absorptionDarknessMin,
        recommendedSpfLevel,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingItem ? `Configure Vision Setting (${brandId} / ${applicationId})` : 'New Vision Configuration'}
      icon={<Sliders className="h-4 w-4 text-cyan-400" />}
      size="2xl"
      primaryActionLabel={isSubmitting ? 'Saving...' : 'Save Configuration'}
      onPrimaryAction={handleSubmit}
      isPrimaryLoading={isSubmitting}
      isPrimaryDisabled={isSubmitting || !brandId.trim() || !applicationId.trim()}
      isLoading={isSubmitting}
      loadingText="Saving Configuration..."
    >
      <div className="space-y-4">
        {/* Target Brand & Application Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-border">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
              <Building className="h-3 w-3 text-cyan-600" />
              <span>Brand Scope</span>
            </label>
            <SearchableSelect
              value={brandId}
              onChange={setBrandId}
              options={brandOptions}
              disabled={!!editingItem || loading}
              placeholder="Select brand..."
              searchPlaceholder="Search brand..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
              <Smartphone className="h-3 w-3 text-indigo-600" />
              <span>Channel / Application</span>
            </label>
            <SearchableSelect
              value={applicationId}
              onChange={setApplicationId}
              options={appOptions}
              disabled={!!editingItem || loading}
              placeholder="Select channel..."
              searchPlaceholder="Search channel..."
            />
          </div>
        </div>

        {/* 1. Features Selection */}
        <div className="space-y-2.5">
          <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> 1. Features Selection
            <InfoTooltip
              content="Experiences exposed to this brand/application."
              label="About Features Selection"
              iconClassName="h-3 w-3"
            />
          </span>
          <ChipMultiSelect
            tone="cyan"
            options={FEATURE_OPTIONS}
            value={enabledFeatures}
            onChange={(_, toggled) => toggleFeature(toggled)}
          />
        </div>

        {/* 2. Selective Model Dispatch Defaults (Vision Engine orchestration) */}
        <div
          className={`space-y-2.5 bg-muted/30 p-3.5 rounded-lg border border-border transition-opacity ${
            skinAnalyzerEnabled ? '' : 'opacity-60'
          }`}
        >
          <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" /> 2. Selective Model Dispatch Defaults
            <InfoTooltip
              content="Dimensions and/or skin conditions dispatched by default when this brand/application is analyzed. Leave everything unselected to analyze all of them."
              label="About Selective Model Dispatch Defaults"
              iconClassName="h-3 w-3"
            />
          </span>

          {!skinAnalyzerEnabled ? (
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
              Enable &quot;Skin Analyzer&quot; in Features Selection above to configure dispatch defaults.
            </p>
          ) : isRegistryLoading ? (
            <p className="text-[10px] text-muted-foreground">Loading dimensions &amp; skin conditions from Reference Data...</p>
          ) : (
            <>
              <ChipMultiSelect
                label="Dimensions"
                tone="amber"
                options={dimensionChipOptions}
                value={enabledDimensions}
                onChange={(next) => setEnabledDimensions(next)}
              />

              <ChipMultiSelect
                label="Skin Conditions"
                tone="indigo"
                groups={skinConditionChipGroups}
                value={enabledSkinConditions}
                onChange={(next) => setEnabledSkinConditions(next)}
                listClassName="max-h-64 overflow-y-auto p-0.5"
              />
            </>
          )}
        </div>

        {/* 3. Expected Outcome Preview */}
        <div className="space-y-2 bg-muted/30 p-3.5 rounded-lg border border-border">
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <Code2 className="h-3.5 w-3.5" /> 3. Expected Outcome Preview
            <InfoTooltip
              content="Illustrative shape of the analysis response for the features/dimensions/skin conditions selected above. Scores shown are placeholders, not real predictions."
              label="About Expected Outcome Preview"
              iconClassName="h-3 w-3"
            />
          </span>
          <pre className="text-[10px] font-mono bg-background border border-border rounded-lg p-3 overflow-x-auto max-h-64 overflow-y-auto text-foreground">
            {JSON.stringify(outcomePreview, null, 2)}
          </pre>
        </div>
      </div>
    </Modal>
  );
};
