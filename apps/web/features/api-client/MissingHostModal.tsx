'use client';

import React from 'react';
import { ShieldAlert, Globe, CheckCircle, Settings } from 'lucide-react';
import { Modal, InfoTooltip } from '@gateway-experience/shared';

export interface MissingHostModalProps {
  isOpen: boolean;
  activeEnvName: string;
  onClose: () => void;
  onAutoFixHost: () => void;
  onOpenGlobalEnvs: () => void;
}

export const MissingHostModal: React.FC<MissingHostModalProps> = ({
  isOpen,
  activeEnvName,
  onClose,
  onAutoFixHost,
  onOpenGlobalEnvs,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={
        <div className="flex items-center gap-2">
          <div className="p-1 bg-amber-500/15 text-amber-400 rounded">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <span>Missing Host Variable</span>
        </div>
      }
    >
      <div className="space-y-4 text-center">
        <div className="mx-auto w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center text-amber-400">
          <Globe className="h-6 w-6" />
        </div>

        <div className="space-y-1.5">
          <h3 className="font-bold text-sm text-foreground inline-flex items-center gap-1.5">
            <span>
              Mandatory <code className="text-primary font-mono font-bold">&#123;&#123;host&#125;&#125;</code> is undefined
            </span>
            <InfoTooltip
              content="The Experience Gateway resolves backend API routes using the mandatory {{host}} variable."
              label="Why is this required?"
            />
          </h3>
          <p className="text-xs text-muted-foreground">
            The active global environment (<span className="text-foreground font-semibold">{activeEnvName}</span>) does not have an active <code className="text-primary font-mono">host</code> variable.
          </p>
        </div>

        <div className="pt-3 flex flex-col sm:flex-row items-center justify-end gap-2 border-t border-border">
          <button
            type="button"
            onClick={onOpenGlobalEnvs}
            className="w-full sm:w-auto px-3 py-1.5 bg-secondary hover:bg-secondary/80 border border-border text-foreground font-medium rounded text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Settings className="h-3.5 w-3.5 text-primary" />
            <span>Manage Environments</span>
          </button>
          <button
            type="button"
            onClick={onAutoFixHost}
            className="w-full sm:w-auto px-4 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded text-xs transition shadow flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            <span>Set Default Host</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
