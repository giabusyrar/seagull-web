'use client';

import React, { useState } from 'react';
import { ChevronDown, Copy, Check, Search } from 'lucide-react';
import type { ResponseData } from '@/types/api-client';
import { getStatusColorClass } from '@/lib/api-client-utils';

export interface ResponsePanelProps {
  response: ResponseData | null;
}

export const ResponsePanel: React.FC<ResponsePanelProps> = ({ response }) => {
  const [activeResTab, setActiveResTab] = useState<'body' | 'headers'>('body');
  const [copied, setCopied] = useState(false);
  const [responseFormat, setResponseFormat] = useState<'json' | 'hex' | 'base64' | 'raw'>('json');
  const [isFormatDropdownOpen, setIsFormatDropdownOpen] = useState(false);

  const formatOptions = [
    { id: 'json', label: 'JSON', symbol: '{ }', isGroup: false },
    { id: 'raw', label: 'Raw', symbol: 'T=', isGroup: true },
    { id: 'hex', label: 'Hex', symbol: '0x', isGroup: false },
    { id: 'base64', label: 'Base64', symbol: '64', isGroup: false },
  ] as const;

  const renderFormattedResponseBody = () => {
    if (!response?.body) return '';
    const raw = response.body;

    switch (responseFormat) {
      case 'json':
        try {
          return JSON.stringify(JSON.parse(raw), null, 2);
        } catch {
          return raw;
        }
      case 'hex':
        return Array.from(new TextEncoder().encode(raw))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join(' ');
      case 'base64':
        try {
          return btoa(raw);
        } catch {
          return raw;
        }
      case 'raw':
      default:
        return raw;
    }
  };

  const handleCopyResponse = () => {
    if (response?.body) {
      navigator.clipboard.writeText(response.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col bg-card overflow-hidden min-h-0">
      {/* Response Header Bar */}
      <div className="px-4 py-1.5 border-b border-border flex items-center justify-between bg-card shrink-0 text-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveResTab('body')}
            className={`font-semibold transition py-1 cursor-pointer ${
              activeResTab === 'body' ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Body
          </button>
          <button
            onClick={() => setActiveResTab('headers')}
            className={`font-semibold transition py-1 cursor-pointer ${
              activeResTab === 'headers' ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Headers{' '}
            <span className="text-[10px] bg-secondary px-1.5 py-0.2 rounded font-mono text-muted-foreground">
              {response ? Object.keys(response.headers).length : 0}
            </span>
          </button>
        </div>

        {/* Status Code & Metrics Badge */}
        {response && (() => {
          const statusColor = getStatusColorClass(response.status || 200);
          return (
            <div className="flex items-center gap-3 font-mono text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">Status:</span>
                <span className={`font-semibold px-2 py-0.5 rounded text-[11px] ${statusColor.bg} ${statusColor.text} border ${statusColor.border}`}>
                  {response.status || 200} {response.statusText || 'OK'}
                </span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Response Code Formatting Toolbar */}
      <div className="px-4 py-1 border-b border-border flex items-center justify-between bg-secondary/30 shrink-0 text-xs text-muted-foreground">
        <div className="flex items-center gap-3 relative">
          <div className="relative">
            <button
              onClick={() => setIsFormatDropdownOpen(!isFormatDropdownOpen)}
              className="flex items-center gap-1.5 bg-card hover:bg-muted border border-border rounded-md px-2.5 py-1 text-xs text-foreground font-medium transition cursor-pointer"
            >
              <span className="font-mono text-primary font-bold">
                {formatOptions.find((o) => o.id === responseFormat)?.symbol}
              </span>
              <span>{formatOptions.find((o) => o.id === responseFormat)?.label}</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>

            {/* Dropdown Menu Modal */}
            {isFormatDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsFormatDropdownOpen(false)}
                />
                <div className="absolute bottom-full mb-1 left-0 z-50 w-44 bg-popover border border-border rounded-lg shadow-xl py-1 text-xs select-none text-popover-foreground">
                  {formatOptions.map((opt) => (
                    <React.Fragment key={opt.id}>
                      {opt.isGroup && <div className="my-1 border-t border-border" />}
                      <button
                        onClick={() => {
                          setResponseFormat(opt.id);
                          setIsFormatDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-1.5 text-left hover:bg-secondary transition cursor-pointer ${
                          responseFormat === opt.id ? 'text-foreground font-medium bg-secondary' : 'text-muted-foreground'
                        }`}
                      >
                        <span className="w-4 text-center font-bold text-primary shrink-0">
                          {responseFormat === opt.id ? '✓' : ''}
                        </span>
                        <span className="w-6 text-center font-mono font-bold text-[11px] text-muted-foreground shrink-0">
                          {opt.symbol}
                        </span>
                        <span className="flex-1">{opt.label}</span>
                      </button>
                    </React.Fragment>
                  ))}
                </div>
              </>
            )}
          </div>
          <button className="hover:text-foreground transition cursor-pointer">Preview</button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyResponse}
            className="p-1 hover:bg-secondary hover:text-foreground rounded transition cursor-pointer"
            title="Copy Response"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          <button className="p-1 hover:bg-secondary hover:text-foreground rounded transition cursor-pointer" title="Search Response">
            <Search className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Response Viewer Area with Line Numbers */}
      <div className="flex-1 overflow-y-auto bg-secondary/15 min-h-0 font-mono text-xs">
        {!response ? (
          <div className="h-full flex items-center justify-center text-muted-foreground italic text-xs">
            Click &quot;Try&quot; or &quot;Send&quot; above to execute request.
          </div>
        ) : activeResTab === 'headers' ? (
          <div className="p-4 space-y-1">
            {Object.entries(response.headers).map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <span className="text-muted-foreground font-semibold w-40 truncate">{k}:</span>
                <span className="text-foreground flex-1 break-all">{v}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex min-h-full">
            {/* Line Numbers Sidebar */}
            <div className="w-10 bg-muted/40 text-muted-foreground text-right pr-3 py-3 select-none shrink-0 border-r border-border font-mono leading-relaxed">
              {renderFormattedResponseBody().split('\n').map((_, idx) => (
                <div key={idx}>{idx + 1}</div>
              ))}
            </div>

            {/* Main Code View */}
            <div className="flex-1 p-3 overflow-x-auto text-foreground leading-relaxed">
              <pre className="whitespace-pre font-mono text-xs">{renderFormattedResponseBody()}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
