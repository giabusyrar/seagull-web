'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';
import type { Collection, RouteGroup, Route } from '@/types/api-client';

export function useCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<{ success: boolean; collections?: Collection[]; error?: string }>('/api/collections');
      if (res.success && res.collections) {
        setCollections(res.collections);
        setError(null);
      } else {
        setError(res.error || 'Failed to load collections');
      }
    } catch (err: any) {
      console.warn('useCollections: failed to fetch collections:', err?.message || err);
      setCollections([]);
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

  const createCollection = async (data: { name: string; type: 'proxy' | 'llm'; originalPrefix?: string; provider?: string }) => {
    const res = await apiPost<{ success: boolean; collection?: Collection; error?: string }>('/api/collections', data);
    if (res.success) await refresh();
    return res;
  };

  const updateCollection = async (id: string, data: Partial<Collection>) => {
    const res = await apiPut<{ success: boolean; collection?: Collection; error?: string }>(`/api/collections/${id}`, data);
    if (res.success) await refresh();
    return res;
  };

  const deleteCollection = async (id: string) => {
    const res = await apiDelete<{ success: boolean; error?: string }>(`/api/collections/${id}`);
    if (res.success) await refresh();
    return res;
  };

  const reorderCollections = async (collectionIds: string[]) => {
    try {
      const res = await apiPut<{ success: boolean; error?: string }>('/api/collections/reorder', { collectionIds });
      if (res.success) await refresh();
      return res;
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to reorder collections' };
    }
  };

  const convertCollectionToFolder = async (
    collectionId: string,
    targetCollectionId: string,
    targetParentGroupId?: string | null
  ): Promise<{ success: boolean; groupId?: string; error?: string }> => {
    try {
      const res = await apiPost<{ success: boolean; groupId?: string; error?: string }>(
        `/api/collections/${collectionId}/convert-to-folder`,
        { targetCollectionId, targetParentGroupId }
      );
      if (res.success) await refresh();
      return res;
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to convert collection to folder' };
    }
  };

  const convertFolderToCollection = async (
    collectionId: string,
    groupId: string
  ): Promise<{ success: boolean; collection?: Collection; error?: string }> => {
    try {
      const res = await apiPost<{ success: boolean; collection?: Collection; error?: string }>(
        `/api/collections/${collectionId}/route-groups/${groupId}/convert-to-collection`,
        {}
      );
      if (res.success) await refresh();
      return res;
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to convert folder to collection' };
    }
  };

  return {
    collections,
    loading,
    error,
    refresh,
    createCollection,
    updateCollection,
    deleteCollection,
    reorderCollections,
    convertCollectionToFolder,
    convertFolderToCollection,
  };
}

