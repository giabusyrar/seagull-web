'use client';

import { useState, useCallback, useEffect } from 'react';
import type { ApiClientRequest, ResponseData, Route, Collection, Environment, HttpMethod } from '@/types/api-client';
import { executeHttpRequest } from '@/lib/api-client-utils';

export function createDefaultRequest(): ApiClientRequest {
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

interface HistoryItem {
  id: string;
  request: ApiClientRequest;
  response: ResponseData;
  timestamp: number;
  brandId?: string | null;
  brandName?: string | null;
}

export function useRequestRunner(
  activeRoute: Route | null,
  collections: Collection[],
  environments: Environment[],
  selectedEnvId: string,
  currentEnvVars: Record<string, string>
) {
  const [activeRequest, setActiveRequest] = useState<ApiClientRequest>(createDefaultRequest());
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    `Falcon Console initialized. Active environment: Development.`,
  ]);

  // Sync activeRequest when activeRoute changes
  useEffect(() => {
    if (activeRoute) {
      const defaultReq: ApiClientRequest = {
        id: activeRoute.id,
        name: activeRoute.name,
        method: activeRoute.method as HttpMethod,
        url: activeRoute.originalPattern,
        params: [],
        headers: [],
        body: '{}',
        bodyType: 'json',
      };

      try {
        if (activeRoute.routeParams) {
          const parsed = JSON.parse(activeRoute.routeParams);
          // Parse query params
          if (Array.isArray(parsed.query)) {
            defaultReq.params = parsed.query.map((q: any) => ({
              id: q.id || `q-${Math.random()}`,
              key: q.key,
              value: q.value || '',
              enabled: true,
              required: q.required,
            }));
          }
          // Parse headers
          if (Array.isArray(parsed.headers)) {
            defaultReq.headers = parsed.headers.map((h: any) => ({
              id: h.id || `h-${Math.random()}`,
              key: h.key,
              value: h.value || '',
              enabled: true,
              required: h.required,
            }));
          }
          // Build body template from NON-static vars only. Static body vars
          // (brand_id, application_id, ...) are injected by the gateway on send;
          // seeding them into the editor collides with a pasted full body.
          if (Array.isArray(parsed.body)) {
            const bodyObj: Record<string, string> = {};
            parsed.body
              .filter((b: any) => b.type !== 'static')
              .forEach((b: any) => {
                bodyObj[b.key] = b.value || '';
              });
            defaultReq.body = JSON.stringify(bodyObj, null, 2);
          }
        }
      } catch {}

      // Ensure at least one empty row if arrays are empty
      if (defaultReq.params.length === 0) {
        defaultReq.params.push({ id: 'p1', key: '', value: '', enabled: true });
      }
      if (defaultReq.headers.length === 0) {
        defaultReq.headers.push({ id: 'h1', key: '', value: '', enabled: true });
      }

      setActiveRequest(defaultReq);
      setResponse(null);
    } else {
      setActiveRequest(createDefaultRequest());
      setResponse(null);
    }
  }, [activeRoute]);

  const handleUpdateRequest = useCallback((req: ApiClientRequest) => {
    setActiveRequest(req);
  }, []);

  const handleSendRequest = useCallback(async () => {
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

      const activeCol = collections.find((c) => c.id === activeRoute?.collectionId);

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
      setConsoleLogs((prev) => [
        ...prev,
        `[${timeStr}] Execution Error: ${message}`,
      ]);
    } finally {
      setIsSending(false);
    }
  }, [activeRequest, activeRoute, collections, currentEnvVars, environments, selectedEnvId]);

  return {
    activeRequest,
    handleUpdateRequest,
    response,
    setResponse,
    isSending,
    handleSendRequest,
    history,
    setHistory,
    consoleLogs,
    setConsoleLogs,
  };
}
