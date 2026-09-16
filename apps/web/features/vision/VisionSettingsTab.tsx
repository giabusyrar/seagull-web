'use client';

import React, { useState, useMemo } from 'react';
import {
  Sliders,
  Pencil,
  Building,
  Smartphone,
  Eye,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  SearchFilterBar,
  DataTable,
  BrandTag,
  Button,
  SearchableSelect,
  type ColumnDef,
  type SelectOption,
} from '@gateway-experience/shared';

export interface VisionSettingItem {
  id: string;
  brandId: string;
  applicationId: string;
  agingFilterEnabled: boolean;
  uvCamEnabled: boolean;
  polygonOverlayEnabled: boolean;
  regimenEfficacyFactor: number;
  maxSimulatedAge: number;
  wrinkleIntensity: number;
  saggingIntensity: number;
  spotIntensity: number;
  coverageThreshold: number;
  absorptionDarknessMin: number;
  recommendedSpfLevel: number;
  // Default dimensions & skin conditions dispatched by the Vision Engine
  // orchestrator for this brand/application (mirrors the Go registry).
  enabledDimensions: string[];
  enabledSkinConditions: string[];
  // Features (experiences) exposed to this brand/application, e.g. skin_analyzer, virtual_try_on.
  enabledFeatures?: string[];
  updatedAt?: string | Date;
}

interface VisionSettingsTabProps {
  items: VisionSettingItem[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (item: VisionSettingItem) => void;
  onRefresh: () => void;
  isLoading: boolean;
  onTestInSimulation?: (brandId: string, applicationId: string) => void;
}

export const VisionSettingsTab: React.FC<VisionSettingsTabProps> = ({
  items,
  searchQuery,
  onSearchChange,
  onOpenAddModal,
  onOpenEditModal,
  onRefresh,
  isLoading,
  onTestInSimulation,
}) => {
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('all');
  const [selectedAppFilter, setSelectedAppFilter] = useState<string>('all');

  const availableBrands = useMemo(() => {
    return Array.from(new Set(items.map((i) => i.brandId).filter(Boolean)));
  }, [items]);

  const availableApps = useMemo(() => {
    return Array.from(new Set(items.map((i) => i.applicationId).filter(Boolean)));
  }, [items]);

  const brandFilterOptions: SelectOption[] = useMemo(() => {
    return [
      { value: 'all', label: `All Brands (${availableBrands.length})` },
      ...availableBrands.map((b) => ({
        value: b,
        label: b.replace('brand_', '').replace(/^\w/, (c) => c.toUpperCase()),
      })),
    ];
  }, [availableBrands]);

  const appFilterOptions: SelectOption[] = useMemo(() => {
    return [
      { value: 'all', label: `All Applications (${availableApps.length})` },
      ...availableApps.map((a) => ({
        value: a,
        label: a.replace('app_', '').replace(/_/g, ' '),
      })),
    ];
  }, [availableApps]);

  const filtered = items.filter((it) => {
    if (selectedBrandFilter !== 'all' && it.brandId !== selectedBrandFilter) return false;
    if (selectedAppFilter !== 'all' && it.applicationId !== selectedAppFilter) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      it.brandId.toLowerCase().includes(q) ||
      it.applicationId.toLowerCase().includes(q) ||
      it.recommendedSpfLevel.toString().includes(q)
    );
  });

  const activeFilterCount =
    (selectedBrandFilter !== 'all' ? 1 : 0) + (selectedAppFilter !== 'all' ? 1 : 0);

  const customFilterContent = (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <span className="text-xs font-bold text-foreground uppercase tracking-wider">Vision Filters</span>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={() => {
              setSelectedBrandFilter('all');
              setSelectedAppFilter('all');
            }}
            className="text-[10px] text-primary hover:underline cursor-pointer"
          >
            Reset All
          </button>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
          <Building className="h-3 w-3 text-primary" />
          <span>Brand Scope</span>
        </label>
        <SearchableSelect
          value={selectedBrandFilter}
          onChange={setSelectedBrandFilter}
          options={brandFilterOptions}
          placeholder="Filter by brand..."
          searchPlaceholder="Search brand..."
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
          <Smartphone className="h-3 w-3 text-primary" />
          <span>Channel / Application</span>
        </label>
        <SearchableSelect
          value={selectedAppFilter}
          onChange={setSelectedAppFilter}
          options={appFilterOptions}
          placeholder="Filter by application..."
          searchPlaceholder="Search application..."
        />
      </div>
    </div>
  );

