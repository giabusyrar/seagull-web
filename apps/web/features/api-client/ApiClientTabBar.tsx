'use client';

import React, { useState } from 'react';
import {
  Layers,
  Plus,
  X,
  Globe,
  Eye,
  EyeOff,
  Lock,
  Edit2,
  FileText,
  Target,
  Puzzle,
  Tag,
  KeyRound,
  Palette,
} from 'lucide-react';
import { SearchableSelect, type SelectOption } from '@gateway-experience/shared';
import type { TabItem, Environment } from '@/types/api-client';
import { METHOD_COLORS } from '@/lib/api-client-utils';

export interface ApiClientTabBarProps {
  tabs: TabItem[];
  activeTabId: string;
  environments: Environment[];
  selectedEnvId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onNewTab: () => void;
  onSelectEnv?: (envId: string) => void;
  onOpenEnvironmentsModal?: () => void;
  onSave?: () => void;
  onShare?: () => void;
  onTrySend?: () => void;
}

export const ApiClientTabBar: React.FC<ApiClientTabBarProps> = ({
  tabs,
  activeTabId,
  environments,
  selectedEnvId,
  onSelectTab,
  onCloseTab,
  onNewTab,
  onSelectEnv,
  onOpenEnvironmentsModal,
}) => {
  const [showQuickLook, setShowQuickLook] = useState(false);
  const [unmaskedQuickLook, setUnmaskedQuickLook] = useState<Record<string, boolean>>({});

  const activeEnv = environments.find((e) => e.id === selectedEnvId);

  const envOptions: SelectOption[] = environments.map((env) => ({
    value: env.id,
    label: env.name,
  }));

  const toggleQuickLookUnmask = (varId: string) => {
    setUnmaskedQuickLook((prev) => ({ ...prev, [varId]: !prev[varId] }));
  };

  return (
    <div className="h-9 bg-secondary/80 border-b border-border flex items-center justify-between px-2 select-none shrink-0 text-xs text-muted-foreground relative">
      {/* Tabs List */}
      <div className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar px-2 min-w-0">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const methodColors = tab.method ? METHOD_COLORS[tab.method] : null;

          return (
            <div
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`group flex items-center gap-1.5 px-3 h-8 border-t-2 transition cursor-pointer shrink-0 max-w-[180px] rounded-t ${
                isActive
                  ? 'bg-background border-beak text-foreground font-semibold shadow-2xs'
                  : 'bg-secondary border-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {tab.method && methodColors ? (
                <span className={`text-[10px] font-bold font-mono uppercase ${methodColors.text}`}>
                  {tab.method}
                </span>
              ) : tab.type === 'forms' ? (
                <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              ) : tab.type === 'scoring' ? (
                <Target className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              ) : tab.type === 'matching' ? (
                <Puzzle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              ) : tab.type === 'tryon' ? (
                <Palette className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              ) : tab.type === 'reference' ? (
                <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              ) : tab.type === 'api-keys' ? (
                <KeyRound className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              ) : (
                <Layers className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <span className="truncate text-xs" title={tab.title}>{tab.title}</span>
              {tab.isDirty && <span className="w-1.5 h-1.5 bg-beak rounded-full shrink-0" />}

              {tabs.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tab.id);
                  }}
                  className="p-0.5 opacity-0 group-hover:opacity-100 hover:bg-muted hover:text-foreground rounded transition shrink-0 ml-auto cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          );
        })}

        <button
          onClick={onNewTab}
          className="p-1 hover:bg-muted hover:text-foreground rounded text-muted-foreground transition shrink-0 ml-1 cursor-pointer"
          title="New Request Tab"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Top-Bar Environment Switcher & Quick Look */}
      <div className="flex items-center gap-1.5 pl-2 border-l border-border shrink-0">
        <Globe className="h-3.5 w-3.5 text-primary" />
        <div className="w-40">
          <SearchableSelect
            value={selectedEnvId || ''}
            onChange={(v) => onSelectEnv?.(v)}
            options={envOptions}
            placeholder="No Environment"
            searchPlaceholder="Search environments..."
          />
        </div>

        {onOpenEnvironmentsModal && (
          <button
            type="button"
            onClick={onOpenEnvironmentsModal}
            className="p-1 rounded transition border bg-card border-border text-muted-foreground hover:text-foreground hover:border-ring/40 cursor-pointer"
            title="Edit / Manage Environments"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
        )}

        <button
          type="button"
          onClick={() => setShowQuickLook(!showQuickLook)}
          className={`p-1 rounded transition border cursor-pointer ${
            showQuickLook
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-ring/40'
          }`}
          title="Environment Quick Look"
        >
          <Eye className="h-3.5 w-3.5" />
        </button>

        {/* Quick Look Popover */}
        {showQuickLook && (
          <div className="absolute right-2 top-10 z-50 bg-popover border border-border rounded-md shadow-lg w-80 p-3 text-xs text-popover-foreground">
            <div className="flex items-center justify-between pb-2 border-b border-border mb-2">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-primary" />
                {activeEnv ? activeEnv.name : 'No Active Environment'}
              </span>
              <div className="flex items-center gap-1">
                {onOpenEnvironmentsModal && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowQuickLook(false);
                      onOpenEnvironmentsModal();
                    }}
                    className="p-1 text-muted-foreground hover:text-primary rounded flex items-center gap-1 text-[10px] cursor-pointer"
                    title="Edit Environment Settings"
                  >
                    <Edit2 className="h-3 w-3" /> Edit
                  </button>
                )}
                <button
                  onClick={() => setShowQuickLook(false)}
                  className="p-1 text-muted-foreground hover:text-foreground rounded cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {!activeEnv || activeEnv.variables.length === 0 ? (
              <div className="text-center text-muted-foreground py-3 italic">
                No variables in active environment.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {activeEnv.variables.map((v) => {
                  const isSecret = Boolean(v.isSecret);
                  const isUnmasked = Boolean(unmaskedQuickLook[v.id]);

                  return (
                    <div
                      key={v.id}
                      className="flex items-center justify-between bg-muted/60 p-1.5 rounded border border-border font-mono text-[11px]"
                    >
                      <div className="flex items-center gap-1 text-foreground font-semibold truncate max-w-[120px]">
                        {isSecret && <Lock className="h-3 w-3 text-beak shrink-0" />}
                        <span className="truncate">{v.key}</span>
                      </div>
                      <div className="flex items-center gap-1 text-foreground truncate">
                        <span className="truncate max-w-[100px]">
                          {isSecret && !isUnmasked ? '••••••••' : v.value || '<empty>'}
                        </span>
                        {isSecret && (
                          <button
                            type="button"
                            onClick={() => toggleQuickLookUnmask(v.id)}
                            className="p-0.5 text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            {isUnmasked ? (
                              <EyeOff className="h-3 w-3 text-beak" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {onOpenEnvironmentsModal && (
              <button
                onClick={() => {
                  setShowQuickLook(false);
                  onOpenEnvironmentsModal();
                }}
                className="w-full mt-2 pt-2 border-t border-border text-center text-primary hover:underline text-[11px] font-semibold block cursor-pointer"
              >
                Manage Environments →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
