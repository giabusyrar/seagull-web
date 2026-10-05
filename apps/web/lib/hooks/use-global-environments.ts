'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';
import type { Environment, EnvironmentVariable } from '@/types/api-client';

/**
 * The gateway's environments as they are. When the gateway has none (or
 * cannot be reached) there are none: no "Development" stand-in is invented,
 * and an environment without a `host` is left without one — the API client's
 * missing-host prompt says so and offers to set it (browserDataPlaneHost).
 */
export function gatewayEnvironments(envs: Environment[] | undefined): Environment[] {
  return Array.isArray(envs) ? envs : [];
}

export function useGlobalEnvironments() {
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<{ success: boolean; environments?: Environment[]; error?: string }>('/api/global-environments');
      if (res.success && res.environments) {
        setEnvironments(gatewayEnvironments(res.environments));
        setError(null);
      } else {
        setEnvironments([]);
        setError(res.error || 'Failed to load global environments');
      }
    } catch (err: any) {
      console.warn('useGlobalEnvironments: fallback to default environments:', err?.message || err);
      setEnvironments([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial data load on mount — synchronizing with the API is the intended
    // purpose of this effect, not a derived-state anti-pattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  const createEnvironment = async (name: string, variables: EnvironmentVariable[] = []) => {
    const res = await apiPost<{ success: boolean; environment?: Environment; error?: string }>('/api/global-environments', {
      name,
      variables,
    });
    if (res.success) await refresh();
    return res;
  };

  const updateEnvironment = async (id: string, data: Partial<Environment>) => {
    const res = await apiPut<{ success: boolean; environment?: Environment; error?: string }>(`/api/global-environments/${id}`, data);
    if (res.success) await refresh();
    return res;
  };

  const deleteEnvironment = async (id: string) => {
    const res = await apiDelete<{ success: boolean; error?: string }>(`/api/global-environments/${id}`);
    if (res.success) await refresh();
    return res;
  };

  return {
    environments,
    setEnvironments,
    loading,
    error,
    refresh,
    createEnvironment,
    updateEnvironment,
    deleteEnvironment,
  };
}
