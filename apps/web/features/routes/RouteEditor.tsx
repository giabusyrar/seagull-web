'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Save,
  Send,
  Globe,
  Edit2,
  ArrowRightLeft,
  Layers,
  History,
  Copy,
  Check,
} from 'lucide-react';
import { SearchableSelect, InfoTooltip, type SelectOption } from '@gateway-experience/shared';
import type { Collection, Route, RouteGroup, ApiClientRequest, KeyValuePair, HttpMethod, ResponseData, Environment, ExecutionLogRecord } from '@/types/api-client';
import { Workbench } from '@/features/workbench';
import { getStatusColorClass } from '@/lib/api-client-utils';
import { ParamsTable } from './ParamsTable';
import { recallTryApiKey } from '@/lib/try-api-key';
import { RouteExecutionHistoryPanel, RouteExecutionHistoryPanelRef } from './RouteExecutionHistoryPanel';

export interface RouteEditorProps {
  route: Route;
  collection: Collection;
  groups?: RouteGroup[];
  globalEnvVars?: Record<string, string>;
  globalEnvironments?: Environment[];
  onSave: (routeId: string, data: Partial<Route>) => Promise<{ success: boolean; error?: string }>;
  onOpenCollectionSettings?: (collection: Collection) => void;
  onCollectionUpdated?: () => void;
}

const CopyableText: React.FC<{ text: string; copyValue?: string; label?: string; className?: string; labelClassName?: string }> = ({
  text,
  copyValue,
  label,
  className,
  labelClassName,
}) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const val = copyValue !== undefined ? copyValue : text;
    if (!val) return;
    navigator.clipboard.writeText(val);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={`Click to copy: ${copyValue !== undefined ? copyValue : text}`}
      className={`inline-flex items-center gap-1.5 group/copy cursor-pointer text-left transition-colors hover:text-amber-200 ${className || ''}`}
    >
      <span className={labelClassName || 'truncate'}>{label !== undefined ? label : text}</span>
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
      ) : (
        <Copy className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover/copy:opacity-100 transition-opacity shrink-0" />
      )}
    </button>
  );
};

