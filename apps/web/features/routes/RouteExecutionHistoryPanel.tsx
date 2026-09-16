'use client';

import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import {
  RefreshCw,
  X,
  ChevronDown,
  ChevronUp,
  Clock,
  Send,
  Copy,
  Check,
} from 'lucide-react';
import type { ExecutionLogRecord } from '@/types/api-client';
import { getStatusColorClass } from '@/lib/api-client-utils';
import { apiGet } from '@/lib/api-client';

export interface RouteExecutionHistoryPanelRef {
  refetch: () => void;
}

export interface RouteExecutionHistoryPanelProps {
  routeId: string;
  onClose: () => void;
  onLoadIntoTester?: (log: ExecutionLogRecord) => void;
}

export const RouteExecutionHistoryPanel = forwardRef<
  RouteExecutionHistoryPanelRef,
  RouteExecutionHistoryPanelProps
>(({ routeId, onClose, onLoadIntoTester }, ref) => {
  const [logs, setLogs] = useState<ExecutionLogRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'error'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    if (!routeId) return;
    setLoading(true);
    try {
      const res = await apiGet<{ success: boolean; logs: ExecutionLogRecord[] }>(
        `/api/logs?routeId=${routeId}&status=${statusFilter}&limit=20`
      );
      if (res && res.success && Array.isArray(res.logs)) {
        setLogs(res.logs);
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.error('Failed to fetch route execution logs:', err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [routeId, statusFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useImperativeHandle(ref, () => ({
    refetch: fetchLogs,
  }));

  const handleCopy = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const formatRelativeTime = (isoString: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      if (diffSec < 60) return `${diffSec}s ago`;
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return `${diffHr}h ago`;
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="w-80 md:w-96 shrink-0 bg-white border-l border-border flex flex-col h-full overflow-hidden text-xs text-foreground">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between bg-white">
        <div className="flex items-center gap-2 font-medium text-foreground">
          <Clock className="w-4 h-4 text-amber-600" />
          <span>Execution History</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-mono">
            Try &amp; Send
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={fetchLogs}
            disabled={loading}
            title="Refresh Logs"
            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-600' : ''}`} />
          </button>
          <button
            type="button"
            onClick={onClose}
            title="Close Panel"
            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-3 py-2 border-b border-border bg-slate-50 flex items-center gap-1">
        {(['all', 'success', 'error'] as const).map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setStatusFilter(filter)}
            className={`px-2.5 py-1 rounded text-[11px] font-medium capitalize transition-colors cursor-pointer ${
              statusFilter === filter
                ? 'bg-amber-100 text-amber-900 border border-amber-300 font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-white border border-transparent'
            }`}
          >
            {filter === 'all' ? 'All' : filter === 'success' ? '2xx Success' : 'Errors (4xx/5xx)'}
          </button>
        ))}
      </div>

      {/* Log List Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-white">
        {loading && logs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-amber-600" />
            <span>Loading execution logs...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">No execution logs found</p>
            <p className="text-[11px]">Send a request using &quot;Try &amp; Send&quot; to see real-time history here.</p>
          </div>
        ) : (
          logs.map((log) => {
            const isExpanded = expandedId === log.requestId;

            return (
              <div
                key={log.requestId || `${log.createdAt}-${log.latencyMs}`}
                className="rounded-lg border border-border bg-card hover:border-slate-300 transition-all overflow-hidden shadow-2xs"
              >
                {/* Compact Card Header */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : log.requestId)}
                  className="p-2.5 flex items-center justify-between cursor-pointer select-none gap-2 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 ${getStatusColorClass(
                        log.status
                      )}`}
                    >
                      {log.status || 'ERR'}
                    </span>
                    <span className="font-mono text-[11px] font-semibold text-foreground">
                      {log.method}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono truncate">
                      {log.latencyMs}ms
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-muted-foreground">
                      {formatRelativeTime(log.createdAt)}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Expanded Details Accordion */}
                {isExpanded && (
                  <div className="p-3 border-t border-border bg-slate-50 space-y-2 text-[11px]">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Request ID: <span className="font-mono text-foreground font-semibold">{log.requestId}</span></span>
                      {log.clientIp && <span>IP: <span className="font-mono text-foreground font-semibold">{log.clientIp}</span></span>}
                    </div>

                    {log.url && (
                      <div>
                        <span className="text-muted-foreground block text-[10px] mb-0.5 font-medium">Target URL</span>
                        <div className="font-mono text-[10px] text-amber-800 bg-white p-1.5 rounded border border-border break-all">
                          {log.url}
                        </div>
                      </div>
                    )}

                    {log.requestHeaders && (
                      <div>
                        <span className="text-muted-foreground block text-[10px] mb-0.5 font-medium">Headers</span>
                        <pre className="font-mono text-[10px] text-foreground bg-white p-1.5 rounded border border-border overflow-x-auto max-h-24">
                          {log.requestHeaders}
                        </pre>
                      </div>
                    )}

                    {log.responseBody && (
                      <div>
                        <div className="flex items-center justify-between text-muted-foreground mb-0.5 font-medium">
                          <span className="text-[10px]">Response Body</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(log.responseBody || '', log.requestId);
                            }}
                            className="hover:text-amber-700 flex items-center gap-1 text-[10px] cursor-pointer"
                          >
                            {copiedId === log.requestId ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3 text-muted-foreground" />
                            )}
                            Copy
                          </button>
                        </div>
                        <pre className="font-mono text-[10px] text-emerald-700 bg-white p-1.5 rounded border border-border overflow-x-auto max-h-32">
                          {log.responseBody}
                        </pre>
                      </div>
                    )}

                    {/* Actions Bar */}
                    {onLoadIntoTester && (
                      <div className="pt-1 flex justify-end">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onLoadIntoTester(log);
                          }}
                          className="px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-medium flex items-center gap-1.5 transition-colors text-[11px] cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          Load into Tester
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
});

RouteExecutionHistoryPanel.displayName = 'RouteExecutionHistoryPanel';
