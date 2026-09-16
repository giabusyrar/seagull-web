'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';
import type { Environment, EnvironmentVariable } from '@/types/api-client';

export function ensureHostVariable(envs: Environment[]): Environment[] {
  const defaultHostValue =
    process.env.NEXT_PUBLIC_GATEWAY_PROXY_URL ||
    (typeof window !== 'undefined' ? window.location.origin : '');

  if (!envs || envs.length === 0) {
    return [
      {
        id: 'env-dev',
        name: 'Development',
        isDefault: true,
        variables: [
          { id: 'v-host-dev', key: 'host', value: defaultHostValue, enabled: true, isSecret: false },
        ],
      },
      {
        id: 'env-staging',
        name: 'Staging',
        variables: [
          { id: 'v-host-stg', key: 'host', value: 'https://staging-api.example.com', enabled: true, isSecret: false },
        ],
      },
      {
        id: 'env-prod',
        name: 'Production',
        variables: [
          { id: 'v-host-prod', key: 'host', value: 'https://api.example.com', enabled: true, isSecret: false },
        ],
      },
    ];
  }

  return envs.map((env) => {
    const hasHost = env.variables.some((v) => v.key.trim() === 'host');
    if (!hasHost) {
      return {
        ...env,
        variables: [
          { id: `v-host-${env.id}`, key: 'host', value: defaultHostValue, enabled: true, isSecret: false },
          ...env.variables,
        ],
      };
    }
    return env;
  });
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
        setEnvironments(ensureHostVariable(res.environments));
        setError(null);
      } else {
        setEnvironments(ensureHostVariable([]));
        setError(res.error || 'Failed to load global environments');
      }
    } catch (err: any) {
      console.warn('useGlobalEnvironments: fallback to default environments:', err?.message || err);
      setEnvironments(ensureHostVariable([]));
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
