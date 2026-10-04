'use client';

import React, { useState } from 'react';
import { Search, LogOut, PanelLeft, LayoutGrid } from 'lucide-react';
import { Breadcrumb } from '@gateway-experience/shared';
import { logout } from '@/lib/auth-client';

export interface ApiClientHeaderProps {
  isAiOpen?: boolean;
  onToggleAi?: () => void;
  onNewRequest?: () => void;
  onOpenInvite?: () => void;
  onOpenSettings?: () => void;
  onGoToOverview?: () => void;
  onSearchChange?: (q: string) => void;
  onOpenApiKeys?: () => void;
  onToggleSidebar?: () => void;
  activeViewTitle?: string;
}

export const ApiClientHeader: React.FC<ApiClientHeaderProps> = ({
  onGoToOverview,
  onSearchChange,
  onToggleSidebar,
  activeViewTitle = 'API Workbench',
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchInput = (val: string) => {
    setSearchQuery(val);
    if (onSearchChange) onSearchChange(val);
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <header className="h-10 bg-card border-b border-border flex items-center justify-between px-3 select-none text-xs text-foreground shrink-0">
      {/* Left Brand Logo & Sidebar Toggle */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-1 hover:bg-muted hover:text-foreground rounded-md text-muted-foreground transition cursor-pointer"
            title="Toggle Sidebar (Ctrl+B)"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
        )}

        <div
          onClick={onGoToOverview}
          className="flex items-center gap-2 cursor-pointer font-semibold text-foreground hover:opacity-90 transition"
          title="Seagull: Secure Enterprise API Gateway for Unified Layer Linking"
        >
          <div className="relative w-5 h-5 bg-primary text-primary-foreground rounded-md flex items-center justify-center font-bold text-xs shadow-2xs">
            <span>S</span>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-beak border border-card" title="Seagull Beak Accent" />
          </div>
          <span className="text-xs font-bold tracking-tight text-foreground">
            Seagull<span className="text-beak ml-0.5">.</span>
          </span>
        </div>

        <Breadcrumb
          items={[
            { label: 'Gateway', href: '#' },
            { label: activeViewTitle },
          ]}
          onItemClick={(item) => {
            if (item.label === 'Gateway' && onGoToOverview) {
              onGoToOverview();
            }
          }}
          className="hidden sm:flex ml-1 text-xs"
        />
      </div>

      {/* Center Search Input */}
      <div className="flex-1 max-w-sm mx-4">
        <div className="relative flex items-center bg-secondary/70 border border-border focus-within:border-ring rounded-md px-2.5 h-7 transition">
          <Search className="h-3.5 w-3.5 text-muted-foreground mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search collections, routes..."
            value={searchQuery}
            onChange={(e) => handleSearchInput(e.target.value)}
            className="w-full bg-transparent outline-none text-xs text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-destructive text-xs font-medium px-2 py-1 rounded-md hover:bg-muted transition-colors cursor-pointer"
          title="Log Out"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};
