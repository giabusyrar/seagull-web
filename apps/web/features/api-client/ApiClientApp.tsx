'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ApiClientHeader } from './ApiClientHeader';
import { ApiClientTabBar } from './ApiClientTabBar';
import { ApiClientSidebar, HistoryItem } from './sidebar';
import { ApiClientWorkbench } from '@/features/workbench';
import { ApiClientAIPanel } from './ApiClientAIPanel';
import { ApiClientEnvironmentModal } from '@/features/environments';
import { ApiClientOverview } from './ApiClientOverview';
import { InviteModal, SettingsModal, ConsoleDrawer } from './modals';
import { CreateRouteModal, CreateGroupModal, GroupSettingsModal, ApiClientRouteEditor } from '@/features/routes';
import { ApiClientCollectionSettingsModal } from '@/features/collections';
import { ApiClientApiKeysView } from '@/features/api-keys';
import { FormManager } from '@gateway-experience/studio/form';
import { ScoreManager } from '@gateway-experience/studio/score';
import { MatchManager } from '@gateway-experience/studio/match';
import { ReferenceManager } from '@gateway-experience/studio/reference';
import { VisionEngineView } from '@/features/vision';
import { TryOnEngineView } from '@/features/colour';
import { PipelineSimulatorView } from '@/features/orchestrator/PipelineSimulatorView';
import { AssessmentRecordsView } from '@/features/assessments';
import { ApplicationsView } from '@/features/applications/ApplicationsView';

import { ConfirmDialog } from '@gateway-experience/shared';
import { useToast } from '@/components/ui/toast';
import type {
  ApiClientRequest,
  TabItem,
  ResponseData,
  Route,
  RouteGroup,
  Collection,
} from '@/types/api-client';
import { executeHttpRequest, formatJsonString } from '@/lib/api-client-utils';
import { useCollections, useRoutes, useAllRoutes } from '@/lib/hooks/use-collections';
import { useGlobalEnvironments } from '@/lib/hooks/use-global-environments';
import { MissingHostModal } from './MissingHostModal';
import { TabVisibilityContext } from '@/lib/hooks/use-tab-visibility';

// Which tabs and routes were open, so a reload reopens the same workspace.
// Only the layout is stored here: what is typed inside an engine or a route's
// Try & Send lives in that component, and survives tab switches because
// opened views stay mounted (see KeptView) rather than unmounting.
// Request tabs are left out — their drafts can carry File objects that do
// not serialize.
const WORKSPACE_STORAGE_KEY = 'xg_api_client_workspace';
const ACTIVE_ENV_STORAGE_KEY = 'xg_active_global_env_id';

interface PersistedWorkspace {
  tabs: TabItem[];
  activeTabId: string;
  openRouteIds: string[];
  activeRouteId: string | null;
}

function loadWorkspace(): PersistedWorkspace | null {
  try {
    const raw = localStorage.getItem(WORKSPACE_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PersistedWorkspace) : null;
  } catch {
    return null;
  }
}

/**
 * Hides an opened view with display:none instead of unmounting it, so what
 * was typed and the last result are still there when its tab is reopened.
 * React's <Activity> was tried first and rejected: it re-runs effects on
 * reveal, and several builders reset their form in an "on open" effect.
 * Views that hold a device (camera) read TabVisibilityContext to release it.
 */
function KeptView({ visible, children }: { visible: boolean; children: React.ReactNode }) {
  return (
    <TabVisibilityContext.Provider value={visible}>
      <div className={visible ? 'contents' : 'hidden'}>{children}</div>
    </TabVisibilityContext.Provider>
  );
}

function createDefaultRequest(): ApiClientRequest {
  return {
    id: 'req-' + Date.now(),
    name: 'Untitled Request',
    method: 'GET',
    url: '',
    params: [{ id: 'p1', key: '', value: '', enabled: true }],
    headers: [{ id: 'h1', key: '', value: '', enabled: true }],
    body: '{}',
    bodyType: 'json',
  };
}

