'use client';

import React, { useState, useEffect } from 'react';
import { Play, Loader2 } from 'lucide-react';
import { SearchableSelect, type SelectOption } from '@gateway-experience/shared';
import type { ApiClientRequest, HttpMethod, ResponseData } from '@/types/api-client';
import { extractVariableTokens, resolveVariableToken } from '@/lib/api-client-utils';
import { RequestSandbox } from './RequestSandbox';
import { ResponsePanel } from './ResponsePanel';

export interface ApiClientWorkbenchProps {
  request: ApiClientRequest;
  collectionName?: string;
  folderName?: string;
  originalRoute?: string;
  rerouteUrl?: string;
  response: ResponseData | null;
  isSending: boolean;
  onUpdateRequest: (updated: ApiClientRequest) => void;
  onSend: () => void;
  onSave?: () => void;
  onShare?: () => void;
  envVars?: Record<string, string>;
  globalEnvVars?: Record<string, string>;
  collectionEnvVars?: Record<string, string>;
  collectionType?: 'proxy' | 'llm';
  routeParams?: string | null;
  systemInstruction?: string | null;
}

export const Workbench: React.FC<ApiClientWorkbenchProps> = ({
  request,
  collectionName = 'Ad-hoc Requests',
  folderName,
  originalRoute,
  rerouteUrl,
  response,
  isSending,
  onUpdateRequest,
  onSend,
  envVars = {},
  globalEnvVars = {},
  collectionEnvVars = {},
  collectionType = 'proxy',
  routeParams,
  systemInstruction,
}) => {
  const [elapsedMs, setElapsedMs] = useState(0);

  // Active execution timer during HTTP request
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSending) {
      const startTime = Date.now();
      interval = setInterval(() => {
        setElapsedMs(Date.now() - startTime);
      }, 50);
    } else {
      setElapsedMs(0);
    }
    return () => {
      clearInterval(interval);
    };
  }, [isSending]);

  const handleMethodChange = (value: string) => {
    onUpdateRequest({ ...request, method: value as HttpMethod });
  };

  const methodOptions: SelectOption[] = (
    ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'] as HttpMethod[]
  ).map((m) => ({ value: m, label: m }));

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateRequest({ ...request, url: e.target.value });
  };

  const tokens = extractVariableTokens(request.url);

  return (
    <div className="flex-1 flex flex-col bg-background text-foreground select-none h-full min-w-0 overflow-hidden">
      {/* Top Header: Request Breadcrumb & Metadata */}
      <div className="px-4 py-2 border-b border-border flex items-center justify-between bg-card shrink-0 text-xs">
        <div className="flex items-center gap-1 text-muted-foreground font-medium truncate">
          <span>{collectionName}</span>
          {folderName && (
            <>
              <span>/</span>
              <span>{folderName}</span>
            </>
          )}
          <span>/</span>
          <span className="text-foreground font-semibold">{request.name || 'Untitled Request'}</span>
        </div>
      </div>

      {/* URL & Send Bar */}
      <div className="p-3 bg-card border-b border-border flex items-center gap-2 shrink-0">
        {/* Method Select */}
        <div className="w-32 shrink-0">
          <SearchableSelect
            value={request.method}
            onChange={handleMethodChange}
            options={methodOptions}
            placeholder="Method"
          />
        </div>

        {/* URL Input Box */}
        <div className="flex-1 relative flex items-center bg-background border border-input focus-within:border-ring rounded-md h-9 px-3 transition overflow-hidden">
          <input
            type="text"
            value={request.url}
            onChange={handleUrlChange}
            placeholder="Enter request URL or {{variable}}"
            className="w-full bg-transparent text-foreground text-xs font-mono outline-none placeholder:text-muted-foreground"
          />

          {/* Tokens Pill Preview Overlay */}
          {tokens.length > 0 && (
            <div className="flex items-center gap-1 ml-2 shrink-0 select-none">
              {tokens.slice(0, 2).map((t) => {
                const resolved = resolveVariableToken(t, envVars, globalEnvVars, collectionEnvVars);
                const isResolved = resolved.value !== undefined;
                return (
                  <span
                    key={t}
                    title={isResolved ? `Resolved: ${resolved.value}` : 'Unresolved variable'}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                      isResolved
                        ? 'bg-muted border-border text-foreground font-semibold'
                        : 'bg-destructive/10 border-destructive/30 text-destructive'
                    }`}
                  >
                    &#123;&#123;{t}&#125;&#125;
                  </span>
                );
              })}
              {tokens.length > 2 && (
                <span className="text-[10px] text-muted-foreground font-mono">+{tokens.length - 2}</span>
              )}
            </div>
          )}
        </div>

        {/* Send Action Button */}
        <button
          onClick={onSend}
          disabled={isSending}
          className={`h-9 px-5 bg-primary hover:opacity-90 text-primary-foreground font-semibold rounded-md flex items-center gap-2 text-xs transition cursor-pointer shadow-2xs shrink-0 ${
            isSending ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isSending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Sending ({elapsedMs}ms)...</span>
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Send</span>
            </>
          )}
        </button>
      </div>

      {/* Main Split Body View (Top: Request, Bottom: Response) */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Request Sandbox (Params, Headers, Body) */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <RequestSandbox
            request={request}
            onUpdateRequest={onUpdateRequest}
            envVars={envVars}
            collectionType={collectionType}
            routeParams={routeParams}
            systemInstruction={systemInstruction}
            response={response}
            originalRoute={originalRoute}
            rerouteUrl={rerouteUrl}
          />
        </div>

        {/* Response Panel */}
        <div className="h-64 border-t border-border flex flex-col min-h-0 overflow-hidden shrink-0">
          <ResponsePanel response={response} />
        </div>
      </div>
    </div>
  );
};

export { Workbench as ApiClientWorkbench };
