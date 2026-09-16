'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, Activity, DollarSign, Clock, CheckCircle2, RefreshCw } from 'lucide-react';
import { apiGet } from '@/lib/api-client';
import { StatWidget, InfoTooltip } from '@gateway-experience/shared';

export interface ExecutionLogItem {
  id: string;
  method: string;
  url: string;
  status: number;
  latencyMs: number;
  tokensPrompt?: number;
  tokensCompletion?: number;
  estimatedCost?: number;
  createdAt: string;
}

export const ApiClientAnalyticsView: React.FC = () => {
  const [logs, setLogs] = useState<ExecutionLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    const res = await apiGet<{ success: boolean; logs?: ExecutionLogItem[] }>('/api/logs');
    if (res.success && res.logs) {
      setLogs(res.logs);
    }
    setLoading(false);
  };

  useEffect(() => {
    let isMounted = true;
    apiGet<{ success: boolean; logs?: ExecutionLogItem[] }>('/api/logs').then((res) => {
      if (isMounted) {
        if (res.success && res.logs) {
          setLogs(res.logs);
        }
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const totalRequests = logs.length;
  const successRequests = logs.filter((l) => l.status >= 200 && l.status < 400).length;
  const successRate = totalRequests > 0 ? ((successRequests / totalRequests) * 100).toFixed(1) : '100';

  const avgLatency =
    totalRequests > 0 ? Math.round(logs.reduce((acc, curr) => acc + curr.latencyMs, 0) / totalRequests) : 0;

  const totalTokens = logs.reduce((acc, curr) => acc + (curr.tokensPrompt || 0) + (curr.tokensCompletion || 0), 0);
  const totalCost = logs.reduce((acc, curr) => acc + (curr.estimatedCost || 0), 0).toFixed(4);

  // Status code breakdown
  const status2xx = logs.filter((l) => l.status >= 200 && l.status < 300).length;
  const status4xx = logs.filter((l) => l.status >= 400 && l.status < 500).length;
  const status5xx = logs.filter((l) => l.status >= 500).length;

  return (
    <div className="p-6 space-y-6 max-w-5xl text-xs">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" /> Gateway Analytics &amp; Token Usage
            <InfoTooltip
              content="Real-time metrics for gateway requests, status distribution, and LLM token costs."
              label="About Gateway Analytics"
            />
          </h2>
        </div>
        <button
          onClick={fetchLogs}
          className="p-2 rounded bg-secondary hover:bg-secondary/80 text-foreground transition-colors cursor-pointer"
          title="Refresh analytics"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatWidget
          title="Total Requests"
          value={totalRequests}
          icon={<Activity className="w-4 h-4 text-blue-400" />}
        />
        <StatWidget
          title="Success Rate"
          value={`${successRate}%`}
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
        />
        <StatWidget
          title="Avg Latency"
          value={`${avgLatency} ms`}
          icon={<Clock className="w-4 h-4 text-purple-400" />}
        />
        <StatWidget
          title="Est. AI Token Cost"
          value={`$${totalCost}`}
          description={`${totalTokens.toLocaleString()} total tokens`}
          icon={<DollarSign className="w-4 h-4 text-amber-400" />}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Breakdown Chart */}
        <div className="p-5 bg-card border border-border rounded-lg space-y-4 shadow-2xs">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> HTTP Status Code Breakdown
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-muted-foreground mb-1">
                <span>2xx Success ({status2xx})</span>
                <span>{totalRequests > 0 ? Math.round((status2xx / totalRequests) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all"
                  style={{ width: `${totalRequests > 0 ? (status2xx / totalRequests) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-muted-foreground mb-1">
                <span>4xx Client Errors ({status4xx})</span>
                <span>{totalRequests > 0 ? Math.round((status4xx / totalRequests) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full transition-all"
                  style={{ width: `${totalRequests > 0 ? (status4xx / totalRequests) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-muted-foreground mb-1">
                <span>5xx Server Errors ({status5xx})</span>
                <span>{totalRequests > 0 ? Math.round((status5xx / totalRequests) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div
                  className="bg-red-500 h-full transition-all"
                  style={{ width: `${totalRequests > 0 ? (status5xx / totalRequests) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Latency Distribution */}
        <div className="p-5 bg-card border border-border rounded-lg space-y-4 shadow-2xs">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-600" /> Latency Distribution Histogram
          </h3>
          <div className="flex items-end justify-between h-32 pt-4 px-2 border-b border-border">
            {logs.slice(0, 10).map((item, idx) => {
              const maxL = Math.max(...logs.map((l) => l.latencyMs), 1);
              const heightPct = Math.max(10, Math.round((item.latencyMs / maxL) * 100));
              return (
                <div key={idx} className="flex flex-col items-center gap-1 group relative">
                  <div
                    className="w-6 bg-primary hover:bg-primary/80 rounded-t transition-all"
                    style={{ height: `${heightPct}%` }}
                    title={`${item.latencyMs} ms (${item.method} ${item.url})`}
                  />
                  <span className="text-[9px] text-muted-foreground">{item.latencyMs}ms</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