  const columns: ColumnDef<VisionSettingItem>[] = [
    {
      key: 'brandId',
      header: 'Brand & Channel Context',
      render: (item) => (
        <div className="flex flex-col gap-1.5 items-start">
          <BrandTag name={item.brandId.replace('brand_', '')} />
          <span className="font-mono text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded border border-border">
            {item.applicationId}
          </span>
        </div>
      ),
    },
    {
      key: 'features',
      header: 'Spatial Features',
      render: (item) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            {item.agingFilterEnabled ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <XCircle className="h-3.5 w-3.5 text-muted-foreground/60" />
            )}
            <span className={item.agingFilterEnabled ? 'text-foreground text-[11px]' : 'text-muted-foreground text-[11px]'}>
              Aging Simulation
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {item.uvCamEnabled ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <XCircle className="h-3.5 w-3.5 text-muted-foreground/60" />
            )}
            <span className={item.uvCamEnabled ? 'text-foreground text-[11px]' : 'text-muted-foreground text-[11px]'}>
              UV Camera Analyzer
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {item.polygonOverlayEnabled ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <XCircle className="h-3.5 w-3.5 text-muted-foreground/60" />
            )}
            <span className={item.polygonOverlayEnabled ? 'text-foreground text-[11px]' : 'text-muted-foreground text-[11px]'}>
              8-Zone Heatmap
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'orchestration',
      header: 'Model Orchestration',
      render: (item) => {
        const dims = item.enabledDimensions || [];
        const conditions = item.enabledSkinConditions || [];
        if (dims.length === 0 && conditions.length === 0) {
          return <span className="text-[11px] text-muted-foreground">No defaults set</span>;
        }
        return (
          <div className="flex flex-col gap-1 max-w-[220px]">
            {dims.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                {dims.map((d) => (
                  <span
                    key={d}
                    className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-mono px-1.5 py-0.5 rounded text-[9px]"
                  >
                    {d}
                  </span>
                ))}
              </div>
            )}
            {conditions.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                {conditions.map((c) => (
                  <span
                    key={c}
                    className="bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 font-mono px-1.5 py-0.5 rounded text-[9px]"
                  >
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'uvCam',
      header: 'UV Cam Calibration',
      render: (item) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="bg-beak/20 text-beak border border-beak/20 font-mono font-bold px-2 py-0.5 rounded text-[10px]">
              SPF {item.recommendedSpfLevel}+
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground font-mono">
            Coverage: <strong className="text-foreground">{item.coverageThreshold}%</strong>
          </div>
          <div className="text-[10px] text-muted-foreground/80 font-mono">
            Absorb Min: {item.absorptionDarknessMin}
          </div>
        </div>
      ),
    },
    {
      key: 'agingSpecs',
      header: 'Aging Longevity Specs',
      render: (item) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="bg-beak/15 text-muted-foreground border border-beak/15 font-mono font-bold px-2 py-0.5 rounded text-[10px]">
              Max Age: {item.maxSimulatedAge} yrs
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              Efficacy: {item.regimenEfficacyFactor}
            </span>
          </div>
          <div className="text-[10px] font-mono text-muted-foreground">
            Wrinkle: <span className="text-foreground">{item.wrinkleIntensity}x</span> | Sag: <span className="text-foreground">{item.saggingIntensity}x</span> | Spot: <span className="text-foreground">{item.spotIntensity}x</span>
          </div>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          {onTestInSimulation && (
            <Button
              variant="outline"
              size="xs"
              onClick={() => onTestInSimulation(item.brandId, item.applicationId)}
              leftIcon={<Eye className="h-3.5 w-3.5 text-primary" />}
              title="Test in Simulator"
            >
              Simulate
            </Button>
          )}
          <Button
            variant="outline"
            size="xs"
            onClick={() => onOpenEditModal(item)}
            leftIcon={<Pencil className="h-3.5 w-3.5 text-primary" />}
            title="Configure Vision Settings"
          >
            Edit
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search vision settings by brand, application, SPF level..."
        actionLabel="New Vision Setting"
        onAction={onOpenAddModal}
        customFilterContent={customFilterContent}
        activeFilterCount={activeFilterCount}
        onRefresh={onRefresh}
        isLoading={isLoading}
      />

      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(item) => `${item.brandId}-${item.applicationId}`}
        isLoading={isLoading}
        emptyMessage="No vision configuration settings found."
      />
    </div>
  );
};
