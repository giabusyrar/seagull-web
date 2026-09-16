'use client';

import { useState, useCallback } from 'react';
import { useRoutes as useLibRoutes, useAllRoutes } from '@/lib/hooks/use-collections';
import type { Route, TabItem, Collection, HttpMethod } from '@/types/api-client';

export function useRoutes(collections: Collection[]) {
  const {
    routesByCollection: allRoutesMap,
    groupsByCollection: allGroupsMap,
    refreshAll: refreshAllRoutes,
  } = useAllRoutes(collections);

  const [activeRoute, setActiveRoute] = useState<Route | null>(null);
  const [tabs, setTabs] = useState<TabItem[]>([
    { id: 'tab-overview', title: 'Overview', type: 'overview' },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-overview');
  const [isCreateRouteModalOpen, setIsCreateRouteModalOpen] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);

  const handleSelectRoute = useCallback((route: Route) => {
    setActiveRoute(route);
    // Add to tabs if not already present
    setTabs((prev) => {
      const exists = prev.some((t) => t.id === `route-${route.id}`);
      if (exists) return prev;
      return [
        ...prev,
        {
          id: `route-${route.id}`,
          title: route.name,
          method: route.method as HttpMethod,
          type: 'request',
          requestId: route.id,
        },
      ];
    });
    setActiveTabId(`route-${route.id}`);
  }, []);

  const handleCloseTab = useCallback((tabId: string) => {
    setTabs((prev) => {
      const filtered = prev.filter((t) => t.id !== tabId);
      if (activeTabId === tabId && filtered.length > 0) {
        // Fallback active tab
        const last = filtered[filtered.length - 1];
        setActiveTabId(last.id);
        if (last.type === 'request' && last.requestId) {
          // Find the active route
          const allRoutes = Object.values(allRoutesMap).flat();
          const route = allRoutes.find((r) => r.id === last.requestId);
          if (route) setActiveRoute(route);
        } else {
          setActiveRoute(null);
        }
      } else if (filtered.length === 0) {
        setActiveRoute(null);
      }
      return filtered;
    });
  }, [activeTabId, allRoutesMap]);

  return {
    allRoutesMap,
    allGroupsMap,
    refreshAllRoutes,
    activeRoute,
    setActiveRoute,
    tabs,
    setTabs,
    activeTabId,
    setActiveTabId,
    isCreateRouteModalOpen,
    setIsCreateRouteModalOpen,
    isCreateGroupModalOpen,
    setIsCreateGroupModalOpen,
    handleSelectRoute,
    handleCloseTab,
  };
}
