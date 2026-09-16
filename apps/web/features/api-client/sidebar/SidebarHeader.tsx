'use client';

import React from 'react';
import { Layers, Plus, RefreshCw, PanelLeftClose, X } from 'lucide-react';

export interface SidebarHeaderProps {
  onAddCollection?: () => void;
  onToggleCollapse?: () => void;
  onCloseMobile?: () => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  onAddCollection,
  onToggleCollapse,
  onCloseMobile,
}) => {
  return (
    <div className="p-2 border-b border-sidebar-border flex items-center justify-between gap-1 bg-sidebar shrink-0">
      <div className="flex items-center gap-2 font-semibold text-xs text-foreground tracking-wide min-w-0">
        <span className="truncate text-xs font-semibold">Navigator</span>
      </div>

      <div className="flex items-center gap-1 shrink-0">

        {onAddCollection && (
          <button
            type="button"
            onClick={onAddCollection}
            title="Create Collection"
            className="flex items-center gap-1 px-2 py-1 bg-primary hover:opacity-90 text-primary-foreground rounded font-medium text-xs transition cursor-pointer"
          >
            <Plus className="h-3 w-3" />
            <span className="hidden sm:inline">New</span>
          </button>
        )}

        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            title="Collapse Sidebar"
            className="hidden md:flex p-1 hover:bg-muted hover:text-foreground text-muted-foreground rounded transition cursor-pointer"
          >
            <PanelLeftClose className="h-3.5 w-3.5" />
          </button>
        )}

        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            title="Close Drawer"
            className="md:hidden p-1 hover:bg-muted hover:text-foreground text-muted-foreground rounded transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};
