'use client';

import React from 'react';
import type { ApiClientRequest, ResponseData, Collection, HttpMethod } from '@/types/api-client';
import { HttpMethodBadge, EmptyState } from '@gateway-experience/shared';
import { Clock } from 'lucide-react';

export interface DbExecutionLog {
  id: string;
  routeId?: string | null;
  collectionId?: string | null;
  brandId?: string | null;
  brandName?: string | null;
  method: string;
  url: string;
  status: number;
  statusText: string;
  latencyMs: number;
  source: string;
  requestBody?: string | null;
  responseBody?: string | null;
  createdAt: string;
}

export interface HistoryListProps {
  collections: Collection[];
  expandedCollectionId?: string | null;
  searchQuery: string;
  dbLogs: DbExecutionLog[];
  onSelectRequest: (request: ApiClientRequest, response?: ResponseData) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  collections,
  expandedCollectionId,
  searchQuery,
  dbLogs,
  onSelectRequest,
}) => {
  const query = searchQuery.trim().toLowerCase();
  const filteredLogs = dbLogs.filter((log) => {
    if (expandedCollectionId && log.collectionId && log.collectionId !== expandedCollectionId) {
      return false;
    }
    if (!query) return true;
    return (
      log.url.toLowerCase().includes(query) ||
      log.method.toLowerCase().includes(query) ||
      log.status.toString().includes(query) ||
      log.source.toLowerCase().includes(query)
    );
  });

  if (filteredLogs.length === 0) {
    return (
      <div className="py-4">
        <EmptyState
          icon={<Clock className="h-6 w-6 text-muted-foreground" />}
          title="No Execution Logs"
          description="No history records match the current filter."
        />
      </div>
    );
  }

  return (
    <div className="px-2 space-y-2">
      <div className="flex flex-col gap-1 py-1 border-b border-border">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Filtered by Collection:</span>
          <span className="font-semibold text-primary">
            {expandedCollectionId
              ? (collections.find((c) => c.id === expandedCollectionId)?.name || 'Selected')
              : 'All Collections'}
          </span>
        </div>
      </div>

      {filteredLogs.map((log) => {
        const dateStr = new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return (
          <div
            key={log.id}
            onClick={() => {
              const replicatedReq: ApiClientRequest = {
                id: 'log-req-' + log.id,
                name: `${log.method} ${log.url}`,
                method: log.method as HttpMethod,
                url: log.url,
                params: [],
                headers: [],
                body: log.requestBody || '{}',
                bodyType: 'json',
              };

              const replicatedRes: ResponseData = {
                status: log.status,
                statusText: log.statusText,
                latency: log.latencyMs,
                size: log.responseBody ? `${log.responseBody.length} B` : '0 B',
                headers: {},
                body: log.responseBody || '',
                error: null,
              };

              onSelectRequest(replicatedReq, replicatedRes);
            }}
            className="p-2 bg-card hover:bg-muted/60 hover:border-sidebar-ring/40 border border-border rounded-md transition cursor-pointer space-y-1 group shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <HttpMethodBadge method={log.method} className="text-[9px] px-1 py-0" />
                <span className="truncate text-xs text-foreground font-medium group-hover:text-primary transition" title={log.url}>{log.url}</span>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">{dateStr}</span>
            </div>

            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
              <div className="flex items-center gap-1">
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                  log.source === 'external' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-sky-50 text-sky-700 border border-sky-200'
                }`}>
                  {log.source === 'external' ? 'External App' : 'UI Test'}
                </span>
                {log.brandName && (
                  <span className="px-1.5 py-0.5 bg-beak/10 border border-beak/20 text-primary text-[9px] font-bold rounded">
                    {log.brandName}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <span className={log.status >= 200 && log.status < 300 ? 'text-emerald-700 font-semibold' : 'text-amber-800 font-semibold'}>
                  {log.status} ({log.latencyMs}ms)
                </span>
                <span className="text-[10px] text-primary opacity-0 group-hover:opacity-100 font-sans ml-1 font-medium">
                  Load →
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
