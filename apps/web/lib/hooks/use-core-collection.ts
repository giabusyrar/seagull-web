'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  DynamicCollection,
  getActiveCoreCollections,
  resolveDynamicEndpoint,
  CoreCollectionKey,
} from '@gateway-experience/studio/core';

/**
 * Custom React Hook to dynamically resolve API Gateway Core Collections & Routes
 * Enables parameterized, zero-hardcode Try-On and Studio operations.
 */
export function useCoreCollection() {
  const [collections, setCollections] = useState<DynamicCollection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCollections = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const cols = await getActiveCoreCollections(forceRefresh);
      setCollections(cols);
    } catch (err: any) {
      setError(err?.message || 'Failed to load core engine collections');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  /**
   * Resolves dynamic endpoint path for a given core collection
   */
  const getEndpoint = useCallback(
    (key: CoreCollectionKey, routePattern: string) => {
      return resolveDynamicEndpoint(key, routePattern, collections);
    },
    [collections]
  );

  /**
   * Dispatches a dynamic API call to a Core Collection endpoint
   */
  const executeCollectionRoute = useCallback(
    async <T = any>(
      key: CoreCollectionKey,
      routePattern: string,
      init?: RequestInit
    ): Promise<{ data: T | null; error: string | null; status: number }> => {
      const endpoint = resolveDynamicEndpoint(key, routePattern, collections);
      try {
        const res = await fetch(endpoint, {
          ...init,
          headers: {
            'Content-Type': 'application/json',
            ...(init?.headers || {}),
          },
        });

        const status = res.status;
        const text = await res.text();
        let json: any = null;
        try {
          json = JSON.parse(text);
        } catch {
          json = text;
        }

        if (!res.ok) {
          const errMsg = json?.error || json?.message || `HTTP ${status}: ${text || 'Request failed'}`;
          return { data: null, error: errMsg, status };
        }

        return { data: json as T, error: null, status };
      } catch (err: any) {
        return { data: null, error: err?.message || 'Network request failed', status: 500 };
      }
    },
    [collections]
  );

  return {
    collections,
    loading,
    error,
    refresh: () => fetchCollections(true),
    getEndpoint,
    executeCollectionRoute,
  };
}
