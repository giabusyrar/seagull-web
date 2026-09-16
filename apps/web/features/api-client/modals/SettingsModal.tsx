'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Check } from 'lucide-react';
import { Modal, Button, Input, InfoTooltip } from '@gateway-experience/shared';
import { ApiClientUsersView } from '../ApiClientUsersView';
import { ApiClientAnalyticsView } from '../ApiClientAnalyticsView';
import { apiGet, apiPost } from '@/lib/api-client';
import { useToast } from '@/components/ui/toast';

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { toastError, toastSuccess } = useToast();
  const [activeTab, setActiveTab] = useState<'general' | 'users' | 'retention' | 'analytics'>('general');
  const [timeout, setTimeoutVal] = useState('0');
  const [followRedirects, setFollowRedirects] = useState(true);
  const [trimKeys, setTrimKeys] = useState(true);
  const [saved, setSaved] = useState(false);

  // Retention setting state
  const [retentionDays, setRetentionDays] = useState('7');
  const [isSavingRetention, setIsSavingRetention] = useState(false);
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);

  useEffect(() => {
    if (isOpen) {
      apiGet<{ success: boolean; settings?: Array<{ key: string; value: string }> }>('/api/settings').then((res) => {
        if (res.success && res.settings) {
          const item = res.settings.find((s) => s.key === 'log_retention_days');
          if (item) setRetentionDays(item.value);
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveGeneral = () => {
    setIsSavingGeneral(true);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setIsSavingGeneral(false);
      onClose();
    }, 600);
  };

  const handleSaveRetention = async () => {
    setIsSavingRetention(true);
    try {
      const res = await apiPost<{ success: boolean; error?: string }>('/api/settings', {
        key: 'log_retention_days',
        value: retentionDays,
      });
      if (res.success) {
        toastSuccess('Settings Saved', 'Log retention settings saved successfully');
      } else {
        toastError('Save Failed', res.error || 'Failed to save settings');
      }
    } finally {
      setIsSavingRetention(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title="Falcon Settings"
      icon={<Settings className="h-4 w-4 text-primary" />}
      isLoading={isSavingGeneral || isSavingRetention}
      loadingText={isSavingRetention ? 'Saving Retention Policy...' : 'Saving Settings...'}
    >
      <div className="flex flex-col h-[70vh]">
        {/* Tab Navigation */}
        <div className="flex border-b border-border bg-secondary/30 px-4 pt-2 gap-4">
          <button
            onClick={() => setActiveTab('general')}
            className={`pb-2 font-medium text-xs transition-colors border-b-2 ${
              activeTab === 'general'
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            General Settings
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-2 font-medium text-xs transition-colors border-b-2 ${
              activeTab === 'analytics'
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Analytics &amp; Metrics
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-2 font-medium text-xs transition-colors border-b-2 ${
              activeTab === 'users'
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            User Management (RBAC)
          </button>
          <button
            onClick={() => setActiveTab('retention')}
            className={`pb-2 font-medium text-xs transition-colors border-b-2 ${
              activeTab === 'retention'
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Log Retention Worker
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 overflow-y-auto flex-1">
          {activeTab === 'general' && (
            <div className="space-y-4 max-w-md">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <label className="text-muted-foreground font-medium text-xs">Request Timeout (ms)</label>
                  <InfoTooltip content="Set to 0 for no timeout limit." label="About Request Timeout" />
                </div>
                <Input
                  type="number"
                  value={timeout}
                  onChange={(e) => setTimeoutVal(e.target.value)}
                />
              </div>

              <div className="space-y-2 border-t border-border pt-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={followRedirects}
                    onChange={(e) => setFollowRedirects(e.target.checked)}
                    className="accent-[#d97706] rounded"
                  />
                  <span className="text-foreground">Automatically follow HTTP redirects</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={trimKeys}
                    onChange={(e) => setTrimKeys(e.target.checked)}
                    className="accent-[#d97706] rounded"
                  />
                  <span className="text-foreground">Trim whitespace from header &amp; param keys</span>
                </label>
              </div>

              <div className="pt-2 flex justify-end border-t border-border">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveGeneral}
                  leftIcon={saved ? <Check className="h-3.5 w-3.5" /> : undefined}
                >
                  {saved ? 'Saved' : 'Save Settings'}
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && <ApiClientAnalyticsView />}

          {activeTab === 'users' && <ApiClientUsersView />}

          {activeTab === 'retention' && (
            <div className="space-y-4 max-w-md">
              <div className="flex items-center gap-1.5">
                <h4 className="font-semibold text-foreground text-xs">Execution Log Retention Policy</h4>
                <InfoTooltip
                  content="The background worker cleans up execution logs older than the specified retention threshold."
                  label="About Execution Log Retention Policy"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <label className="text-muted-foreground font-medium text-xs">Retention Period (Days)</label>
                  <InfoTooltip
                    content={`Logs older than ${retentionDays || 7} days will be automatically purged by the Go Admin background ticker worker.`}
                    label="About Retention Period"
                  />
                </div>
                <Input
                  type="number"
                  min={1}
                  max={365}
                  value={retentionDays}
                  onChange={(e) => setRetentionDays(e.target.value)}
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveRetention}
                  isLoading={isSavingRetention}
                >
                  Save Retention Policy
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
