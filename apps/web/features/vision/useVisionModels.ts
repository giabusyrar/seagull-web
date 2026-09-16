'use client';

import { useCallback, useEffect, useState } from 'react';

export interface VisionModelRecord {
  id: string;
  capabilityCode: string;
  sizeBytes: number;
  originalFilename: string;
  inputShape?: string | null;
  outputShape?: string | null;
  version: number;
  uploadedAt: string;
  /** null/empty = the model scores every facial zone */
  applicableZones?: string[] | null;
}

interface SkinConditionLite {
  id: string;
  code: string;
  name: string;
  dimensionCode?: string;
  visionCapabilities?: string[];
  triggerKeys?: string[];
  description?: string;
}

export interface CapabilityRow {
  capability: string;
  skinConditions: string[];
  skinConditionCodes: string[];
  model: VisionModelRecord | null;
}

export interface SkinConditionOption {
  code: string;
  name: string;
  dimensionCode?: string;
  dimensionName?: string;
}

interface DimensionLite {
  code: string;
  name: string;
}

// Cross-references every skin condition's declared visionCapabilities
// against the models actually registered in the Python worker's model
// registry, so the panel shows every capability that needs a model even
// before one has been uploaded.
export function useVisionModels() {
  const [rows, setRows] = useState<CapabilityRow[]>([]);
  const [allConditions, setAllConditions] = useState<SkinConditionLite[]>([]);
  const [allDimensions, setAllDimensions] = useState<DimensionLite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [conditionsRes, dimensionsRes, modelsRes] = await Promise.all([
        fetch('/api/skin-conditions').then((r) => r.json()),
        fetch('/api/reference/dimensions').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/vision-worker/models').then((r) => (r.ok ? r.json() : [])),
      ]);

      const conditions: SkinConditionLite[] = Array.isArray(conditionsRes?.data)
        ? conditionsRes.data
        : [];
      const dimensions: DimensionLite[] = Array.isArray(dimensionsRes?.data) ? dimensionsRes.data : [];
      const models: VisionModelRecord[] = Array.isArray(modelsRes) ? modelsRes : [];
      const modelByCapability = new Map(models.map((m) => [m.capabilityCode, m]));

      const capabilityToConditions = new Map<string, Map<string, string>>();
      for (const cond of conditions) {
        for (const cap of cond.visionCapabilities || []) {
          if (!capabilityToConditions.has(cap)) capabilityToConditions.set(cap, new Map());
          capabilityToConditions.get(cap)!.set(cond.code, cond.name || cond.code);
        }
      }
      // Include capabilities that have an uploaded model but no (or no longer
      // any) mapped skin condition, so orphaned uploads stay visible/manageable.
      for (const m of models) {
        if (!capabilityToConditions.has(m.capabilityCode)) {
          capabilityToConditions.set(m.capabilityCode, new Map());
        }
      }

      const nextRows: CapabilityRow[] = Array.from(capabilityToConditions.entries())
        .map(([capability, condMap]) => ({
          capability,
          skinConditions: Array.from(condMap.values()),
          skinConditionCodes: Array.from(condMap.keys()),
          model: modelByCapability.get(capability) || null,
        }))
        .sort((a, b) => a.capability.localeCompare(b.capability));

      setRows(nextRows);
      setAllConditions(conditions);
      setAllDimensions(dimensions);
    } catch (err) {
      console.error('Failed to load vision model registry:', err);
      setError('Failed to load model registry');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // zones is only sent when non-empty: an absent field keeps the zones already
  // stored for a replaced model (a first upload then applies to all zones).
  const uploadModel = useCallback(
    async (capability: string, file: File, zones?: string[]): Promise<{ success: boolean; error?: string }> => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('capability', capability);
      if (zones && zones.length > 0) {
        formData.append('applicableZones', zones.join(','));
      }
      try {
        const res = await fetch('/api/vision-worker/models/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) {
          return { success: false, error: data.detail || 'Upload failed' };
        }
        await refresh();
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err?.message || 'Upload failed' };
      }
    },
    [refresh]
  );

  const downloadModel = useCallback(async (capability: string) => {
    const res = await fetch(`/api/vision-worker/models/download?capability=${encodeURIComponent(capability)}`);
    const data = await res.json();
    if (res.ok && data.url) {
      window.open(data.url, '_blank');
    }
    return data;
  }, []);

  const deleteModel = useCallback(
    async (capability: string) => {
      const res = await fetch(`/api/vision-worker/models/${encodeURIComponent(capability)}`, {
        method: 'DELETE',
      });
      if (res.ok) await refresh();
      return res.ok;
    },
    [refresh]
  );

  const updateApplicableZones = useCallback(
    async (capability: string, zones: string[]): Promise<{ success: boolean; error?: string }> => {
      try {
        const res = await fetch(`/api/vision-worker/models/${encodeURIComponent(capability)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ applicableZones: zones.length > 0 ? zones : null }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          return { success: false, error: data.detail || 'Failed to update applicable zones' };
        }
        await refresh();
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err?.message || 'Failed to update applicable zones' };
      }
    },
    [refresh]
  );

  // Reference-service only exposes an upsert-by-id POST for skin conditions
  // (no PUT route is registered), so mapping edits must go through POST with
  // the full existing entity plus the changed visionCapabilities array.
  const applyCapabilityMapping = useCallback(
    async (capability: string, selectedConditionCodes: string[]): Promise<{ success: boolean; error?: string }> => {
      const selected = new Set(selectedConditionCodes);
      const toUpdate = allConditions.filter((cond) => {
        const has = (cond.visionCapabilities || []).includes(capability);
        const shouldHave = selected.has(cond.code);
        return has !== shouldHave;
      });

      try {
        await Promise.all(
          toUpdate.map((cond) => {
            const shouldHave = selected.has(cond.code);
            const nextCapabilities = shouldHave
              ? [...(cond.visionCapabilities || []), capability]
              : (cond.visionCapabilities || []).filter((c) => c !== capability);
            return fetch('/api/skin-conditions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...cond, visionCapabilities: nextCapabilities }),
            }).then((res) => {
              if (!res.ok) throw new Error(`Failed to update "${cond.name || cond.code}"`);
            });
          })
        );
        await refresh();
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err?.message || 'Failed to update capability mapping' };
      }
    },
    [allConditions, refresh]
  );

  // The mapping modal requires at least one selected condition (it's an
  // editor, not a way to unmap everything) — this is the explicit "remove
  // this capability entirely" action: unmap it from every condition and
  // delete its uploaded model, if any.
  const deleteCapability = useCallback(
    async (capability: string): Promise<{ success: boolean; error?: string }> => {
      const mappingRes = await applyCapabilityMapping(capability, []);
      if (!mappingRes.success) return mappingRes;

      const hasModel = rows.find((r) => r.capability === capability)?.model;
      if (hasModel) {
        const ok = await deleteModel(capability);
        if (!ok) return { success: false, error: 'Unmapped from all conditions, but failed to delete its uploaded model' };
      }
      return { success: true };
    },
    [applyCapabilityMapping, deleteModel, rows]
  );

  return {
    rows,
    allConditions,
    allDimensions,
    isLoading,
    error,
    refresh,
    uploadModel,
    downloadModel,
    deleteModel,
    updateApplicableZones,
    updateCapabilityMapping: applyCapabilityMapping,
    deleteCapability,
  };
}
