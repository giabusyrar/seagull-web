'use client';

import React, { useState, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Copy,
} from 'lucide-react';
import type { ApiClientRequest, KeyValuePair, ResponseData } from '@/types/api-client';
import { useToast } from '@/components/ui/toast';
import { InfoTooltip } from '@gateway-experience/shared';

export interface RequestSandboxProps {
  request: ApiClientRequest;
  onUpdateRequest: (updated: ApiClientRequest) => void;
  envVars: Record<string, string>;
  collectionType: 'proxy' | 'llm';
  routeParams?: string | null;
  systemInstruction?: string | null;
  response: ResponseData | null;
  originalRoute?: string;
  rerouteUrl?: string;
}

export const RequestSandbox: React.FC<RequestSandboxProps> = ({
  request,
  onUpdateRequest,
  collectionType,
  routeParams,
  systemInstruction,
  response,
  originalRoute,
}) => {
  const [activeReqTab, setActiveReqTab] = useState<'params' | 'headers' | 'body'>('params');
  // Body editor: fill the route-defined fields (each one text or a real file
  // upload, exactly as declared in Route Settings — the field type there is
  // the only place this is configured), or paste a raw JSON body.
  const [bodyMode, setBodyMode] = useState<'form' | 'raw'>('form');

  const parsedRouteParams = useMemo(() => {
    try {
      if (routeParams) {
        return JSON.parse(routeParams);
      }
    } catch {}
    return { headers: [], query: [], body: [] };
  }, [routeParams]);

  const isStaticQuery = (key: string) => {
    if (collectionType !== 'proxy') return false;
    const configured = parsedRouteParams.query?.find((q: any) => q.key.toLowerCase() === key.toLowerCase());
    return configured?.type === 'static';
  };

  const isStaticHeader = (key: string) => {
    if (collectionType !== 'proxy') return false;
    const configured = parsedRouteParams.headers?.find((h: any) => h.key.toLowerCase() === key.toLowerCase());
    return configured?.type === 'static';
  };

  const isRequiredQuery = (key: string) => {
    if (collectionType !== 'proxy') return false;
    const configured = parsedRouteParams.query?.find((q: any) => q.key.toLowerCase() === key.toLowerCase());
    return configured?.required === true;
  };

  const isRequiredHeader = (key: string) => {
    if (collectionType !== 'proxy') return false;
    const configured = parsedRouteParams.headers?.find((h: any) => h.key.toLowerCase() === key.toLowerCase());
    return configured?.required === true;
  };

  const visibleHeaders = useMemo(() => {
    return request.headers.filter((h) => !isStaticHeader(h.key));
  }, [request.headers, isStaticHeader]);

  const visibleQueryParams = useMemo(() => {
    return request.params.filter((p) => p.description !== 'Path Parameter' && !isStaticQuery(p.key));
  }, [request.params, isStaticQuery]);

  const promptVariables = useMemo(() => {
    if (collectionType !== 'llm' || !systemInstruction) return [];
    const regex = /\{\{([^}]+)\}\}/g;
    const vars: string[] = [];
    let match;
    while ((match = regex.exec(systemInstruction)) !== null) {
      const v = match[1].trim();
      if (!vars.includes(v)) vars.push(v);
    }
    return vars;
  }, [collectionType, systemInstruction]);

  const bodyFields = useMemo(() => {
    try {
      return JSON.parse(request.body || '{}');
    } catch {
      return {};
    }
  }, [request.body]);

  const handleBodyFieldChange = (key: string, value: string) => {
    const updatedBody = { ...bodyFields, [key]: value };
    parsedRouteParams.body?.forEach((b: any) => {
      if (b.type === 'static' && b.key) {
        updatedBody[b.key] = b.value || '';
      }
    });
    onUpdateRequest({ ...request, body: JSON.stringify(updatedBody, null, 2) });
  };

  const handleAddParam = () => {
    const newParam: KeyValuePair = {
      id: Date.now().toString(),
      key: '',
      value: '',
      description: '',
      enabled: true,
    };
    onUpdateRequest({ ...request, params: [...request.params, newParam] });
  };

  const handleUpdateParam = (id: string, field: keyof KeyValuePair, val: string | boolean) => {
    const updatedParams = request.params.map((p) => (p.id === id ? { ...p, [field]: val } : p));
    onUpdateRequest({ ...request, params: updatedParams });
  };

  const handleDeleteParam = (id: string) => {
    onUpdateRequest({ ...request, params: request.params.filter((p) => p.id !== id) });
  };

  const handleAddHeader = () => {
    const newHeader: KeyValuePair = {
      id: Date.now().toString(),
      key: '',
      value: '',
      description: '',
      enabled: true,
    };
    onUpdateRequest({ ...request, headers: [...request.headers, newHeader] });
  };

  const handleUpdateHeader = (id: string, field: keyof KeyValuePair, val: string | boolean) => {
    const updatedHeaders = request.headers.map((h) => (h.id === id ? { ...h, [field]: val } : h));
    onUpdateRequest({ ...request, headers: updatedHeaders });
  };

  const handleDeleteHeader = (id: string) => {
    onUpdateRequest({ ...request, headers: request.headers.filter((h) => h.id !== id) });
  };

  const { toastSuccess } = useToast();
  const hasBodyContent = request.body.trim().length > 0 && request.body !== '{}';

  const handleCopyCurl = () => {
    let url = request.url || '';
    if (visibleQueryParams.length > 0) {
      const q = visibleQueryParams
        .filter((p) => p.key && p.enabled !== false)
        .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
        .join('&');
      if (q) url += (url.includes('?') ? '&' : '?') + q;
    }
    let curl = `curl -X ${request.method} "${url}"`;
    visibleHeaders
      .filter((h) => h.key && h.enabled !== false)
      .forEach((h) => {
        curl += ` \\\n  -H "${h.key}: ${h.value}"`;
      });
    if (['POST', 'PUT', 'PATCH'].includes(request.method) && request.body) {
      curl += ` \\\n  -d '${request.body}'`;
    }
    navigator.clipboard.writeText(curl);
    toastSuccess('cURL command copied to clipboard!');
  };

  return (
    <div className="flex flex-col border-b border-border bg-background overflow-hidden min-h-0">
      {/* Request Tab Selector Bar */}
      <div className="flex items-center justify-between px-4 border-b border-border bg-white shrink-0 text-xs font-medium">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveReqTab('params')}
            className={`py-2 border-b-2 transition ${
              activeReqTab === 'params'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Params
          </button>
          <button
            onClick={() => setActiveReqTab('headers')}
            className={`py-2 border-b-2 transition ${
              activeReqTab === 'headers'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Headers{' '}
            <span className="text-[10px] bg-secondary px-1.5 py-0.2 rounded font-mono text-muted-foreground">
              {visibleHeaders.length}
            </span>
          </button>
          <button
            onClick={() => setActiveReqTab('body')}
            className={`py-2 border-b-2 transition relative flex items-center gap-1.5 ${
              activeReqTab === 'body'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>Body</span>
            {hasBodyContent && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyCurl}
            title="Copy cURL command to clipboard"
            className="flex items-center gap-1 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground bg-slate-50 hover:bg-slate-100 border border-border rounded transition font-mono shadow-2xs"
          >
            <Copy className="h-3 w-3 text-primary" /> Copy cURL
          </button>

          {activeReqTab === 'params' && collectionType !== 'proxy' && (
            <button
              onClick={handleAddParam}
              className="flex items-center gap-1 px-2 py-0.5 text-primary hover:bg-beak/10 rounded text-xs transition font-semibold"
            >
              <Plus className="h-3 w-3" /> Add Param
            </button>
          )}
          {activeReqTab === 'headers' && collectionType !== 'proxy' && (
            <button
              onClick={handleAddHeader}
              className="flex items-center gap-1 px-2 py-0.5 text-primary hover:bg-beak/10 rounded text-xs transition font-semibold"
            >
              <Plus className="h-3 w-3" /> Add Header
            </button>
          )}
        </div>
      </div>

      {/* Request Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-3 min-h-0 bg-white">
        {/* PARAMS TAB */}
        {activeReqTab === 'params' && (
          <div className="space-y-4">
            {request.params.some((p) => p.description === 'Path Parameter') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1.5 text-primary">
                    Path Parameters
                    <span className="text-[10px] lowercase bg-beak/10 text-primary px-1.5 py-0.2 rounded font-mono font-normal">
                      auto-extracted
                    </span>
                  </span>
                </div>
                <div className="border border-border rounded-lg overflow-hidden bg-white shadow-2xs">
                  <div className="grid grid-cols-12 bg-slate-50 border-b border-border px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    <div className="col-span-1 text-center">Select</div>
                    <div className="col-span-4 border-r border-border pr-2">Param Key</div>
                    <div className="col-span-4 border-r border-border px-2">Value</div>
                    <div className="col-span-3 px-2">Type</div>
                  </div>
                  <div className="divide-y divide-border">
                    {request.params
                      .filter((p) => p.description === 'Path Parameter')
                      .map((param) => (
                        <div key={param.id} className="grid grid-cols-12 items-center px-3 py-1.5 text-xs hover:bg-slate-50/80 transition-colors">
                          <div className="col-span-1 text-center">
                            <input
                              type="checkbox"
                              checked={param.enabled}
                              onChange={(e) => handleUpdateParam(param.id, 'enabled', e.target.checked)}
                              className="accent-[#d97706] rounded cursor-pointer"
                            />
                          </div>
                          <div className="col-span-4 border-r border-border pr-2 font-mono text-beak font-bold">
                            {param.key}
                          </div>
                          <div className="col-span-4 border-r border-border px-2">
                            <input
                              type="text"
                              placeholder="Value"
                              value={param.value}
                              onChange={(e) => handleUpdateParam(param.id, 'value', e.target.value)}
                              className="w-full bg-transparent outline-none font-mono text-xs text-foreground placeholder-slate-400"
                            />
                          </div>
                          <div className="col-span-3 px-2 text-[11px] text-muted-foreground">
                            Path Var
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-bold uppercase tracking-wider">
                <span>Query Parameters</span>
              </div>
              <div className="border border-border rounded-lg overflow-hidden bg-white shadow-2xs">
                <div className="grid grid-cols-12 bg-slate-50 border-b border-border px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  <div className="col-span-1 text-center">Select</div>
                  <div className="col-span-4 border-r border-border pr-2">Key</div>
                  <div className="col-span-4 border-r border-border px-2">Value</div>
                  <div className="col-span-2 px-2">Description</div>
                  <div className="col-span-1 text-right"></div>
                </div>
                <div className="divide-y divide-border">
                  {visibleQueryParams.length === 0 ? (
                    <div className="p-3 text-center text-xs text-muted-foreground italic">
                      No query parameters. Click &quot;Add Param&quot; to add one.
                    </div>
                  ) : (
                    visibleQueryParams.map((param) => (
                        <div key={param.id} className="grid grid-cols-12 items-center px-3 py-1.5 text-xs hover:bg-slate-50/80 transition-colors">
                          <div className="col-span-1 text-center">
                            <input
                              type="checkbox"
                              checked={param.enabled}
                              onChange={(e) => handleUpdateParam(param.id, 'enabled', e.target.checked)}
                              className="accent-[#d97706] rounded cursor-pointer"
                            />
                          </div>
                          <div className="col-span-4 border-r border-border pr-2">
                            <input
                              type="text"
                              placeholder="Key"
                              value={param.key}
                              readOnly={collectionType === 'proxy'}
                              onChange={(e) => handleUpdateParam(param.id, 'key', e.target.value)}
                              className={`w-full bg-transparent outline-none font-mono text-xs placeholder-slate-400 ${
                                collectionType === 'proxy' ? 'text-muted-foreground cursor-not-allowed' : 'text-foreground font-semibold'
                              }`}
                            />
                          </div>
                          <div className="col-span-4 border-r border-border px-2 flex items-center gap-1.5">
                            <input
                              type="text"
                              placeholder="Value"
                              value={param.value}
                              readOnly={isStaticQuery(param.key)}
                              onChange={(e) => handleUpdateParam(param.id, 'value', e.target.value)}
                              className={`w-full bg-transparent outline-none font-mono text-xs placeholder-slate-400 ${
                                isStaticQuery(param.key) ? 'text-muted-foreground cursor-not-allowed' : 'text-foreground'
                              }`}
                            />
                            {isStaticQuery(param.key) && (
                              <span className="bg-amber-500/15 border border-amber-500/40 text-amber-600 text-[9px] font-bold px-1 rounded flex-shrink-0 font-sans">
                                Static
                              </span>
                            )}
                            {isRequiredQuery(param.key) && (
                              <span className="bg-rose-500/15 border border-rose-500/40 text-rose-600 text-[9px] font-bold px-1.5 py-0.2 rounded flex-shrink-0 font-sans">
                                Required
                              </span>
                            )}
                          </div>
                          <div className="col-span-2 px-2">
                            <input
                              type="text"
                              placeholder="Description"
                              value={param.description || ''}
                              readOnly={collectionType === 'proxy'}
                              onChange={(e) => handleUpdateParam(param.id, 'description', e.target.value)}
                              className={`w-full bg-transparent outline-none text-xs placeholder-slate-400 ${
                                collectionType === 'proxy' ? 'text-muted-foreground cursor-not-allowed' : 'text-muted-foreground'
                              }`}
                            />
                          </div>
                          {collectionType !== 'proxy' && (
                            <div className="col-span-1 text-right">
                              <button
                                onClick={() => handleDeleteParam(param.id)}
                                className="p-1 text-slate-400 hover:text-rose-500 transition"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HEADERS TAB */}
        {activeReqTab === 'headers' && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground flex items-center justify-between pb-1">
              <span>HTTP Request Headers</span>
            </div>
            <div className="border border-border rounded-lg bg-white overflow-hidden text-xs shadow-2xs">
              <div className="grid grid-cols-12 bg-slate-50 px-3 py-1.5 border-b border-border font-semibold text-muted-foreground text-[11px]">
                <div className="col-span-1 text-center">Use</div>
                <div className="col-span-5 border-r border-border pr-2">Header Name</div>
                <div className="col-span-5 border-r border-border px-2">Header Value</div>
                <div className="col-span-1 text-right">Action</div>
              </div>
              <div className="divide-y divide-border">
                {visibleHeaders.length === 0 ? (
                  <div className="p-3 text-center text-muted-foreground italic">
                    No headers defined. Click &quot;Add Header&quot; above.
                  </div>
                ) : (
                  visibleHeaders.map((h) => (
                    <div key={h.id} className="grid grid-cols-12 px-3 py-1.5 items-center hover:bg-slate-50/80 transition-colors">
                      <div className="col-span-1 text-center">
                        <input
                          type="checkbox"
                          checked={h.enabled}
                          onChange={(e) => handleUpdateHeader(h.id, 'enabled', e.target.checked)}
                          className="accent-[#d97706] rounded cursor-pointer"
                        />
                      </div>
                      <div className="col-span-5 border-r border-border pr-2">
                        <input
                          type="text"
                          placeholder="Header Name"
                          value={h.key}
                          readOnly={collectionType === 'proxy'}
                          onChange={(e) => handleUpdateHeader(h.id, 'key', e.target.value)}
                          className={`w-full bg-transparent outline-none font-mono text-xs placeholder-slate-400 ${
                            collectionType === 'proxy' ? 'text-muted-foreground cursor-not-allowed' : 'text-foreground font-semibold'
                          }`}
                        />
                      </div>
                      <div className="col-span-5 border-r border-border px-2 flex items-center gap-1.5 font-mono text-xs">
                        <input
                          type="text"
                          placeholder="Header Value"
                          value={h.value}
                          readOnly={isStaticHeader(h.key)}
                          onChange={(e) => handleUpdateHeader(h.id, 'value', e.target.value)}
                          className={`w-full bg-transparent outline-none placeholder-slate-400 ${
                            isStaticHeader(h.key) ? 'text-muted-foreground cursor-not-allowed' : 'text-foreground'
                          }`}
                        />
                        {isStaticHeader(h.key) && (
                          <span className="bg-amber-500/15 border border-amber-500/40 text-amber-600 text-[9px] font-bold px-1 rounded flex-shrink-0 font-sans">
                            Static
                          </span>
                        )}
                        {isRequiredHeader(h.key) && (
                          <span className="bg-rose-500/15 border border-rose-500/40 text-rose-600 text-[9px] font-bold px-1.5 py-0.2 rounded flex-shrink-0 font-sans">
                            Required
                          </span>
                        )}
                      </div>
                      {collectionType !== 'proxy' && (
                        <div className="col-span-1 text-right">
                          <button
                            onClick={() => handleDeleteHeader(h.id)}
                            className="p-1 text-slate-400 hover:text-rose-500 transition"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* BODY TAB */}
        {activeReqTab === 'body' && (() => {
          if (collectionType === 'llm') {
            if (promptVariables.length === 0) {
              return (
                <div className="p-4 text-center text-xs text-muted-foreground italic bg-slate-50 border border-border rounded-lg">
                  No prompt variables (e.g. &#123;&#123;variable&#125;&#125;) configured.
                </div>
              );
            }
            return (
              <div className="space-y-4 overflow-y-auto max-h-full pr-1">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Fill LLM Prompt Variables
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {promptVariables.map((v) => (
                    <div key={v} className="space-y-1">
                      <label className="block text-xs font-semibold text-beak font-mono">&#123;&#123;{v}&#125;&#125;</label>
                      <input
                        type="text"
                        value={bodyFields[v] || ''}
                        onChange={(e) => handleBodyFieldChange(v, e.target.value)}
                        placeholder={`Value for ${v}`}
                        className="w-full h-8 bg-white border border-border rounded px-3 text-xs text-foreground outline-none focus:border-primary shadow-2xs"
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          const configuredBody = (parsedRouteParams.body || []).filter((b: any) => b.type !== 'static');
          const staticBody = (parsedRouteParams.body || []).filter((b: any) => b.type === 'static');
          let rawValid = true;
          let rawErr = '';
          try {
            JSON.parse(request.body || '{}');
          } catch (e) {
            rawValid = false;
            rawErr = e instanceof Error ? e.message : 'invalid JSON';
          }

          return (
            <div className="space-y-3 overflow-y-auto max-h-full pr-1">
              {/* Mode toggle: fill the route fields, or paste raw JSON */}
              <div className="flex items-center gap-1 text-[11px]">
                {(['form', 'raw'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setBodyMode(m)}
                    className={`px-2.5 py-1 rounded border font-semibold transition ${
                      bodyMode === m
                        ? 'border-beak bg-beak/10 text-beak'
                        : 'border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {m === 'raw' ? 'JSON' : 'Form'}
                  </button>
                ))}
                {bodyMode === 'raw' && (
                  <span className="ml-2 flex items-center gap-2 min-w-0">
                    <span
                      className={`text-[10px] font-mono truncate ${rawValid ? 'text-emerald-600' : 'text-rose-500'}`}
                      title={rawErr}
                    >
                      {rawValid ? 'valid JSON' : rawErr || 'invalid JSON'}
                    </span>
                    <button
                      type="button"
                      disabled={!rawValid}
                      onClick={() =>
                        onUpdateRequest({
                          ...request,
                          body: JSON.stringify(JSON.parse(request.body || '{}'), null, 2),
                        })
                      }
                      className="text-[10px] text-muted-foreground hover:text-foreground disabled:opacity-40 underline"
                    >
                      Format
                    </button>
                    {staticBody.length > 0 && (
                      <InfoTooltip
                        label="About static body fields"
                        content={`Route defines static ${staticBody.map((b: any) => b.key).join(', ')}: added automatically when routed through the gateway (/core/…). When hitting the engine host directly, include ${staticBody.length > 1 ? 'them' : 'it'} in the JSON.`}
                      />
                    )}
                  </span>
                )}
              </div>

              {bodyMode === 'raw' ? (
                <>
                  <textarea
                    value={request.body}
                    onChange={(e) => onUpdateRequest({ ...request, body: e.target.value })}
                    spellCheck={false}
                    wrap="off"
                    placeholder={'{\n  "brand_id": "wardah",\n  "application_id": "skinverse",\n  "code": "my_form",\n  "title": "My Form",\n  "status": "active",\n  "schema": { }\n}'}
                    className="w-full h-96 rounded-md bg-secondary border border-border p-3 text-[12px] text-foreground font-mono leading-relaxed outline-none focus:border-ring resize-y overflow-auto"
                  />
                </>
              ) : configuredBody.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground italic bg-slate-50 border border-border rounded-lg">
                  No request body variables defined in Route Settings. Switch to{' '}
                  <span className="text-foreground font-semibold">JSON</span> to paste a full body.
                </div>
              ) : (
              <div className="grid grid-cols-1 gap-3">
                {configuredBody.map((b: any) => {
                  const isFile = b.fieldType === 'file';
                  const picked = (request.multipartFields || []).find((f) => f.key === b.key);
                  // A field whose Route Settings default looks like JSON (an
                  // object/array) gets a textarea instead of a single-line
                  // input — editing multi-line JSON in a one-line box is how
                  // the outer {}/[] keeps getting silently dropped.
                  const looksLikeJson = typeof b.value === 'string' && /^\s*[{[]/.test(b.value);
                  return (
                    <div key={b.key} className="space-y-1">
                      <label className="block text-xs font-semibold text-foreground font-mono">
                        {b.key}
                        {b.required && <span className="text-rose-500 ml-1 font-sans font-bold" title="Required field">*</span>}
                        {isFile && (
                          <span className="ml-1.5 bg-sky-500/15 border border-sky-500/40 text-sky-600 text-[9px] font-bold px-1.5 py-0.2 rounded align-middle">
                            File
                          </span>
                        )}
                      </label>
                      {isFile ? (
                        <input
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            const existing = request.multipartFields || [];
                            const next = existing.some((f) => f.key === b.key)
                              ? existing.map((f) =>
                                  f.key === b.key ? { ...f, file, value: file?.name || '' } : f
                                )
                              : [
                                  ...existing,
                                  { id: `mp_${b.key}`, key: b.key, type: 'file' as const, value: file?.name || '', file, enabled: true },
                                ];
                            onUpdateRequest({ ...request, multipartFields: next });
                          }}
                          className="w-full text-xs text-foreground"
                        />
                      ) : looksLikeJson ? (
                        <textarea
                          value={bodyFields[b.key] || ''}
                          onChange={(e) => handleBodyFieldChange(b.key, e.target.value)}
                          placeholder={`Value for ${b.key}`}
                          rows={5}
                          spellCheck={false}
                          className="w-full border rounded px-3 py-2 text-xs font-mono outline-none shadow-2xs bg-white border-border text-foreground focus:border-primary resize-y"
                        />
                      ) : (
                        <input
                          type="text"
                          value={bodyFields[b.key] || ''}
                          onChange={(e) => handleBodyFieldChange(b.key, e.target.value)}
                          placeholder={`Value for ${b.key}`}
                          className="w-full h-8 border rounded px-3 text-xs outline-none shadow-2xs bg-white border-border text-foreground focus:border-primary"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              )}
            </div>
          );
        })()}

      </div>
    </div>
  );
};
