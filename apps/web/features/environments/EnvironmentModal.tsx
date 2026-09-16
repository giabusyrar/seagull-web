'use client';

import React, { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import type { Environment } from '@/types/api-client';
import { Modal, Button } from '@gateway-experience/shared';

interface ApiClientEnvironmentModalProps {
  isOpen: boolean;
  environments: Environment[];
  selectedEnvId: string;
  onClose: () => void;
  onUpdateEnvironments: (envs: Environment[]) => void;
  onSelectEnv: (id: string) => void;
}

export const EnvironmentModal: React.FC<ApiClientEnvironmentModalProps> = ({
  isOpen,
  environments,
  selectedEnvId,
  onClose,
  onUpdateEnvironments,
  onSelectEnv,
}) => {
  const [localEnvs, setLocalEnvs] = useState<Environment[]>(environments);
  const [activeEnvId, setActiveEnvId] = useState<string>(
    selectedEnvId || (environments[0]?.id ?? '')
  );

  // Synchronize localEnvs whenever the modal is opened
  useEffect(() => {
    if (isOpen) {
      setLocalEnvs(environments);
      setActiveEnvId(selectedEnvId || (environments[0]?.id ?? ''));
    }
  }, [isOpen, environments, selectedEnvId]);

  if (!isOpen) return null;

  const currentEnv = localEnvs.find((e) => e.id === activeEnvId);

  const getHostValue = (env?: Environment): string => {
    if (!env) return '';
    const hostVar = env.variables.find((v) => v.key === 'host');
    return hostVar ? hostVar.value : '';
  };

  const setHostValue = (envId: string, val: string) => {
    const updated = localEnvs.map((e) => {
      if (e.id === envId) {
        const existing = e.variables.find((v) => v.key === 'host');
        if (existing) {
          return {
            ...e,
            variables: e.variables.map((v) => (v.key === 'host' ? { ...v, value: val } : v)),
          };
        } else {
          return {
            ...e,
            variables: [
              ...e.variables,
              { id: 'v-' + Date.now(), key: 'host', value: val, enabled: true, isSecret: false },
            ],
          };
        }
      }
      return e;
    });
    setLocalEnvs(updated);
  };

  const handleCloseAndSave = () => {
    onUpdateEnvironments(localEnvs);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseAndSave}
      size="lg"
      title={
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          <span>Environments</span>
        </div>
      }
      footer={
        <Button
          variant="primary"
          size="sm"
          onClick={handleCloseAndSave}
        >
          Done
        </Button>
      }
    >
      <div className="flex-1 flex overflow-hidden min-h-[260px] -m-4">
        {/* Environments Sidebar List */}
        <div className="w-44 bg-muted/40 border-r border-border p-3 flex flex-col shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">ENVIRONMENTS</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1">
            {localEnvs.map((env) => {
              const isActive = env.id === activeEnvId;
              const isSelected = env.id === selectedEnvId;

              return (
                <div
                  key={env.id}
                  onClick={() => setActiveEnvId(env.id)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded cursor-pointer transition text-xs ${
                    isActive ? 'bg-beak/10 text-foreground font-semibold' : 'hover:bg-muted text-muted-foreground'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate flex-1 min-w-0">
                    <span className="truncate" title={env.name}>
                      {env.name}
                    </span>
                    {isSelected && (
                      <span className="px-1 py-0.2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded text-[9px] font-mono font-bold shrink-0">
                        Active
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Minimal Target Host Setting Area */}
        <div className="flex-1 p-5 flex flex-col bg-background overflow-hidden min-h-0 space-y-4">
          {currentEnv ? (
            <>
              <div className="flex items-center justify-between shrink-0">
                <h3 className="font-bold text-base text-foreground">{currentEnv.name}</h3>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs text-muted-foreground font-medium select-none">Active</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={selectedEnvId === currentEnv.id}
                    onClick={() => onSelectEnv(currentEnv.id)}
                    title={selectedEnvId === currentEnv.id ? 'Environment is active' : 'Click to activate'}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      selectedEnvId === currentEnv.id ? 'bg-emerald-500' : 'bg-secondary border border-border'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        selectedEnvId === currentEnv.id ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg border border-border space-y-2">
                <label className="block text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                  Target Host
                </label>
                <div className="flex items-center bg-background border border-border focus-within:border-ring rounded-md overflow-hidden h-9 font-mono text-xs">
                  <input
                    type="text"
                    placeholder="e.g. https://experience-proxy.example.com"
                    value={getHostValue(currentEnv)}
                    onChange={(e) => setHostValue(currentEnv.id, e.target.value)}
                    className="flex-1 bg-transparent px-3 text-xs text-foreground outline-none font-mono placeholder:text-muted-foreground"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground italic text-xs">
              Select an environment profile from the sidebar.
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