export function ApiClientApp() {
  const { toastSuccess, toastError } = useToast();
  const {
    collections: realCollections,
    refresh: refreshCollections,
    createCollection,
    updateCollection,
    deleteCollection,
    reorderCollections,
    convertCollectionToFolder,
    convertFolderToCollection,
  } = useCollections();
  const { routesByCollection: allRoutesMap, groupsByCollection: allGroupsMap, refreshAll: refreshAllRoutes } = useAllRoutes(realCollections);
  const { environments, setEnvironments, createEnvironment, updateEnvironment } = useGlobalEnvironments();
  const [expandedCollectionId, setExpandedCollectionId] = useState<string | null>(null);
  const [targetCollectionId, setTargetCollectionId] = useState<string | null>(null);
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  const { refresh: refreshRoutes, updateRoute, deleteRoute, updateGroup, deleteGroup, moveRouteGroup, reorderRouteGroups } = useRoutes(expandedCollectionId);
  const { createRoute: createRouteTarget, createGroup: createGroupTarget } = useRoutes(targetCollectionId);
  const [activeRoute, setActiveRoute] = useState<Route | null>(null);
  // Every route opened this session keeps its editor mounted, so switching
  // away and back does not lose an in-progress Try & Send.
  const [openRoutes, setOpenRoutes] = useState<Route[]>([]);
  useEffect(() => {
    if (!activeRoute) return;
    // Mirrors activeRoute (including saves that replace it) into the set of
    // mounted editors.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpenRoutes((prev) =>
      prev.some((r) => r.id === activeRoute.id)
        ? prev.map((r) => (r.id === activeRoute.id ? activeRoute : r))
        : [...prev, activeRoute]
    );
  }, [activeRoute]);
  const closeRoutes = useCallback((predicate: (r: Route) => boolean) => {
    setOpenRoutes((prev) => prev.filter((r) => !predicate(r)));
    setActiveRoute((prev) => (prev && predicate(prev) ? null : prev));
  }, []);
  const [settingsCollection, setSettingsCollection] = useState<Collection | null>(null);
  const [targetParentGroupId, setTargetParentGroupId] = useState<string | null>(null);
  const [targetGroupIdForRoute, setTargetGroupIdForRoute] = useState<string | null>(null);
  const [editingGroup, setEditingGroup] = useState<{ group: RouteGroup; colId: string } | null>(null);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [isCreateRouteModalOpen, setIsCreateRouteModalOpen] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);

  const handleOpenAddRoute = (collectionId: string, groupId?: string | null) => {
    setTargetCollectionId(collectionId);
    setExpandedCollectionId(collectionId);
    setTargetGroupIdForRoute(groupId || null);
    setIsCreateRouteModalOpen(true);
  };

  const handleOpenAddGroup = (collectionId: string, parentId?: string | null) => {
    setTargetCollectionId(collectionId);
    setExpandedCollectionId(collectionId);
    setTargetParentGroupId(parentId || null);
    setIsCreateGroupModalOpen(true);
  };

  const handleDeleteCollection = (collection: Collection) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Collection',
      message: `Are you sure you want to delete collection "${collection.name}"?`,
      onConfirm: async () => {
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
        const res = await deleteCollection(collection.id);
        if (res.success) {
          toastSuccess('Collection Deleted', `Collection ${collection.name} deleted.`);
          if (expandedCollectionId === collection.id) {
            setExpandedCollectionId(null);
          }
          closeRoutes((r) => r.collectionId === collection.id);
        } else {
          toastError('Delete Failed', res.error || 'Failed to delete collection');
        }
      },
    });
  };

  const initialRequest = createDefaultRequest();
  const [openRequests, setOpenRequests] = useState<ApiClientRequest[]>([]);
  const [tabs, setTabs] = useState<TabItem[]>([
    { id: 'tab-overview', title: 'Overview', type: 'overview' },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-overview');
  const [activeRequest, setActiveRequest] = useState<ApiClientRequest>(initialRequest);

  // Restored after mount, not in the useState initializers: this component is
  // server-rendered on /api-client, where localStorage does not exist.
  const [workspaceRestored, setWorkspaceRestored] = useState(false);
  const [pendingRestore, setPendingRestore] = useState<Pick<PersistedWorkspace, 'openRouteIds' | 'activeRouteId'> | null>(null);
  useEffect(() => {
    const saved = loadWorkspace();
    /* eslint-disable react-hooks/set-state-in-effect -- one-time restore from localStorage */
    if (saved) {
      const savedTabs = (saved.tabs || []).filter((t) => t.type !== 'request');
      if (savedTabs.length > 0) {
        setTabs(savedTabs);
        setActiveTabId(savedTabs.some((t) => t.id === saved.activeTabId) ? saved.activeTabId : savedTabs[0].id);
      }
      if (saved.openRouteIds?.length) {
        setPendingRestore({ openRouteIds: saved.openRouteIds, activeRouteId: saved.activeRouteId });
      }
    }
    setWorkspaceRestored(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Saved routes can only be reopened once their collections' routes load.
  useEffect(() => {
    if (!pendingRestore || Object.keys(allRoutesMap).length === 0) return;
    const byId = new Map(Object.values(allRoutesMap).flat().map((r) => [r.id, r]));
    const restored = pendingRestore.openRouteIds.map((id) => byId.get(id)).filter((r): r is Route => !!r);
    const active = pendingRestore.activeRouteId ? byId.get(pendingRestore.activeRouteId) : undefined;
    /* eslint-disable react-hooks/set-state-in-effect -- resolving the restore above once data arrives */
    setOpenRoutes(restored);
    if (active) {
      setActiveRoute(active);
      setExpandedCollectionId(active.collectionId);
    }
    setPendingRestore(null);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [pendingRestore, allRoutesMap]);

  useEffect(() => {
    if (!workspaceRestored || pendingRestore) return;
    const persistedTabs = tabs.filter((t) => t.type !== 'request');
    const workspace: PersistedWorkspace = {
      tabs: persistedTabs,
      activeTabId: persistedTabs.some((t) => t.id === activeTabId) ? activeTabId : persistedTabs[0]?.id || '',
      openRouteIds: openRoutes.map((r) => r.id),
      activeRouteId: activeRoute?.id || null,
    };
    try {
      localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(workspace));
    } catch (e) {
      console.error('Failed to persist API client workspace', e);
    }
  }, [workspaceRestored, pendingRestore, tabs, activeTabId, openRoutes, activeRoute]);

  // Starts empty and is restored by the effect below once environments load.
  // Reading localStorage in the initializer made the client's first render
  // differ from the server HTML on /api-client (a hydration mismatch).
  const [selectedEnvId, setSelectedEnvId] = useState<string>('');

  const handleSelectEnv = useCallback((id: string) => {
    setSelectedEnvId(id);
    if (typeof window !== 'undefined') {
      if (id) {
        localStorage.setItem(ACTIVE_ENV_STORAGE_KEY, id);
      } else {
        localStorage.removeItem(ACTIVE_ENV_STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (environments.length > 0) {
      const savedId = typeof window !== 'undefined' ? localStorage.getItem(ACTIVE_ENV_STORAGE_KEY) : null;
      const savedEnvExists = savedId && environments.some((e) => e.id === savedId);
      if (savedEnvExists && savedId !== selectedEnvId) {
        setSelectedEnvId(savedId);
      } else if (!selectedEnvId && !savedEnvExists) {
        const defaultEnv = environments.find((e) => e.isDefault) || environments[0];
        if (defaultEnv) {
          handleSelectEnv(defaultEnv.id);
        }
      }
    }
  }, [environments, selectedEnvId, handleSelectEnv]);

  const currentEnvVars = React.useMemo(() => {
    const map: Record<string, string> = {};
    const selectedEnv = environments.find((e) => e.id === selectedEnvId) || environments.find((e) => e.isDefault) || environments[0];
    if (selectedEnv) {
      selectedEnv.variables.forEach((v) => {
        if (v.enabled) map[v.key] = v.value;
      });
    }
    return map;
  }, [environments, selectedEnvId]);
  const [isEnvModalOpen, setIsEnvModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    `Falcon Console initialized. Active environment: Development.`,
  ]);

  const [response, setResponse] = useState<ResponseData | null>(null);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isMissingHostModalOpen, setIsMissingHostModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleToggleSidebar = useCallback(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsMobileOpen((prev) => !prev);
    } else {
      setIsSidebarCollapsed((prev) => !prev);
    }
  }, []);

  const handleAutoFixHost = useCallback(() => {
    const defaultHost =
      process.env.NEXT_PUBLIC_GATEWAY_PROXY_URL ||
      (typeof window !== 'undefined' ? window.location.origin : '');

    const activeEnv = environments.find((e) => e.id === selectedEnvId) || environments[0];
    if (activeEnv) {
      const updatedEnvs = environments.map((e) => {
        if (e.id === activeEnv.id) {
          const hasHost = e.variables.some((v) => v.key.trim().toLowerCase() === 'host');
          const newVars = hasHost
            ? e.variables.map((v) => (v.key.trim().toLowerCase() === 'host' ? { ...v, value: defaultHost, enabled: true } : v))
            : [{ id: 'v-host-' + Date.now(), key: 'host', value: defaultHost, enabled: true, isSecret: false }, ...e.variables];
          return { ...e, variables: newVars };
        }
        return e;
      });
      setEnvironments(updatedEnvs);
    }
    setIsMissingHostModalOpen(false);
    toastSuccess('Host Variable Configured', `Set host to ${defaultHost}`);
  }, [environments, selectedEnvId, setEnvironments, toastSuccess]);

  const handleGoToOverview = () => {
    const existingOverviewTab = tabs.find((t) => t.type === 'overview');
    if (existingOverviewTab) {
      setActiveTabId(existingOverviewTab.id);
    } else {
      const overviewTabId = 'tab-overview';
      setTabs((prev) => [{ id: overviewTabId, title: 'Overview', type: 'overview' }, ...prev]);
      setActiveTabId(overviewTabId);
    }
  };

  const handleOpenApiKeys = () => {
    setActiveRoute(null);
    const existing = tabs.find((t) => t.type === 'api-keys');
    if (existing) {
      setActiveTabId(existing.id);
    } else {
      const id = 'tab-api-keys';
      setTabs((prev) => [...prev, { id, title: 'API Keys', type: 'api-keys' }]);
      setActiveTabId(id);
    }
  };

  const handleOpenForms = () => {
    setActiveRoute(null);
    const existing = tabs.find((t) => t.type === 'forms');
    if (existing) {
      setActiveTabId(existing.id);
    } else {
      const id = 'tab-forms';
      setTabs((prev) => [...prev, { id, title: 'Form Engine', type: 'forms' }]);
      setActiveTabId(id);
    }
  };

  const handleOpenScoring = () => {
    setActiveRoute(null);
    const existing = tabs.find((t) => t.type === 'scoring');
    if (existing) {
      setActiveTabId(existing.id);
    } else {
      const id = 'tab-scoring';
      setTabs((prev) => [...prev, { id, title: 'Scoring Engine', type: 'scoring' }]);
      setActiveTabId(id);
    }
  };

  const handleOpenMatching = () => {
    setActiveRoute(null);
    const existing = tabs.find((t) => t.type === 'matching');
    if (existing) {
      setActiveTabId(existing.id);
    } else {
      const id = 'tab-matching';
      setTabs((prev) => [...prev, { id, title: 'Matching Engine', type: 'matching' }]);
      setActiveTabId(id);
    }
  };

  const handleOpenVision = () => {
    setActiveRoute(null);
    const existing = tabs.find((t) => t.type === 'vision');
    if (existing) {
      setActiveTabId(existing.id);
    } else {
      const id = 'tab-vision';
      setTabs((prev) => [...prev, { id, title: 'Vision Engine', type: 'vision' }]);
      setActiveTabId(id);
    }
  };

  const handleOpenTryOn = () => {
    setActiveRoute(null);
    const existing = tabs.find((t) => t.type === 'tryon');
    if (existing) {
      setActiveTabId(existing.id);
    } else {
      const id = 'tab-tryon';
      setTabs((prev) => [...prev, { id, title: 'Try-On Engine', type: 'tryon' }]);
      setActiveTabId(id);
    }
  };

  const handleOpenAssessments = () => {
    setActiveRoute(null);
    const existing = tabs.find((t) => t.type === 'assessments');
    if (existing) {
      setActiveTabId(existing.id);
    } else {
      const id = 'tab-assessments';
      setTabs((prev) => [...prev, { id, title: 'Master Data: Assessments', type: 'assessments' }]);
      setActiveTabId(id);
    }
  };

  const handleOpenApplications = () => {
    setActiveRoute(null);
    const existing = tabs.find((t) => t.type === 'applications');
    if (existing) {
      setActiveTabId(existing.id);
    } else {
      const id = 'tab-applications';
      setTabs((prev) => [...prev, { id, title: 'Master Data: Applications', type: 'applications' }]);
      setActiveTabId(id);
    }
  };

  const handleOpenReference = (entity?: string) => {
    setActiveRoute(null);
    const key = entity || 'brands';
    const tabId = `tab-reference-${key}`;
    const titleMap: Record<string, string> = {
      brand: 'Reference: Brands',
      brands: 'Reference: Brands',
      product: 'Reference: Products',
      products: 'Reference: Products',
      status: 'Reference: Statuses',
      ingredient: 'Reference: Ingredients',
      ingredients: 'Reference: Ingredients',
      dimension: 'Reference: Dimensions',
      dimensions: 'Reference: Dimensions',
      condition: 'Reference: Conditions',
      conditions: 'Reference: Conditions',
    };
    const title = titleMap[key] || `Reference: ${key}`;

    const existing = tabs.find((t) => t.id === tabId);
    if (existing) {
      setActiveTabId(existing.id);
    } else {
      setTabs((prev) => [...prev, { id: tabId, title, type: 'reference', entity: key }]);
      setActiveTabId(tabId);
    }
  };

  const handleSendRequest = useCallback(async () => {
    const hostValue = currentEnvVars['host'];
    if (!hostValue || !hostValue.trim()) {
      setIsMissingHostModalOpen(true);
      return;
    }

    setIsSending(true);

    const envMap: Record<string, string> = { ...currentEnvVars };

    const timeStr = new Date().toLocaleTimeString();
    setConsoleLogs((prev) => [
      ...prev,
      `[${timeStr}] Outgoing ${activeRequest.method} -> ${activeRequest.url}`,
    ]);

    const autoRoutingHeaders: Record<string, string> = {};
    const activeGlobalEnv = environments.find((e) => e.id === selectedEnvId);
    if (activeGlobalEnv) {
      autoRoutingHeaders['X-Environment'] = activeGlobalEnv.name;
      autoRoutingHeaders['X-Global-Environment'] = activeGlobalEnv.name;
    }

    try {
      const res = await executeHttpRequest(
        activeRequest.method,
        activeRequest.url,
        activeRequest.params,
        activeRequest.headers,
        activeRequest.body,
        envMap,
        autoRoutingHeaders
      );
      setResponse(res);

      setConsoleLogs((prev) => [
        ...prev,
        `[${timeStr}] Response ${res.status} ${res.statusText} (${res.latency}ms, ${res.size})`,
      ]);

      setHistory((prev) => [
        {
          id: 'hist-' + Date.now(),
          request: { ...activeRequest },
          response: res,
          timestamp: Date.now(),
        },
        ...prev,
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Execution failed';
      setResponse({
        status: 500,
        statusText: 'Internal Error',
        latency: 0,
        size: '0 B',
        headers: {},
        body: null,
        error: message,
      });
      setConsoleLogs((prev) => [...prev, `[${timeStr}] ERROR: ${message}`]);
    } finally {
      setIsSending(false);
    }
  }, [activeRequest, currentEnvVars, environments, selectedEnvId]);

  const handleSelectTab = (id: string) => {
    setActiveTabId(id);
    const tab = tabs.find((t) => t.id === id);
    if (tab && tab.type === 'request') {
      setActiveRoute(null);
      if (tab.requestId) {
        const found = openRequests.find((r) => r.id === tab.requestId);
        if (found) {
          setActiveRequest(found);
        }
      }
    } else if (tab && tab.type !== 'request') {
      setActiveRoute(null);
    }
  };

  const handleCloseTab = (id: string) => {
    if (tabs.length <= 1) return;
    const remaining = tabs.filter((t) => t.id !== id);
    setTabs(remaining);
    if (activeTabId === id) {
      handleSelectTab(remaining[remaining.length - 1].id);
    }
  };

  const handleNewTab = useCallback(() => {
    const newReq = createDefaultRequest();
    const newTabId = 'tab-' + newReq.id;

    setActiveRoute(null);
    setOpenRequests((prev) => [...prev, newReq]);
    setActiveRequest(newReq);
    setTabs((prev) => [...prev, { id: newTabId, title: newReq.name, method: newReq.method, requestId: newReq.id, type: 'request' }]);
    setActiveTabId(newTabId);
  }, []);

  const handleUpdateRequest = (updated: ApiClientRequest) => {
    setActiveRequest(updated);
    setOpenRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setTabs((prev) =>
      prev.map((t) =>
        t.requestId === updated.id ? { ...t, title: updated.name, method: updated.method, isDirty: true } : t
      )
    );
  };

  const handleSelectRequestFromSidebar = (req: ApiClientRequest, res?: ResponseData) => {
    handleUpdateRequest(req);
    if (res) setResponse(res);
  };

  const handleApplyAiPayload = (body: string) => {
    const formatted = formatJsonString(body);
    handleUpdateRequest({ ...activeRequest, body: formatted });
    toastSuccess('AI Payload Applied', 'Applied AI payload to request body.');
  };

  const activeTabObj = tabs.find((t) => t.id === activeTabId);

  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden select-none font-sans text-foreground">
      <ApiClientEnvironmentModal
        isOpen={isEnvModalOpen}
        environments={environments}
        selectedEnvId={selectedEnvId}
        onClose={() => setIsEnvModalOpen(false)}
        onUpdateEnvironments={(envs) => setEnvironments(envs)}
        onSelectEnv={handleSelectEnv}
      />

      <MissingHostModal
        isOpen={isMissingHostModalOpen}
        activeEnvName={(environments.find((e) => e.id === selectedEnvId) || environments[0])?.name || 'Default'}
        onClose={() => setIsMissingHostModalOpen(false)}
        onAutoFixHost={handleAutoFixHost}
        onOpenGlobalEnvs={() => {
          setIsMissingHostModalOpen(false);
          setIsEnvModalOpen(true);
        }}
      />

      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      {/* Top Main Navigation Header */}
      <ApiClientHeader
        isAiOpen={isAiOpen}
        onToggleAi={() => setIsAiOpen(!isAiOpen)}
        onNewRequest={handleNewTab}
        onOpenInvite={() => setIsInviteModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onGoToOverview={handleGoToOverview}
        onSearchChange={() => {}}
        onOpenApiKeys={handleOpenApiKeys}
        onToggleSidebar={handleToggleSidebar}
      />

      {/* Workspace Sub-Header Tab Bar */}
      <ApiClientTabBar
        tabs={tabs}
        activeTabId={activeTabId}
        environments={environments}
        selectedEnvId={selectedEnvId}
        onSelectTab={handleSelectTab}
        onCloseTab={handleCloseTab}
        onNewTab={handleNewTab}
        onSelectEnv={handleSelectEnv}
        onOpenEnvironmentsModal={() => setIsEnvModalOpen(true)}
        onTrySend={handleSendRequest}
        onSave={() => toastSuccess('Request Saved', `Saved request "${activeRequest.name}"`)}
      />

      {/* Main App Body */}
      <div className="flex-1 flex overflow-hidden min-h-0 w-full">
        <ApiClientSidebar
          history={history}
          onSelectRequest={handleSelectRequestFromSidebar}
          collections={realCollections}
          expandedCollectionId={expandedCollectionId}
          routesByCollection={allRoutesMap}
          groupsByCollection={allGroupsMap}
          activeRouteId={activeRoute?.id}
          onSelectRoute={(route) => setActiveRoute(route)}
          onExpandCollection={(id) => setExpandedCollectionId((prev) => (prev === id ? null : id))}
          onOpenCollectionSettings={(col) => {
            setSettingsCollection(col);
            setIsCollectionModalOpen(true);
          }}
          onDeleteCollection={handleDeleteCollection}
          onDeleteRoute={(route) => {
            setConfirmConfig({
              isOpen: true,
              title: 'Delete Route',
              message: `Are you sure you want to delete route "${route.name}"?`,
              onConfirm: async () => {
                setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
                const res = await deleteRoute(route.id);
                if (res.success) {
                  toastSuccess('Route Deleted', `Route ${route.name} deleted.`);
                  await refreshAllRoutes();
                  closeRoutes((r) => r.id === route.id);
                } else {
                  toastError('Delete Failed', res.error || 'Failed to delete route');
                }
              },
            });
          }}
          onAddCollection={() => {
            setSettingsCollection(null);
            setIsCollectionModalOpen(true);
          }}
          onAddRoute={handleOpenAddRoute}
          onAddGroup={handleOpenAddGroup}
          onOpenGroupSettings={(group, collectionId) => setEditingGroup({ group, colId: collectionId })}
          onDeleteGroup={(group, collectionId) => {
            setConfirmConfig({
              isOpen: true,
              title: 'Delete Folder',
              message: `Are you sure you want to delete folder "${group.name}"? Routes inside will be moved to the collection root.`,
              onConfirm: async () => {
                setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
                const res = await deleteGroup(group.id, collectionId);
                if (res.success) {
                  toastSuccess('Folder Deleted', `Folder "${group.name}" deleted. Contained routes moved to collection root.`);
                  await refreshAllRoutes();
                } else {
                  toastError('Delete Failed', res.error || 'Failed to delete folder');
                }
              },
            });
          }}
          onMoveRouteToGroup={async (routeId, groupId, collectionId) => {
            const res = await updateRoute(routeId, { groupId, collectionId });
            if (res.success) {
              await refreshAllRoutes();
              if (activeRoute?.id === routeId) {
                setActiveRoute((prev) => (prev ? { ...prev, groupId, collectionId } : null));
              }
            }
          }}
          onMoveGroupToCollection={async (groupId, targetCollectionId, sourceCollectionId, targetParentId) => {
            const targetCol = realCollections.find((c) => c.id === targetCollectionId);
            const res = await moveRouteGroup(groupId, sourceCollectionId, targetCollectionId, targetParentId);
            if (res.success) {
              toastSuccess('Folder Moved', `Folder moved to ${targetCol?.name || 'target'}.`);
              await refreshAllRoutes();
              if (activeRoute && activeRoute.groupId === groupId) {
                setActiveRoute((prev) => (prev ? { ...prev, collectionId: targetCollectionId } : null));
              }
            } else {
              toastError('Move Failed', res.error || 'Failed to move folder');
            }
          }}
          onUpdateCollectionParent={async (collectionId, parentId) => {
            const res = await updateCollection(collectionId, { parentId });
            if (!res.success) {
              toastError('Update Failed', res.error || 'Failed to move collection');
            }
            await Promise.all([refreshCollections(), refreshAllRoutes()]);
          }}
          onConvertCollectionToFolder={async (collectionId, targetCollectionId, targetParentGroupId) => {
            const res = await convertCollectionToFolder(collectionId, targetCollectionId, targetParentGroupId);
            if (res.success) {
              toastSuccess('Collection Converted', 'Collection converted to folder in target collection.');
              setExpandedCollectionId(targetCollectionId);
              await Promise.all([refreshCollections(), refreshAllRoutes()]);
            } else {
              toastError('Conversion Failed', res.error || 'Failed to convert collection to folder');
            }
          }}
          onConvertFolderToCollection={async (collectionId, groupId) => {
            const res = await convertFolderToCollection(collectionId, groupId);
            if (res.success) {
              toastSuccess('Folder Extracted', 'Folder converted to root collection.');
              if (res.collection?.id) {
                setExpandedCollectionId(res.collection.id);
              }
              await Promise.all([refreshCollections(), refreshAllRoutes()]);
            } else {
              toastError('Conversion Failed', res.error || 'Failed to convert folder to collection');
            }
          }}
          onReorderCollections={async (collectionIds) => {
            const res = await reorderCollections(collectionIds);
            if (!res.success) {
              toastError('Reorder Failed', res.error || 'Failed to update collection order');
              await refreshCollections();
            }
          }}
          onReorderGroups={async (collectionId, groupIds) => {
            const res = await reorderRouteGroups(collectionId, groupIds);
            if (!res.success) {
              toastError('Reorder Failed', res.error || 'Failed to update folder order');
              await refreshAllRoutes();
            } else {
              await refreshAllRoutes();
            }
          }}
          globalEnvironments={environments}
          onOpenGlobalEnvironmentsModal={() => setIsEnvModalOpen(true)}
          onOpenForms={handleOpenForms}
          onOpenScoring={handleOpenScoring}
          onOpenMatching={handleOpenMatching}
          onOpenVision={handleOpenVision}
          onOpenTryOn={handleOpenTryOn}
          onOpenAssessments={handleOpenAssessments}
          onOpenApplications={handleOpenApplications}
          onOpenReference={handleOpenReference}
          onOpenApiKeys={handleOpenApiKeys}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          isMobileOpen={isMobileOpen}
          onCloseMobile={() => setIsMobileOpen(false)}
        />

        {isCollectionModalOpen && (
          <ApiClientCollectionSettingsModal
            collection={settingsCollection}
            onClose={() => {
              setIsCollectionModalOpen(false);
              setSettingsCollection(null);
            }}
            onCollectionUpdated={async () => {
              await Promise.all([refreshCollections(), refreshAllRoutes()]);
            }}
          />
        )}

        <CreateRouteModal
          isOpen={isCreateRouteModalOpen}
          onClose={() => {
            setIsCreateRouteModalOpen(false);
            setTargetGroupIdForRoute(null);
          }}
          collectionPrefix={realCollections.find((c) => c.id === targetCollectionId)?.originalPrefix || ''}
          targetHost={realCollections.find((c) => c.id === targetCollectionId)?.activeTargetHost || ''}
          collectionType={realCollections.find((c) => c.id === targetCollectionId)?.type as any}
          groups={targetCollectionId ? allGroupsMap[targetCollectionId] || [] : []}
          initialGroupId={targetGroupIdForRoute || undefined}
          onCreate={async (data) => {
            const res = await createRouteTarget(data);
            if (res.success) {
              if (targetCollectionId) setExpandedCollectionId(targetCollectionId);
              await Promise.all([refreshRoutes(), refreshAllRoutes()]);
              if (res.route) setActiveRoute(res.route);
            }
            return res;
          }}
        />

        <CreateGroupModal
          isOpen={isCreateGroupModalOpen}
          groups={targetCollectionId ? allGroupsMap[targetCollectionId] || [] : []}
          initialParentId={targetParentGroupId}
          onClose={() => {
            setIsCreateGroupModalOpen(false);
            setTargetParentGroupId(null);
          }}
          onCreate={async (name, parentId) => {
            const res = await createGroupTarget(name, parentId !== undefined ? parentId : targetParentGroupId);
            if (res.success) {
              await refreshAllRoutes();
            }
            return res;
          }}
        />

        <GroupSettingsModal
          isOpen={!!editingGroup}
          onClose={() => setEditingGroup(null)}
          group={editingGroup?.group || null}
          groups={editingGroup ? allGroupsMap[editingGroup.colId] || [] : []}
          collectionName={editingGroup ? realCollections.find(c => c.id === editingGroup.colId)?.name : undefined}
          onUpdate={async (groupId, data) => {
            if (!editingGroup) return { success: false, error: 'No folder selected' };
            const res = await updateGroup(groupId, data, editingGroup.colId);
            if (res.success) {
              toastSuccess('Folder Updated', 'Folder settings saved successfully.');
              await refreshAllRoutes();
            } else {
              toastError('Update Failed', res.error || 'Failed to update folder');
            }
            return res;
          }}
        />

        <ApiClientEnvironmentModal
          isOpen={isEnvModalOpen}
          environments={environments}
          selectedEnvId={selectedEnvId}
          onClose={() => setIsEnvModalOpen(false)}
          onSelectEnv={handleSelectEnv}
          onUpdateEnvironments={async (newEnvs) => {
            setEnvironments(newEnvs);
            // Sync with backend API
            for (const env of newEnvs) {
              const existing = environments.find((e) => e.id === env.id);
              if (!existing) {
                await createEnvironment(env.name, env.variables);
              } else {
                await updateEnvironment(env.id, { name: env.name, variables: env.variables });
              }
            }
          }}
        />

        {/* Center Content. Route editors and engine/reference tabs stay
            mounted once opened (KeptView), keeping their inputs and results
            across tab switches. */}
        {openRoutes.map((route) => {
          const isVisible = activeRoute?.id === route.id;
          const col = realCollections.find((c) => c.id === route.collectionId);
          return (
            <KeptView key={`route-${route.id}`} visible={isVisible}>
              {!col ? (
                <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground italic">Loading collection details...</div>
              ) : (
                <ApiClientRouteEditor
                  route={route}
                  collection={col}
                  groups={allGroupsMap[col.id] || []}
                  globalEnvVars={currentEnvVars}
                  globalEnvironments={environments}
                  onSave={async (routeId, data) => {
                    const res = await updateRoute(routeId, data);
                    if (res.success) {
                      await refreshAllRoutes();
                      if (res.route) setActiveRoute(res.route);
                    }
                    return res;
                  }}
                  onOpenCollectionSettings={(col) => setSettingsCollection(col)}
                  onCollectionUpdated={refreshCollections}
                />
              )}
            </KeptView>
          );
        })}
        {tabs
          .filter((tab) => tab.type !== 'request')
          .map((tab) => (
            <KeptView key={tab.id} visible={!activeRoute && tab.id === activeTabId}>
              {tab.type === 'forms' ? (
                <FormManager />
              ) : tab.type === 'scoring' ? (
                <ScoreManager />
              ) : tab.type === 'matching' ? (
                <MatchManager />
              ) : tab.type === 'vision' ? (
                <VisionEngineView />
              ) : tab.type === 'tryon' ? (
                <TryOnEngineView />
              ) : tab.type === 'pipeline' ? (
                <PipelineSimulatorView />
              ) : tab.type === 'assessments' ? (
                <AssessmentRecordsView />
              ) : tab.type === 'applications' ? (
                <ApplicationsView />
              ) : tab.type === 'reference' ? (
                <ReferenceManager initialEntity={tab.entity} />
              ) : tab.type === 'api-keys' ? (
                <ApiClientApiKeysView collections={realCollections} />
              ) : (
                <ApiClientOverview
                  collections={realCollections}
                  environments={environments}
                  historyCount={history.length}
                  onAddCollection={() => {
                    setSettingsCollection(null);
                    setIsCollectionModalOpen(true);
                  }}
                  onOpenEnvironments={() => setIsEnvModalOpen(true)}
                  onOpenApiKeys={handleOpenApiKeys}
                />
              )}
            </KeptView>
          ))}
        {!activeRoute && (!activeTabObj || activeTabObj.type === 'request') && (
          <ApiClientWorkbench
            request={activeRequest}
            response={response}
            isSending={isSending}
            envVars={currentEnvVars}
            globalEnvVars={currentEnvVars}
            collectionEnvVars={{}}
            onUpdateRequest={handleUpdateRequest}
            onSend={handleSendRequest}
            onSave={() => toastSuccess('Request Saved', `Request "${activeRequest.name}" has been saved.`)}
          />
        )}

        {/* Right Falcon AI Assistant Panel */}
        <ApiClientAIPanel
          isOpen={isAiOpen}
          activeRequest={activeRequest}
          onClose={() => setIsAiOpen(false)}
          onApplyAiPayload={handleApplyAiPayload}
        />
      </div>

      {/* Interactive Bottom Console Drawer */}
      <ConsoleDrawer
        isOpen={isConsoleOpen}
        logs={consoleLogs}
        onClose={() => setIsConsoleOpen(false)}
        onClear={() => setConsoleLogs([])}
      />

      <ConfirmDialog
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmLabel="Delete"
        isDestructive={true}
      />
    </div>
  );
}
