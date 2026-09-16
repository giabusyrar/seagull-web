'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ChipGroup, ChipOption } from '@gateway-experience/shared';
import { useCoreCollection } from '@/lib/hooks/use-core-collection';

export interface RegistryDimension {
  code: string;
  name: string;
  description?: string;
  skinConditions: string[];
}

export interface RegistrySkinCondition {
  code: string;
  name: string;
  description?: string;
  dimensionCode: string;
  capabilities: string[];
}

export interface VisionRegistry {
  dimensions: RegistryDimension[];
  skinConditions: RegistrySkinCondition[];
}

const OTHER_GROUP_KEY = '__other__';

export function toDimensionChipOptions(dimensions: RegistryDimension[]): ChipOption[] {
  return dimensions.map((d) => ({ value: d.code, label: d.name || d.code, description: d.description }));
}

// Skin condition chips grouped under their dimension's name, in registry order.
export function toSkinConditionChipGroups(
  dimensions: RegistryDimension[],
  skinConditions: RegistrySkinCondition[]
): ChipGroup[] {
  const dimensionNames = new Map(dimensions.map((d) => [d.code, d.name || d.code]));
  const groups = new Map<string, ChipGroup>();
  for (const condition of skinConditions) {
    const key = dimensionNames.has(condition.dimensionCode) ? condition.dimensionCode : OTHER_GROUP_KEY;
    if (!groups.has(key)) {
      groups.set(key, { key, label: dimensionNames.get(condition.dimensionCode) ?? 'Other', options: [] });
    }
    groups.get(key)!.options.push({
      value: condition.code,
      label: condition.name || condition.code,
      description: condition.description,
    });
  }
  return Array.from(groups.values());
}

const EMPTY_REGISTRY: VisionRegistry = { dimensions: [], skinConditions: [] };
const LOAD_ERROR = 'Failed to load dimensions and skin conditions from Reference Data';

// Fetches the vision-relevant dimensions and skin conditions core-engine serves
// from Reference Data, so the frontend never hardcodes its own copy.
export function useVisionRegistry() {
  const { getEndpoint } = useCoreCollection();
  const [registry, setRegistry] = useState<VisionRegistry>(EMPTY_REGISTRY);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const endpoint = getEndpoint('vision', '/registry');
        const res = await fetch(endpoint);
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setError(json.message || LOAD_ERROR);
          return;
        }
        if (Array.isArray(json.dimensions) && Array.isArray(json.skinConditions)) {
          setRegistry({ dimensions: json.dimensions, skinConditions: json.skinConditions });
          setError(null);
        }
      } catch (err) {
        console.error('Failed to load vision registry:', err);
        if (!cancelled) setError(LOAD_ERROR);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [getEndpoint]);

  const labels = useMemo(() => {
    const map = new Map<string, string>();
    for (const d of registry.dimensions) map.set(d.code, d.name || d.code);
    for (const c of registry.skinConditions) map.set(c.code, c.name || c.code);
    return map;
  }, [registry]);

  const labelFor = useCallback((code: string) => labels.get(code) ?? code, [labels]);

  return { ...registry, isLoading, error, labelFor };
}
