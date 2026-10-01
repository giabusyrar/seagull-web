'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, Sliders, Eye, Boxes, Package } from 'lucide-react';
import { PageHeader, TabNav, SearchableSelect, usePersistentState, type TabItem, type SelectOption } from '@gateway-experience/shared';
import { useToast } from '@/components/ui/toast';
import { VisionSettingsTab, type VisionSettingItem } from './VisionSettingsTab';
import { VisionSettingModal } from './VisionSettingModal';
import { VisionSimulator } from './simulator';
import { ModelRegistryPanel } from './ModelRegistryPanel';
import { ModelAssetsPanel } from './ModelAssetsPanel';
import { useCoreCollection } from '@/lib/hooks/use-core-collection';

// The vision config backend route (list/save) doesn't exist yet — guard
// against parsing a non-JSON response (e.g. a plain-text 404) as JSON,
// which throws a confusing SyntaxError instead of a clean "not available" state.
async function safeJson(res: Response): Promise<any | null> {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export function VisionEngineView() {
  const { toastSuccess, toastError } = useToast();
  const { getEndpoint } = useCoreCollection();

  // Top level active tab: 'settings' (Vision Setting) vs 'simulator' (Vision Simulator) vs 'models' (Model Registry)
  const [activeMainTab, setActiveMainTab] = usePersistentState<'settings' | 'simulator' | 'models' | 'assets'>('xg.visionEngine.activeTab', 'models');

  // Brand & Application context
  const [selectedBrand, setSelectedBrand] = usePersistentState('xg.visionEngine.brand', 'brand_wardah');
  const [selectedApp, setSelectedApp] = usePersistentState('xg.visionEngine.application', 'app_uv_aging_kiosk');

  // ================= VISION SETTINGS TABLE STATE =================
  const [settingsList, setSettingsList] = useState<VisionSettingItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VisionSettingItem | null>(null);

  // Fetch all vision settings for the table.
  //
  // core-engine serves one config at a time (GET /config/:brandId/:applicationId)
  // and has no endpoint that lists them; the '?list=true' call this used to make
  // was answered with a 404 and swallowed, leaving an empty table that looked
  // like "no configs exist". Until core-engine grows a list endpoint, say so
  // rather than showing an emptiness we cannot vouch for.
  const fetchAllSettings = useCallback(async () => {
    setIsLoadingSettings(true);
    setListError(null);
    try {
      const endpoint = getEndpoint('vision', '/api/vision/config?list=true');
      const res = await fetch(endpoint);
      const json = await safeJson(res);
      if (json?.success && Array.isArray(json.items)) {
        setSettingsList(json.items);
        return;
      }
      setSettingsList([]);
      setListError(
        res.status === 404
          ? 'Core-engine has no endpoint that lists vision configs, so this table cannot be filled. A config is readable one scope at a time; saving one from here still works.'
          : `Vision configs could not be listed (HTTP ${res.status}).`,
      );
    } catch (err) {
      console.error('Failed to load vision settings list:', err);
      setSettingsList([]);
      setListError('Vision configs could not be listed: the request failed.');
    } finally {
      setIsLoadingSettings(false);
    }
  }, [getEndpoint]);

  useEffect(() => {
    fetchAllSettings();
  }, [fetchAllSettings]);

  // Save/Update a Vision Setting row
  const handleSaveSetting = async (formData: Partial<VisionSettingItem>) => {
    try {
      const payload = {
        brandId: formData.brandId,
        applicationId: formData.applicationId,
        visionAppConfig: {
          agingFilterEnabled: formData.agingFilterEnabled ?? true,
          uvCamEnabled: formData.uvCamEnabled ?? true,
          polygonOverlayEnabled: formData.polygonOverlayEnabled ?? true,
        },
        orchestrationConfig: {
          enabledDimensions: formData.enabledDimensions ?? [],
          enabledSkinConditions: formData.enabledSkinConditions ?? [],
        },
        featureConfig: {
          enabledFeatures: formData.enabledFeatures ?? [],
        },
        agingConfig: {
          regimenEfficacyFactor: formData.regimenEfficacyFactor ?? 0.5,
          maxSimulatedAge: formData.maxSimulatedAge ?? 65,
          wrinkleIntensity: formData.wrinkleIntensity ?? 1.0,
          saggingIntensity: formData.saggingIntensity ?? 1.0,
          spotIntensity: formData.spotIntensity ?? 1.0,
        },
        uvCamConfig: {
          coverageThreshold: formData.coverageThreshold ?? 85.0,
          absorptionDarknessMin: formData.absorptionDarknessMin ?? 0.3,
          recommendedSpfLevel: formData.recommendedSpfLevel ?? 50,
        },
      };

      const endpoint = getEndpoint('vision', '/api/vision/config');
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await safeJson(res);
      if (data?.success) {
        toastSuccess('Vision Setting Saved', `Parameters for ${formData.brandId} / ${formData.applicationId} updated.`);
        fetchAllSettings();
      } else {
        toastError('Save Failed', data?.error || 'Vision settings backend is not available yet');
      }
    } catch (err: any) {
      toastError('Save Error', err.message || 'An unexpected error occurred');
    }
  };

  // Test in simulation shortcut
  const handleTestInSimulation = (brandId: string, applicationId: string) => {
    setSelectedBrand(brandId);
    setSelectedApp(applicationId);
    setActiveMainTab('simulator');
    toastSuccess('Context Loaded', `Switched to Vision Simulator for ${brandId} / ${applicationId}`);
  };

  const navTabs: TabItem[] = [
    { id: 'models', label: 'Model Registry', icon: <Boxes className="h-3.5 w-3.5 text-emerald-400" /> },
    { id: 'assets', label: 'Model Assets', icon: <Package className="h-3.5 w-3.5 text-violet-400" /> },
    { id: 'settings', label: 'Vision Setting', icon: <Sliders className="h-3.5 w-3.5 text-amber-400" />, badge: settingsList.length },
    { id: 'simulator', label: 'Vision Simulator', icon: <Eye className="h-3.5 w-3.5 text-cyan-400" /> },
  ];

  return (
    <div className="flex-1 min-w-0 h-full overflow-y-auto bg-background text-foreground font-sans flex flex-col select-none">
      {/* Standard Header */}
      <PageHeader
        icon={<Sparkles className="h-5 w-5 text-amber-600" />}
        breadcrumbs={[
          { label: 'Workbench', href: '/' },
          { label: 'Core Engines' },
          { label: 'Vision Engine' },
        ]}
        title="Vision Engine — Multi-Angle Diagnostics"
      >
        <TabNav
          tabs={navTabs}
          activeTab={activeMainTab}
          onTabChange={(id) => setActiveMainTab(id as 'settings' | 'simulator' | 'models' | 'assets')}
        />
      </PageHeader>

      {/* Main Container */}
      <main className="flex-1 p-4 sm:p-6 space-y-6 max-w-7xl w-full mx-auto">
        {/* TAB 1: VISION SETTING TABLE VIEW */}
        {activeMainTab === 'settings' && listError && (
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-foreground">
            {listError}
          </div>
        )}
        {activeMainTab === 'settings' && (
          <VisionSettingsTab
            items={settingsList}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onOpenAddModal={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            onOpenEditModal={(item) => {
              setEditingItem(item);
              setIsModalOpen(true);
            }}
            onRefresh={fetchAllSettings}
            isLoading={isLoadingSettings}
            onTestInSimulation={handleTestInSimulation}
          />
        )}

        {/* TAB 2: VISION SIMULATOR (Multi-Angle, 8-Zone HUD & Diagnostics) */}
        {activeMainTab === 'simulator' && (
          <div className="space-y-6">
            {/* Simulation Context Bar with Unified Vision Setting Dropdown */}
            {(() => {
              const activeSetting = settingsList.find(
                (s) => s.brandId === selectedBrand && s.applicationId === selectedApp
              );

              return (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border shadow-2xs">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-border rounded-lg px-3 py-1.5 text-xs">
                      <Sliders className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                      <span className="text-muted-foreground font-semibold">Vision Threshold Profile:</span>
                      <SearchableSelect
                        value={`${selectedBrand}::${selectedApp}`}
                        onChange={(v) => {
                          const [b, a] = v.split('::');
                          if (b && a) {
                            setSelectedBrand(b);
                            setSelectedApp(a);
                          }
                        }}
                        options={settingsList.map((item): SelectOption => {
                          const brandName = item.brandId.replace('brand_', '').replace(/^\w/, (c) => c.toUpperCase());
                          const appName = item.applicationId.replace('app_', '').replace(/_/g, ' ');
                          return {
                            value: `${item.brandId}::${item.applicationId}`,
                            label: `${brandName} • ${appName} (SPF ${item.recommendedSpfLevel}+ | Eff: ${item.regimenEfficacyFactor})`,
                          };
                        })}
                        placeholder="Select vision threshold profile..."
                        searchPlaceholder="Search brand or application..."
                      />
                    </div>

                    {/* Quick Info Badges applied from active setting */}
                    {activeSetting && (
                      <div className="hidden md:flex items-center gap-1.5">
                        <span className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                          SPF {activeSetting.recommendedSpfLevel}+
                        </span>
                        <span className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-indigo-800 dark:text-indigo-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                          Efficacy {activeSetting.regimenEfficacyFactor}
                        </span>
                        <span className="bg-slate-50 dark:bg-slate-900 border border-border text-muted-foreground text-[10px] font-mono px-2 py-0.5 rounded">
                          Max {activeSetting.maxSimulatedAge}y
                        </span>
                        {(activeSetting.enabledDimensions?.length > 0 || activeSetting.enabledSkinConditions?.length > 0) && (
                          <span className="bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 text-cyan-800 dark:text-cyan-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                            {activeSetting.enabledDimensions?.length ?? 0} dims / {activeSetting.enabledSkinConditions?.length ?? 0} conditions
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* 3-Column Vision Simulator Workbench */}
            {(() => {
              const activeSetting = settingsList.find(
                (s) => s.brandId === selectedBrand && s.applicationId === selectedApp
              );
              return (
                <VisionSimulator
                  key={`${selectedBrand}::${selectedApp}`}
                  selectedBrand={selectedBrand}
                  selectedApp={selectedApp}
                  defaultDimensions={activeSetting?.enabledDimensions}
                  defaultSkinConditions={activeSetting?.enabledSkinConditions}
                />
              );
            })()}
          </div>
        )}

        {/* TAB 3: MODEL REGISTRY (Upload/Download ONNX models per Vision Capability) */}
        {activeMainTab === 'models' && <ModelRegistryPanel />}

        {/* TAB 4: MODEL ASSETS (shared files the workers fetch at start) */}
        {activeMainTab === 'assets' && <ModelAssetsPanel />}
      </main>

      {/* Vision Setting Add / Edit Modal */}
      <VisionSettingModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveSetting}
        editingItem={editingItem}
      />
    </div>
  );
}
