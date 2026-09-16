'use client';

import React from 'react';
import {
  Layers,
  Globe,
  Clock,
  Plus,
  KeyRound,
  ArrowRight,
} from 'lucide-react';
import type { Collection, Environment } from '@/types/api-client';
import { StatWidget, InfoTooltip } from '@gateway-experience/shared';

export interface ApiClientOverviewProps {
  collections: Collection[];
  environments: Environment[];
  historyCount: number;
  onAddCollection: () => void;
  onOpenEnvironments: () => void;
  onOpenApiKeys: () => void;
}

export const ApiClientOverview: React.FC<ApiClientOverviewProps> = ({
  collections,
  environments,
  historyCount,
  onAddCollection,
  onOpenEnvironments,
  onOpenApiKeys,
}) => {
  return (
    <div className="flex-1 bg-background text-foreground p-6 overflow-y-auto min-h-0 select-none space-y-6">
      {/* Banner */}
      <div className="bg-card border border-border rounded-xl p-5 flex items-center justify-between shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="relative w-6 h-6 rounded-md bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center shadow-2xs">
              <span>SG</span>
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-beak border border-card" />
            </div>
            <h1 className="text-base font-semibold text-foreground">
              Seagull API Console<span className="text-beak ml-0.5">.</span>
            </h1>
            <InfoTooltip
              content="Secure Enterprise API Gateway for Unified Layer Linking"
              label="About Seagull API Console"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onAddCollection}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:opacity-90 text-primary-foreground font-medium rounded-md text-xs transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Collection</span>
          </button>
        </div>
      </div>

      {/* Quick Launcher Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div
          onClick={onAddCollection}
          className="bg-card hover:bg-muted/50 border border-border hover:border-sidebar-ring/40 p-4 rounded-lg cursor-pointer transition space-y-2 group shadow-2xs"
        >
          <div className="flex items-center justify-between text-foreground">
            <Layers className="h-4 w-4" />
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
          </div>
          <div>
            <h3 className="font-semibold text-xs text-foreground">New Collection</h3>
            <p className="text-[11px] text-muted-foreground">Create backend or LLM proxy collection</p>
          </div>
        </div>

        <div
          onClick={onOpenEnvironments}
          className="bg-card hover:bg-muted/50 border border-border hover:border-sidebar-ring/40 p-4 rounded-lg cursor-pointer transition space-y-2 group shadow-2xs"
        >
          <div className="flex items-center justify-between text-foreground">
            <Globe className="h-4 w-4" />
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
          </div>
          <div>
            <h3 className="font-semibold text-xs text-foreground">Global Environments</h3>
            <p className="text-[11px] text-muted-foreground">Manage variable environments</p>
          </div>
        </div>

        <div
          onClick={onOpenApiKeys}
          className="bg-card hover:bg-muted/50 border border-border hover:border-sidebar-ring/40 p-4 rounded-lg cursor-pointer transition space-y-2 group shadow-2xs"
        >
          <div className="flex items-center justify-between text-foreground">
            <KeyRound className="h-4 w-4" />
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
          </div>
          <div>
            <h3 className="font-semibold text-xs text-foreground">API Keys</h3>
            <p className="text-[11px] text-muted-foreground">Manage gateway credentials</p>
          </div>
        </div>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatWidget
          title="Collections"
          value={collections.length}
          description="Registered backends"
          icon={<Layers className="h-4 w-4 text-muted-foreground" />}
        />
        <StatWidget
          title="Global Environments"
          value={environments.length}
          description="Environment profiles"
          icon={<Globe className="h-4 w-4 text-muted-foreground" />}
        />
        <StatWidget
          title="Execution History"
          value={historyCount}
          description="Workbench logs"
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
        />
      </div>
    </div>
  );
};