export function useRoutes(collectionId: string | null) {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [groups, setGroups] = useState<RouteGroup[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!collectionId) {
      setRoutes([]);
      setGroups([]);
      return;
    }
    setLoading(true);
    try {
      const [routesRes, groupsRes] = await Promise.all([
        apiGet<{ success: boolean; routes?: Route[] }>(`/api/collections/${collectionId}/routes`),
        apiGet<{ success: boolean; groups?: RouteGroup[] }>(`/api/collections/${collectionId}/route-groups`),
      ]);
      setRoutes(routesRes.success && routesRes.routes ? routesRes.routes : []);
      setGroups(groupsRes.success && groupsRes.groups ? groupsRes.groups : []);
    } catch (err: any) {
      console.warn(`useRoutes: failed to fetch routes for ${collectionId}:`, err?.message || err);
      setRoutes([]);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [collectionId]);

  useEffect(() => {
    // Initial data load on mount — synchronizing with the API is the intended
    // purpose of this effect, not a derived-state anti-pattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  const createRoute = async (data: Partial<Route>) => {
    if (!collectionId) return { success: false, error: 'No collection selected' };
    const res = await apiPost<{ success: boolean; route?: Route; error?: string }>(`/api/collections/${collectionId}/routes`, data);
    if (res.success) await refresh();
    return res;
  };

  const updateRoute = async (routeId: string, data: Partial<Route>) => {
    const targetColId = data.collectionId || collectionId;
    if (!targetColId) return { success: false, error: 'No collection selected' };
    const res = await apiPut<{ success: boolean; route?: Route; error?: string }>(`/api/collections/${targetColId}/routes`, { routeId, ...data });
    if (res.success) await refresh();
    return res;
  };

  const deleteRoute = async (routeId: string) => {
    if (!collectionId) return { success: false, error: 'No collection selected' };
    const res = await apiDelete<{ success: boolean; error?: string }>(`/api/collections/${collectionId}/routes?routeId=${routeId}`);
    if (res.success) await refresh();
    return res;
  };

  const createGroup = async (name: string, parentId?: string | null) => {
    if (!collectionId) return { success: false, error: 'No collection selected' };
    const res = await apiPost<{ success: boolean; group?: RouteGroup; error?: string }>(`/api/collections/${collectionId}/route-groups`, { name, parentId: parentId || undefined });
    if (res.success) await refresh();
    return res;
  };

  const deleteGroup = async (groupId: string, targetCollectionId?: string) => {
    const colId = targetCollectionId || collectionId;
    if (!colId) return { success: false, error: 'No collection selected' };
    const res = await apiDelete<{ success: boolean; error?: string }>(`/api/collections/${colId}/route-groups?groupId=${groupId}`);
    if (res.success) await refresh();
    return res;
  };

  const updateGroup = async (
    groupId: string,
    data: { name?: string; parentId?: string | null },
    targetCollectionId?: string
  ): Promise<{ success: boolean; group?: RouteGroup; error?: string }> => {
    const colId = targetCollectionId || collectionId;
    if (!colId) return { success: false, error: 'No collection selected' };
    try {
      const res = await apiPut<{ success: boolean; group?: RouteGroup; error?: string }>(
        `/api/collections/${colId}/route-groups/${groupId}`,
        data
      );
      if (res.success) {
        await refresh();
        return res;
      }
      return { success: false, error: res.error || 'Failed to update folder' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const moveRouteGroup = async (
    groupId: string,
    sourceCollectionId: string,
    targetCollectionId: string,
    targetParentId?: string | null
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await apiPut<{ success: boolean; error?: string }>(
        `/api/collections/${sourceCollectionId}/route-groups/move`,
        { groupId, targetCollectionId, targetParentId: targetParentId ?? null }
      );
      if (res.success) {
        await refresh();
        return { success: true };
      }
      return { success: false, error: res.error || 'Failed to move folder' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const reorderRouteGroups = async (
    collectionId: string,
    groupIds: string[]
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await apiPut<{ success: boolean; error?: string }>(
        `/api/collections/${collectionId}/route-groups/reorder`,
        { groupIds }
      );
      if (res.success) {
        await refresh();
        return { success: true };
      }
      return { success: false, error: res.error || 'Failed to reorder folders' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  return {
    routes,
    groups,
    loading,
    refresh,
    createRoute,
    updateRoute,
    deleteRoute,
    createGroup,
    updateGroup,
    deleteGroup,
    moveRouteGroup,
    reorderRouteGroups,
  };
}

export function useAllRoutes(collections: Collection[]) {
  const [routesByCollection, setRoutesByCollection] = useState<Record<string, Route[]>>({});
  const [groupsByCollection, setGroupsByCollection] = useState<Record<string, RouteGroup[]>>({});

  const fetchAll = useCallback(async () => {
    if (collections.length === 0) {
      setRoutesByCollection({});
      setGroupsByCollection({});
      return;
    }

    const routeResults = await Promise.all(
      collections.map(async (col) => {
        const [rRes, gRes] = await Promise.all([
          apiGet<{ success: boolean; routes?: Route[] }>(`/api/collections/${col.id}/routes`),
          apiGet<{ success: boolean; groups?: RouteGroup[] }>(`/api/collections/${col.id}/route-groups`),
        ]);
        return {
          id: col.id,
          routes: rRes.success && rRes.routes ? rRes.routes : [],
          groups: gRes.success && gRes.groups ? gRes.groups : [],
        };
      })
    );

    const routesMap: Record<string, Route[]> = {};
    const groupsMap: Record<string, RouteGroup[]> = {};
    routeResults.forEach((res) => {
      routesMap[res.id] = res.routes;
      groupsMap[res.id] = res.groups;
    });

    setRoutesByCollection(routesMap);
    setGroupsByCollection(groupsMap);
  }, [collections]);

  useEffect(() => {
    // Initial data load on mount — synchronizing with the API is the intended
    // purpose of this effect, not a derived-state anti-pattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAll();
  }, [fetchAll]);

  return { routesByCollection, groupsByCollection, refreshAll: fetchAll };
}
