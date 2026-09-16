'use client';

import React from 'react';
import { Terminal, Trash2, X } from 'lucide-react';
import { Button } from '@gateway-experience/shared';

export interface ConsoleDrawerProps {
  isOpen: boolean;
  logs: string[];
  onClose: () => void;
  onClear: () => void;
}

export const ConsoleDrawer: React.FC<ConsoleDrawerProps> = ({ isOpen, logs, onClose, onClear }) => {
  if (!isOpen) return null;

  return (
    <div className="h-48 bg-white border-t border-border flex flex-col shrink-0 text-xs font-mono select-none">
      <div className="px-4 py-1.5 border-b border-border flex items-center justify-between bg-white">
        <div className="flex items-center gap-2 text-foreground font-semibold">
          <Terminal className="h-3.5 w-3.5 text-primary" />
          <span>Falcon Console &amp; Network Logs</span>
          <span className="px-1.5 py-0.2 bg-muted text-muted-foreground rounded text-[10px] border border-border">
            {logs.length} entries
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="xs"
            onClick={onClear}
            leftIcon={<Trash2 className="h-3 w-3" />}
          >
            Clear Console
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onClose}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1 bg-slate-50 text-foreground leading-relaxed">
        {logs.length === 0 ? (
          <div className="text-muted-foreground italic text-xs">
            Console ready. Execute HTTP requests to view request &amp; header traffic.
          </div>
        ) : (
          logs.map((log, idx) => (
            <div key={idx} className="flex gap-2">
              <span className="text-muted-foreground select-none">[{idx + 1}]</span>
              <span className="text-emerald-700 font-semibold">{log}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