export const RouteEditor: React.FC<RouteEditorProps> = ({
  route,
  collection,
  groups,
  globalEnvVars,
  globalEnvironments,
  onSave,
  onOpenCollectionSettings,
  onCollectionUpdated,
}) => {
  const groupName = React.useMemo(() => {
    if (!route.groupId || !groups) return undefined;
    return groups.find((g) => g.id === route.groupId)?.name;
  }, [route.groupId, groups]);

  const [activeTab, setActiveTab] = useState<'try' | 'settings' | 'transform-flow'>('try');
  const [showHistoryPanel, setShowHistoryPanel] = useState<boolean>(false);
  const historyPanelRef = React.useRef<RouteExecutionHistoryPanelRef>(null);
  const [paramTab, setParamTab] = useState<'headers' | 'query' | 'body'>('headers');
  const [name, setName] = useState(route.name);
  const [method, setMethod] = useState(route.method);
  const [originalPattern, setOriginalPattern] = useState(route.originalPattern);
  const [targetPattern, setTargetPattern] = useState(route.targetPattern || '');

  const handleLoadLogIntoTester = useCallback((logRecord: ExecutionLogRecord) => {
    setActiveTab('try');
    setTryRequest((prev) => ({
      ...prev,
      method: (logRecord.method as HttpMethod) || prev.method,
      url: logRecord.url || prev.url,
    }));
  }, []);

  const displayPattern = React.useMemo(() => {
    const prefix = collection.originalPrefix || '';
    if (prefix && originalPattern && originalPattern.startsWith(prefix)) {
      return originalPattern.substring(prefix.length);
    }
    return originalPattern || '';
  }, [originalPattern, collection.originalPrefix]);

  const getPrettyJson = (rawBody: string | null) => {
    if (!rawBody) return '<empty response>';
    try {
      const parsed = JSON.parse(rawBody);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return rawBody;
    }
  };

  const [llmModel, setLlmModel] = useState(route.llmModel || '');
  const [systemInstruction, setSystemInstruction] = useState(route.systemInstruction || '');
  const [outputSchema, setOutputSchema] = useState(route.outputSchema || '');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [routeParamsInput, setRouteParamsInput] = useState<{
    headers: any[];
    query: any[];
    body: any[];
  }>(() => {
    try {
      if (route.routeParams) {
        const parsed = JSON.parse(route.routeParams);
        return {
          headers: parsed.headers || [],
          query: parsed.query || [],
          body: parsed.body || [],
        };
      }
    } catch {}
    return { headers: [], query: [], body: [] };
  });

  const [collectionEnvs, setCollectionEnvs] = useState<{ id: string; name: string; targetHost: string }[]>([]);
  const [globalEnvs, setGlobalEnvs] = useState<Environment[]>(globalEnvironments || []);
  const [activeCollectionEnvId, setActiveCollectionEnvId] = useState<string>(collection.activeEnvironmentId || '');
  const [visPreset] = useState<'latest' | '200' | '500' | '429'>('latest');
  const [collectionParams, setCollectionParams] = useState<{ kind: string; key: string; value: string; enabled: boolean }[]>([]);
  const [collectionGlobalVars, setCollectionGlobalVars] = useState<{ id: string; key: string; value: string; enabled: boolean }[]>([]);

  const loadCollectionData = React.useCallback(() => {
    if (!collection?.id) return;
    fetch(`/api/collections/${collection.id}/parameters`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.parameters)) {
          setCollectionParams(data.parameters);
        }
      })
      .catch(() => {});

    fetch(`/api/collections/${collection.id}/global-variables`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.variables)) {
          setCollectionGlobalVars(data.variables);
        }
      })
      .catch(() => {});
  }, [collection?.id]);

  useEffect(() => {
    if (!collection?.id) return;

    fetch(`/api/collections/${collection.id}/environments`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.environments)) {
          setCollectionEnvs(data.environments);
        }
      })
      .catch(() => {});

    loadCollectionData();

    if (!globalEnvironments || globalEnvironments.length === 0) {
      fetch('/api/global-environments')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.environments)) {
            setGlobalEnvs(data.environments);
          }
        })
        .catch(() => {});
    }
  }, [collection?.id, globalEnvironments, loadCollectionData]);

  const handleSelectCollectionEnv = async (envId: string) => {
    setActiveCollectionEnvId(envId);
    try {
      await fetch(`/api/collections/${collection.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activeEnvironmentId: envId || null }),
      });
      loadCollectionData();
      onCollectionUpdated?.();
    } catch {}
  };

  const getOrigin = (envMap?: Record<string, string>) => {
    if (typeof window === 'undefined') return '';
    if (envMap?.['host'] && envMap['host'].trim()) {
      const h = envMap['host'].trim();
      return h.endsWith('/') ? h.slice(0, -1) : h;
    }
    if (envMap?.['gateway_url'] && envMap['gateway_url'].trim()) {
      const h = envMap['gateway_url'].trim();
      return h.endsWith('/') ? h.slice(0, -1) : h;
    }
    const publicGateway = process.env.NEXT_PUBLIC_GATEWAY_PROXY_URL;
    if (publicGateway) {
      return publicGateway;
    }
    const { protocol, hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('local')) {
      return `${protocol}//${hostname}:8080`;
    }
    return `${protocol}//${hostname}`;
  };

  const getRouterGatewayUrl = (prefix: string, pattern: string, envMap?: Record<string, string>) => {
    let cleanPrefix = prefix ? prefix.trim().replace(/\/+$/, '') : '';
    if (cleanPrefix && !cleanPrefix.startsWith('/')) {
      cleanPrefix = '/' + cleanPrefix;
    }
    const cleanPattern = pattern ? (pattern.startsWith('/') ? pattern : '/' + pattern) : '';
    const origin = getOrigin(envMap);
    if (cleanPrefix && cleanPattern.startsWith(cleanPrefix)) {
      return origin + cleanPattern;
    }
    if (cleanPrefix.startsWith('/api') && cleanPattern.startsWith('/api')) {
      return origin + cleanPattern;
    }
    return origin + cleanPrefix + cleanPattern;
  };

  const globalEnvMap = React.useMemo(() => {
    if (globalEnvVars && Object.keys(globalEnvVars).length > 0) return globalEnvVars;
    const map: Record<string, string> = {};
    const activeEnv = globalEnvs.find((e) => e.isDefault) || globalEnvs[0];
    if (activeEnv && Array.isArray(activeEnv.variables)) {
      activeEnv.variables.forEach((v) => {
        if (v.key && v.enabled !== false) map[v.key] = v.value;
      });
    }
    return map;
  }, [globalEnvVars, globalEnvs]);

  const routerGatewayUrl = getRouterGatewayUrl(collection.originalPrefix || '', originalPattern || '', globalEnvMap);
  const targetPatternPath = (targetPattern || originalPattern || '');
  let formattedPattern = targetPatternPath.startsWith('/') ? targetPatternPath : '/' + targetPatternPath;
  const colPrefix = collection.originalPrefix || '';
  if (colPrefix && formattedPattern.startsWith(colPrefix)) {
    formattedPattern = formattedPattern.slice(colPrefix.length);
    if (!formattedPattern.startsWith('/')) {
      formattedPattern = '/' + formattedPattern;
    }
  }

  const activeColEnv = collectionEnvs.find((e) => e.id === activeCollectionEnvId);
  const activeTargetHost = activeColEnv?.targetHost || collection.activeTargetHost;
  const actualTargetUrl = activeTargetHost ? `${activeTargetHost}${formattedPattern}` : routerGatewayUrl;

  const collectionEnvMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    const activeEnv = collectionEnvs.find((e) => e.id === activeCollectionEnvId);
    if (activeEnv) {
      if (activeEnv.targetHost) map['target_host'] = activeEnv.targetHost;
      if (activeEnv.targetHost) map['host'] = activeEnv.targetHost;
      if (Array.isArray((activeEnv as any).variables)) {
        (activeEnv as any).variables.forEach((v: any) => {
          if (v.key && v.enabled !== false) map[v.key] = v.value;
        });
      }
    }
    return map;
  }, [collectionEnvs, activeCollectionEnvId]);

  const extractPathParams = useCallback((): KeyValuePair[] => {
    const combined = `${route.originalPattern || ''} ${route.targetPattern || ''}`;
    const matches = combined.match(/\[([^\]]+)\]|:([a-zA-Z0-9_]+)|\{([^}]+)\}/g) || [];
    const uniqueKeys = Array.from(
      new Set(
        matches.map((m) => m.replace(/[\[\]:\x7b\x7d]/g, '').trim()).filter((k) => k.length > 0)
      )
    );

    const initialParams: KeyValuePair[] = uniqueKeys.map((key, i) => ({
      id: `path-param-${i}-${key}`,
      key: key,
      value: '1',
      description: 'Path Parameter',
      enabled: true,
    }));

    return initialParams;
  }, [route.originalPattern, route.targetPattern]);

  // Keys are never readable after creation. A key created in this tab is
  // remembered for Try & Send (sessionStorage — empty on a fresh browser
  // tab). Fall back to whatever X-API-Key is already saved on this route's
  // own routeParams, so the header shows a real value instead of blank
  // on first load in a new tab.
  const savedApiKeyFromRoute = (() => {
    try {
      const parsed = route.routeParams ? JSON.parse(route.routeParams) : null;
      const headers = parsed?.headers as { key?: string; value?: string }[] | undefined;
      return headers?.find((h) => h.key?.toLowerCase() === 'x-api-key')?.value || '';
    } catch {
      return '';
    }
  })();
  const [defaultApiKey] = useState(() => recallTryApiKey() || savedApiKeyFromRoute);

  const [tryRequest, setTryRequest] = useState<ApiClientRequest>(() => ({
    id: route.id,
    name: route.name,
    method: (route.method as HttpMethod) || 'GET',
    url: routerGatewayUrl,
    params: extractPathParams(),
    headers: [
      { id: 'h1', key: 'Accept', value: 'application/json', enabled: true },
      { id: 'h2', key: 'X-API-Key', value: defaultApiKey, enabled: true }
    ],
    body: '{}',
    bodyType: 'json',
  }));
  const [tryResponse, setTryResponse] = useState<ResponseData | null>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    setName(route.name);
    setMethod(route.method);
    setOriginalPattern(route.originalPattern);
    setTargetPattern(route.targetPattern || '');
    setLlmModel(route.llmModel || '');
    setSystemInstruction(route.systemInstruction || '');
    setOutputSchema(route.outputSchema || '');
    setSaveError(null);
    setTryResponse(null);

    try {
      if (route.routeParams) {
        const parsed = JSON.parse(route.routeParams);
        setRouteParamsInput({
          headers: parsed.headers || [],
          query: parsed.query || [],
          body: parsed.body || [],
        });
      } else {
        setRouteParamsInput({ headers: [], query: [], body: [] });
      }
    } catch {
      setRouteParamsInput({ headers: [], query: [], body: [] });
    }
  }, [
    route.id,
    route.name,
    route.method,
    route.originalPattern,
    route.targetPattern,
    route.llmModel,
    route.systemInstruction,
    route.outputSchema,
    route.routeParams,
  ]);

  useEffect(() => {
    if (!route.routeParams) {
      const initialHeaders = collectionParams
        .filter((p) => p.kind === 'header' && p.enabled)
        .map((p, i) => {
          const isStatic = !!p.value;
          return {
            id: `col-h-${i}-${Date.now()}`,
            key: p.key,
            value: p.value || '',
            type: (isStatic ? 'static' : 'dynamic') as 'static' | 'dynamic',
            required: true,
          };
        });

      const initialQuery = collectionParams
        .filter((p) => p.kind === 'query' && p.enabled)
        .map((p, i) => {
          const isStatic = !!p.value;
          return {
            id: `col-q-${i}-${Date.now()}`,
            key: p.key,
            value: p.value || '',
            type: (isStatic ? 'static' : 'dynamic') as 'static' | 'dynamic',
            required: true,
          };
        });

      const initialBody = collectionGlobalVars
        .filter((v) => v.enabled)
        .map((v, i) => {
          const isStatic = !!v.value;
          return {
            id: `col-b-${i}-${Date.now()}`,
            key: v.key,
            value: v.value || '',
            type: (isStatic ? 'static' : 'dynamic') as 'static' | 'dynamic',
            required: true,
          };
        });

      if (initialHeaders.length > 0 || initialQuery.length > 0 || initialBody.length > 0) {
        setRouteParamsInput({
          headers: initialHeaders,
          query: initialQuery,
          body: initialBody,
        });
      }
    }
  }, [collectionParams, collectionGlobalVars, route.id, route.routeParams]);

  useEffect(() => {
    const loadedHeaders: KeyValuePair[] = [
      { id: 'h1', key: 'Accept', value: 'application/json', enabled: true },
      { id: 'h2', key: 'X-API-Key', value: defaultApiKey, enabled: true }
    ];

    routeParamsInput.headers.forEach((h, i) => {
      if (!h.key) return;
      if (loadedHeaders.some((existing) => existing.key.toLowerCase() === h.key.toLowerCase())) return;
      loadedHeaders.push({
        id: `route-h-${i}`,
        key: h.key,
        value: h.value || '',
        enabled: true,
        description: h.type === 'static' ? 'Static Header' : 'Dynamic Header',
      });
    });

    const pathAndQuery = extractPathParams();

    routeParamsInput.query.forEach((q, i) => {
      if (!q.key) return;
      if (pathAndQuery.some((existing) => existing.key.toLowerCase() === q.key.toLowerCase())) return;
      pathAndQuery.push({
        id: `route-q-${i}`,
        key: q.key,
        value: q.value || '',
        enabled: true,
        description: q.type === 'static' ? 'Static Query' : 'Dynamic Query',
      });
    });

    let bodyTemplate = '{}';
    if (collection.type !== 'llm' && routeParamsInput.body.length > 0) {
      const bodyObj: Record<string, string> = {};
      routeParamsInput.body.forEach((b) => {
        if (b.key) {
          bodyObj[b.key] = b.value || '';
        }
      });
      bodyTemplate = JSON.stringify(bodyObj, null, 2);
    }

    const savedGatewayUrl = getRouterGatewayUrl(collection.originalPrefix || '', originalPattern || '', globalEnvMap);

    setTryRequest((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        id: route.id,
        name: route.name,
        method: (method as HttpMethod) || 'GET',
        url: savedGatewayUrl,
        params: pathAndQuery,
        headers: loadedHeaders,
        body: bodyTemplate,
      };
    });
  }, [
    route.id,
    route.name,
    routeParamsInput,
    originalPattern,
    method,
    collection.originalPrefix,
    collection.type,
    extractPathParams,
    defaultApiKey,
    globalEnvMap,
  ]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    const data: Partial<Route> =
      collection.type !== 'llm'
        ? { name, method, originalPattern, targetPattern: targetPattern || null, routeParams: JSON.stringify(routeParamsInput) }
        : { name, llmModel, systemInstruction: systemInstruction || null, outputSchema: outputSchema || null, routeParams: JSON.stringify(routeParamsInput) };
    const res = await onSave(route.id, data);
    setSaving(false);
    if (!res.success) setSaveError(res.error || 'Save failed');
  };

  const handleSendTry = async () => {
    setIsSending(true);
    try {
      let finalUrl = tryRequest.url;
      const queryParams: string[] = [];

      tryRequest.params.forEach((param) => {
        if (!param.enabled || !param.key) return;
        const key = param.key.trim();
        const rawVal = param.value.trim();

        const hasPathPlaceholder =
          finalUrl.includes(`[${key}]`) ||
          finalUrl.includes(`:${key}`) ||
          finalUrl.includes(`{${key}}`);

        if (hasPathPlaceholder) {
          finalUrl = finalUrl
            .replace(`[${key}]`, encodeURIComponent(rawVal))
            .replace(`:${key}`, encodeURIComponent(rawVal))
            .replace(`{${key}}`, encodeURIComponent(rawVal));
        } else if (rawVal) {
          queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(rawVal)}`);
        }
      });

      if (queryParams.length > 0) {
        finalUrl += (finalUrl.includes('?') ? '&' : '?') + queryParams.join('&');
      }

      const reqHeaders = tryRequest.headers.reduce<Record<string, string>>((acc, h) => {
        if (h.enabled && h.key) acc[h.key] = h.value;
        return acc;
      }, {});

      if (['POST', 'PUT', 'PATCH'].includes(tryRequest.method)) {
        const hasContentType = Object.keys(reqHeaders).some((k) => k.toLowerCase() === 'content-type');
        if (!hasContentType) {
          reqHeaders['Content-Type'] = 'application/json; charset=UTF-8';
        }
      }

      if (activeColEnv) {
        if (!reqHeaders['X-Environment']) reqHeaders['X-Environment'] = activeColEnv.name;
        if (!reqHeaders['X-Collection-Environment']) reqHeaders['X-Collection-Environment'] = activeColEnv.name;
        // The gateway routes by X-Environment to registered environment hosts
        // only; it no longer accepts an arbitrary X-Target-Host.
      }

      const res = await fetch(finalUrl, {
        method: tryRequest.method,
        headers: reqHeaders,
        body: ['POST', 'PUT', 'PATCH'].includes(tryRequest.method) ? tryRequest.body : undefined,
      });
      const text = await res.text();
      setTryResponse({
        status: res.status,
        statusText: res.statusText,
        latency: 120,
        size: text.length + ' B',
        headers: Object.fromEntries(res.headers.entries()),
        body: text,
        error: null,
      });

      // Save execution log to DB for History sidebar view
      fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routeId: route.id,
          collectionId: collection.id,
          method: tryRequest.method,
          url: finalUrl,
          status: res.status,
          statusText: res.statusText,
          latencyMs: 120,
          source: 'ui-try',
          requestBody: tryRequest.body || null,
          responseBody: text,
        }),
      })
        .then(() => historyPanelRef.current?.refetch())
        .catch(() => historyPanelRef.current?.refetch());
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Request failed';
      setTryResponse({
        status: 500,
        statusText: 'Error',
        latency: 0,
        size: '0 B',
        headers: {},
        body: null,
        error: errMsg,
      });

      fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routeId: route.id,
          collectionId: collection.id,
          method: tryRequest.method,
          url: tryRequest.url,
          status: 500,
          statusText: 'Error',
          latencyMs: 0,
          source: 'ui-try',
          requestBody: tryRequest.body || null,
          responseBody: errMsg,
        }),
      })
        .then(() => historyPanelRef.current?.refetch())
        .catch(() => historyPanelRef.current?.refetch());
    } finally {
      setIsSending(false);
    }
  };

  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD', 'ANY'];

  const sampleResponses: Record<string, ResponseData> = {
    '200': {
      status: 200,
      statusText: '200 OK',
      latency: 128,
      size: '482 B',
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'x-environment': activeColEnv?.name || 'Production',
      },
      body: JSON.stringify({ success: true, message: 'Response simulated successfully' }, null, 2),
      error: null,
    },
    '500': {
      status: 500,
      statusText: '500 Server Error',
      latency: 320,
      size: '210 B',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ success: false, error: 'Target host database down' }, null, 2),
      error: 'Downstream server error',
    },
    '429': {
      status: 429,
      statusText: '429 Too Many Requests',
      latency: 14,
      size: '164 B',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ success: false, error: 'Rate limit exceeded' }, null, 2),
      error: 'Rate limit exceeded',
    },
  };

  const activeResponse: ResponseData | null =
    visPreset === 'latest' ? tryResponse : sampleResponses[visPreset] || null;

  return (
    <div className="flex-1 flex flex-col bg-background text-foreground select-none h-full min-w-0 overflow-hidden">
      {/* Header Bar */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold text-foreground truncate" title={route.name}>{route.name}</h2>
          <div className="flex bg-muted/60 p-0.5 rounded border border-border">
            <button
              onClick={() => setActiveTab('try')}
              className={`px-3 py-1 text-xs font-semibold rounded transition flex items-center gap-1.5 ${
                activeTab === 'try' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Send className="h-3 w-3" /> Try &amp; Send
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1 text-xs font-semibold rounded transition ${
                activeTab === 'settings' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Route Settings
            </button>
            <button
              onClick={() => setActiveTab('transform-flow')}
              className={`px-3 py-1 text-xs font-semibold rounded transition flex items-center gap-1.5 ${
                activeTab === 'transform-flow' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ArrowRightLeft className="h-3 w-3" /> Transform Flow
            </button>
          </div>

          <div className="flex items-center gap-1.5 pl-3 border-l border-border">
            <Globe className="h-3.5 w-3.5 text-primary" />
            <SearchableSelect
              value={activeCollectionEnvId || ''}
              onChange={handleSelectCollectionEnv}
              options={collectionEnvs.map((env): SelectOption => ({ value: env.id, label: `${env.name} (${env.targetHost})` }))}
              placeholder="No Collection Env"
              searchPlaceholder="Search environments..."
              className="w-56"
            />

            {onOpenCollectionSettings && (
              <button
                type="button"
                onClick={() => onOpenCollectionSettings(collection)}
                className="p-1 rounded transition border bg-white border-border text-muted-foreground hover:text-primary hover:border-primary cursor-pointer"
                title="Edit Collection Environments & Settings"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowHistoryPanel((prev) => !prev)}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 text-xs font-bold transition border cursor-pointer ${
              showHistoryPanel
                ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-sm'
                : 'bg-white text-muted-foreground border-border hover:text-foreground'
            }`}
            title="Toggle ClickHouse Execution History Drawer"
          >
            <History className="h-3.5 w-3.5 text-primary" />
            <span>History</span>
          </button>

          {activeTab === 'settings' && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded flex items-center gap-1.5 text-xs disabled:opacity-50 transition cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" /> {saving ? 'Saving...' : 'Save'}
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace with Collapsible ClickHouse History Panel */}
      <div className="flex-1 flex flex-row min-h-0 overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

      {activeTab === 'settings' ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-background">
          {saveError && <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded px-3 py-2">{saveError}</div>}

          {/* Scope Hierarchy Banner */}
          <div className="bg-slate-50 border border-border rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-primary" />
                Routing Pipeline &amp; Scope Hierarchy
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1 text-[11px] font-mono">
              <div className="bg-white p-2 rounded border border-border space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase font-sans">1. Client Gateway URL</span>
                <div className="text-blue-600 font-bold truncate">{routerGatewayUrl}</div>
              </div>
              <div className="bg-white p-2 rounded border border-border space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase font-sans">2. Rerouted Downstream URL</span>
                <div className="text-emerald-700 font-bold truncate">{actualTargetUrl}</div>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-muted-foreground font-medium text-xs">Route Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full h-8 bg-white border border-border rounded px-3 text-xs text-foreground outline-none focus:border-ring" />
          </div>

          {collection.type !== 'llm' ? (
            <>
              <div className="space-y-1.5">
                <label className="block text-muted-foreground font-medium text-xs">Original Route Subpath</label>
                <div className="flex items-center gap-2">
                  <SearchableSelect
                    value={method}
                    onChange={setMethod}
                    options={methods.map((m): SelectOption => ({ value: m, label: m }))}
                    placeholder="Method"
                    searchPlaceholder="Search methods..."
                    className="w-32 shrink-0"
                  />
                  <div className="flex-1 flex items-center bg-white border border-border rounded overflow-hidden focus-within:border-ring">
                    <span className="px-2.5 py-1.5 bg-muted text-muted-foreground text-xs font-mono border-r border-border shrink-0">
                      {collection.originalPrefix ? (collection.originalPrefix.startsWith('/') ? collection.originalPrefix : '/' + collection.originalPrefix) : '/'}
                    </span>
                    <input
                      value={displayPattern}
                      onChange={(e) => {
                        let val = e.target.value;
                        const prefix = collection.originalPrefix || '';
                        if (prefix && val.startsWith(prefix)) {
                          val = val.substring(prefix.length);
                        }
                        setOriginalPattern(val);
                      }}
                      className="w-full h-8 bg-transparent px-3 text-xs text-foreground font-mono outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-muted-foreground font-medium text-xs">Target Downstream Subpath</label>
                <div className="flex items-center bg-white border border-border rounded overflow-hidden focus-within:border-ring">
                  <span className="px-2.5 py-1.5 bg-muted text-emerald-700 text-xs font-mono border-r border-border shrink-0 max-w-[200px] truncate font-semibold">
                    {activeTargetHost || 'https://target-host.com'}
                  </span>
                  <input
                    value={targetPattern}
                    onChange={(e) => setTargetPattern(e.target.value)}
                    className="w-full h-8 bg-transparent px-3 text-xs text-foreground font-mono outline-none"
                  />
                </div>
              </div>

              <div className="space-y-4 border-t border-border pt-4">
                <div className="flex bg-muted/60 p-1 rounded-lg border border-border text-xs font-semibold gap-1 shrink-0 select-none">
                  <button type="button" onClick={() => setParamTab('headers')} className={`flex-1 py-1 px-3 rounded transition flex items-center justify-center gap-1 ${paramTab === 'headers' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}>Headers</button>
                  <button type="button" onClick={() => setParamTab('query')} className={`flex-1 py-1 px-3 rounded transition flex items-center justify-center gap-1 ${paramTab === 'query' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}>Query Parameters</button>
                  <button type="button" onClick={() => setParamTab('body')} className={`flex-1 py-1 px-3 rounded transition flex items-center justify-center gap-1 ${paramTab === 'body' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}>Body Variables</button>
                </div>

                <ParamsTable
                  kind={paramTab}
                  items={routeParamsInput[paramTab]}
                  onChange={(updated) => setRouteParamsInput({ ...routeParamsInput, [paramTab]: updated })}
                  collectionParams={collectionParams}
                  collectionGlobalVars={collectionGlobalVars}
                />
              </div>
            </>
          ) : (
            <div className="space-y-1.5 border-t border-border pt-4">
              <h3 className="text-xs font-semibold text-foreground">Model Binding</h3>
              <div className="space-y-1.5">
                <label className="block text-muted-foreground font-medium text-xs">Model</label>
                <input value={llmModel} onChange={(e) => setLlmModel(e.target.value)} placeholder="e.g. gemini-2.0-flash" className="w-full h-8 bg-white border border-border rounded px-3 text-xs text-foreground font-mono outline-none focus:border-ring" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <label className="text-muted-foreground font-medium text-xs">System Instruction (optional)</label>
                  <InfoTooltip content="Default system instruction applied to requests on this route." label="About System Instruction" />
                </div>
                <textarea value={systemInstruction} onChange={(e) => setSystemInstruction(e.target.value)} rows={3} className="w-full bg-white border border-border rounded px-3 py-2 text-xs text-foreground outline-none focus:border-ring" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <label className="text-muted-foreground font-medium text-xs">Output Schema</label>
                  <InfoTooltip content="Expected response structure, defined as a JSON Schema." label="About Output Schema" />
                </div>
                <textarea value={outputSchema} onChange={(e) => setOutputSchema(e.target.value)} rows={3} className="w-full bg-white border border-border rounded px-3 py-2 text-xs text-foreground font-mono outline-none focus:border-ring" />
              </div>
            </div>
          )}
        </div>
      ) : activeTab === 'transform-flow' ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
          <div className="border-b border-border pb-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4 text-primary" />
              Request Transformation Flow
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Client Request (Incoming) */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-3 shadow-2xs">
              <h4 className="font-bold text-xs text-foreground uppercase border-b border-border pb-1.5">
                1. Incoming Client Request (Gateway Entrance)
              </h4>
              
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-muted-foreground block mb-1">Path / URL</span>
                  <div className="font-mono bg-slate-50 p-2 rounded border border-border text-foreground flex items-center justify-between">
                    <div>
                      <span className="text-primary font-bold mr-1.5">{method}</span>
                      <span>{collection.originalPrefix || ''}{originalPattern}</span>
                    </div>
                    <CopyableText text={`${collection.originalPrefix || ''}${originalPattern}`} label="" className="ml-2" />
                  </div>
                </div>

                <div>
                  <span className="text-muted-foreground block mb-1">Query Parameters</span>
                  <div className="bg-slate-50 rounded border border-border divide-y divide-border font-mono">
                    {routeParamsInput.query.filter(q => q.type === 'dynamic').length === 0 ? (
                      <div className="p-2 text-center text-muted-foreground italic">No dynamic query parameters</div>
                    ) : (
                      routeParamsInput.query.filter(q => q.type === 'dynamic').map((q) => {
                        const runtimeVal = tryRequest.params.find(p => p.key === q.key)?.value || '(user runtime value)';
                        return (
                          <div key={q.id} className="p-2 flex justify-between items-center gap-2">
                            <span className="text-amber-800 flex items-center gap-1.5 shrink-0">
                              <CopyableText text={q.key} className="text-amber-800 font-semibold" />
                              <span className="text-[9px] px-1 py-0.2 rounded font-sans font-bold bg-cyan-50 text-beak border border-beak">
                                dynamic
                              </span>
                            </span>
                            <CopyableText text={runtimeVal} className="text-muted-foreground truncate max-w-[200px]" />
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-muted-foreground block mb-1">Headers</span>
                  <div className="bg-slate-50 rounded border border-border divide-y divide-border font-mono">
                    {tryRequest.headers.filter(h => {
                      const configHeader = routeParamsInput.headers.find(rh => rh.key.toLowerCase() === h.key.toLowerCase());
                      return !configHeader || configHeader.type !== 'static';
                    }).length === 0 ? (
                      <div className="p-2 text-center text-muted-foreground italic">No client headers</div>
                    ) : (
                      tryRequest.headers
                        .filter(h => {
                          const configHeader = routeParamsInput.headers.find(rh => rh.key.toLowerCase() === h.key.toLowerCase());
                          return !configHeader || configHeader.type !== 'static';
                        })
                        .map((h) => {
                          const isDefault = h.key.toLowerCase() === 'accept' || h.key.toLowerCase() === 'x-api-key';
                          const typeLabel = isDefault ? 'system' : 'dynamic';
                          return (
                            <div key={h.id} className="p-2 flex justify-between items-center gap-2">
                              <span className="text-amber-800 flex items-center gap-1.5 shrink-0">
                                <CopyableText text={h.key} className="text-amber-800 font-semibold" />
                                <span className={`text-[9px] px-1 py-0.2 rounded font-sans font-bold ${
                                  isDefault 
                                    ? 'bg-zinc-100 text-zinc-700 border border-zinc-300' 
                                    : 'bg-cyan-50 text-beak border border-beak'
                                }`}>
                                  {typeLabel}
                                </span>
                              </span>
                              <CopyableText text={h.value || '(empty)'} copyValue={h.value} className="text-muted-foreground truncate max-w-[200px]" />
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>

                {collection.type === 'proxy' && routeParamsInput.body.length > 0 && (
                  <div>
                    <span className="text-muted-foreground block mb-1">Request Body</span>
                    <pre className="bg-slate-50 p-2 rounded border border-border text-foreground whitespace-pre-wrap max-h-32 overflow-auto font-mono text-[11px]">
                      {JSON.stringify(
                        routeParamsInput.body.reduce((acc, b) => {
                          if (b.key && b.type === 'dynamic') acc[b.key] = '(runtime value)';
                          return acc;
                        }, {} as Record<string, any>),
                        null,
                        2
                      )}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Transformed Outgoing Request (To Backend) */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-3 shadow-2xs">
              <h4 className="font-bold text-xs text-foreground uppercase border-b border-border pb-1.5">
                2. Outgoing Request (Transformed to Downstream)
              </h4>
              
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-muted-foreground block mb-1">Path / URL</span>
                  <div className="font-mono bg-slate-50 p-2 rounded border border-border text-foreground flex items-center justify-between truncate" title={actualTargetUrl}>
                    <div className="truncate">
                      <span className="text-emerald-700 font-bold mr-1.5">{method}</span>
                      <span>{actualTargetUrl}</span>
                    </div>
                    <CopyableText text={actualTargetUrl} label="" className="ml-2" />
                  </div>
                </div>

                <div>
                  <span className="text-muted-foreground block mb-1">Resolved Query Parameters</span>
                  <div className="bg-slate-50 rounded border border-border divide-y divide-border font-mono">
                    {routeParamsInput.query.length === 0 ? (
                      <div className="p-2 text-center text-muted-foreground italic">No query parameters</div>
                    ) : (
                      routeParamsInput.query.map((q) => {
                        const val = tryRequest.params.find(p => p.key === q.key)?.value || q.value || '(empty)';
                        return (
                          <div key={q.id} className="p-2 flex justify-between items-center gap-2">
                            <span className="text-emerald-700 flex items-center gap-1.5 shrink-0">
                              <CopyableText text={q.key} className="text-emerald-700 font-semibold" />
                              <span className={`text-[9px] px-1 py-0.2 rounded font-sans font-bold ${
                                q.type === 'static' 
                                  ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                                  : 'bg-cyan-50 text-beak border border-beak'
                              }`}>
                                {q.type}
                              </span>
                            </span>
                            <CopyableText text={val} className="text-muted-foreground truncate max-w-[200px]" />
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-muted-foreground block mb-1">Resolved Headers</span>
                  <div className="bg-slate-50 rounded border border-border divide-y divide-border font-mono">
                    {tryRequest.headers.filter(h => h.key.toLowerCase() !== 'x-api-key').length === 0 ? (
                      <div className="p-2 text-center text-muted-foreground italic">No headers</div>
                    ) : (
                      tryRequest.headers
                        .filter(h => h.key.toLowerCase() !== 'x-api-key')
                        .map((h) => {
                          const configHeader = routeParamsInput.headers.find(rh => rh.key.toLowerCase() === h.key.toLowerCase());
                          const isDefault = h.key.toLowerCase() === 'accept';
                          const typeLabel = isDefault ? 'system' : (configHeader?.type || 'dynamic');
                          return (
                            <div key={h.id} className="p-2 flex justify-between items-center gap-2">
                              <span className="text-emerald-700 flex items-center gap-1.5 shrink-0">
                                <CopyableText text={h.key} className="text-emerald-700 font-semibold" />
                                <span className={`text-[9px] px-1 py-0.2 rounded font-sans font-bold ${
                                  isDefault
                                    ? 'bg-zinc-100 text-zinc-700 border border-zinc-300'
                                    : typeLabel === 'static'
                                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                    : 'bg-cyan-50 text-beak border border-beak'
                                }`}>
                                  {typeLabel}
                                </span>
                              </span>
                              <CopyableText text={h.value || '(empty)'} copyValue={h.value} className="text-muted-foreground truncate max-w-[200px]" />
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>

                {collection.type === 'proxy' && routeParamsInput.body.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-muted-foreground">Request Body</span>
                      <CopyableText text="Copy Body" copyValue={tryRequest.body} className="text-[10px] text-primary" />
                    </div>
                    <pre className="bg-slate-50 p-2 rounded border border-border text-foreground whitespace-pre-wrap max-h-32 overflow-auto font-mono text-[11px]">
                      {tryRequest.body}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Backend Response Area */}
          <div className="bg-card border border-border rounded-lg p-4 space-y-3 shadow-2xs">
            <h4 className="font-bold text-xs text-foreground uppercase border-b border-border pb-1.5 flex items-center justify-between">
              <span>3. Backend Response</span>
              {tryResponse && (
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${getStatusColorClass(tryResponse.status || 0)}`}>
                  {tryResponse.status} {tryResponse.statusText} ({tryResponse.latency}ms, {tryResponse.size})
                </span>
              )}
            </h4>
            
            {tryResponse ? (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-muted-foreground block mb-1">Response Headers</span>
                  <div className="bg-slate-50 p-2 rounded border border-border space-y-1 max-h-32 overflow-y-auto font-mono text-[11px]">
                    {Object.entries(tryResponse.headers || {}).map(([k, v]) => (
                      <div key={k} className="flex justify-between items-center gap-2">
                        <CopyableText text={k} className="text-amber-800 font-semibold" />
                        <CopyableText text={v} className="text-muted-foreground truncate max-w-[300px]" />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-muted-foreground">Response Body Payload</span>
                    <CopyableText text="Copy Response Payload" copyValue={getPrettyJson(tryResponse.body)} className="text-[10px] text-emerald-700 font-semibold" />
                  </div>
                  <pre className="bg-slate-50 p-3 rounded border border-border font-mono text-[11px] text-foreground max-h-72 overflow-auto whitespace-pre-wrap">
                    {getPrettyJson(tryResponse.body)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center text-xs text-muted-foreground italic py-8">
                No simulated payload recorded. Trigger a request in the Try & Send panel to view backend outcome.
              </div>
            )}
          </div>
        </div>
      ) : (
        <Workbench
          request={tryRequest}
          collectionName={collection.name}
          folderName={groupName}
          rerouteUrl={routerGatewayUrl}
          originalRoute={actualTargetUrl}
          response={tryResponse}
          isSending={isSending}
          envVars={globalEnvMap}
          globalEnvVars={globalEnvMap}
          collectionEnvVars={collectionEnvMap}
          onUpdateRequest={(updated) => setTryRequest(updated)}
          onSend={handleSendTry}
          collectionType={collection.type as 'proxy' | 'llm'}
          routeParams={JSON.stringify(routeParamsInput)}
          systemInstruction={systemInstruction}
        />
      )}
        </div>

        {/* ClickHouse Per-Route Execution History Panel */}
        {showHistoryPanel && (
          <RouteExecutionHistoryPanel
            ref={historyPanelRef}
            routeId={route.id}
            onClose={() => setShowHistoryPanel(false)}
            onLoadIntoTester={handleLoadLogIntoTester}
          />
        )}
      </div>
    </div>
  );
};

export { RouteEditor as ApiClientRouteEditor };
