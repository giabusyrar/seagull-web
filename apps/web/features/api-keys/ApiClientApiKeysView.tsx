'use client';

import React, { useState, useEffect } from 'react';
import { KeyRound, Trash2, Ban, Plus, X, Copy, Check } from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';
import type { Collection, ApiKey } from '@/types/api-client';
import { rememberTryApiKey } from '@/lib/try-api-key';
import { useToast } from '@/components/ui/toast';
import { Button, Input, EmptyState, ConfirmDialog, ChipMultiSelect, InfoTooltip } from '@gateway-experience/shared';

interface ApiClientApiKeysViewProps {
  collections: Collection[];
}

export const ApiClientApiKeysView: React.FC<ApiClientApiKeysViewProps> = ({ collections }) => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);

  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Create Key Modal Form States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [rateLimit, setRateLimit] = useState('');
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [allowedIps, setAllowedIps] = useState('');
  const [blockedIps, setBlockedIps] = useState('');
  const [restrictAccess, setRestrictAccess] = useState(false);
  const [restrictedCollectionIds, setRestrictedCollectionIds] = useState<string[]>([]);

  // Brand and App ID restriction states
  const [restrictBrands, setRestrictBrands] = useState(false);
  const [restrictedBrandIds, setRestrictedBrandIds] = useState<string[]>([]);
  const [availableBrands, setAvailableBrands] = useState<{ id: string; name: string }[]>([]);

  const [restrictApplications, setRestrictApplications] = useState(false);
  const [restrictedAppIds, setRestrictedAppIds] = useState<string[]>([]);
  const [appInput, setAppInput] = useState('');

  // New Generated Key Banner States
  const [createdPlaintextKey, setCreatedPlaintextKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const { toastError, toastSuccess } = useToast();

  const handleCopyKey = () => {
    if (!createdPlaintextKey) return;
    navigator.clipboard.writeText(createdPlaintextKey);
    setCopiedKey(true);
    toastSuccess('Key Copied', 'New API Key copied to clipboard.');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const fetchBrands = async () => {
    try {
      const res = await apiGet<{ success: boolean; events?: { id: string; brandId: string; name?: string }[] }>('/api/brand-events');
      if (res.success && Array.isArray(res.events) && res.events.length > 0) {
        const brandMap = new Map<string, string>();
        res.events.forEach((ev) => {
          if (ev.brandId && !brandMap.has(ev.brandId)) {
            brandMap.set(ev.brandId, ev.name || ev.brandId);
          }
        });
        setAvailableBrands(Array.from(brandMap.entries()).map(([id, name]) => ({ id, name })));
      } else {
        const refRes = await apiGet<{ success: boolean; items?: { id: string; name: string }[] }>('/api/reference/types/brand/items');
        if (refRes.success && Array.isArray(refRes.items) && refRes.items.length > 0) {
          setAvailableBrands(refRes.items.map((it) => ({ id: it.id, name: it.name })));
        }
      }
    } catch (err) {
      console.error('Failed to fetch brands:', err);
    }
  };

  const refresh = async () => {
    const keysRes = await apiGet<{ success: boolean; keys?: ApiKey[] }>('/api/api-keys');
    if (keysRes.success) setApiKeys(keysRes.keys || []);
    await fetchBrands();
  };

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      const [keysRes] = await Promise.all([
        apiGet<{ success: boolean; keys?: ApiKey[] }>('/api/api-keys'),
        fetchBrands(),
      ]);
      if (!isMounted) return;
      if (keysRes.success) setApiKeys(keysRes.keys || []);
      setLoading(false);
    };
    init();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddAppId = () => {
    const trimmed = appInput.trim();
    if (trimmed && !restrictedAppIds.includes(trimmed)) {
      setRestrictedAppIds((prev) => [...prev, trimmed]);
    }
    setAppInput('');
  };

  const handleRemoveAppId = (appId: string) => {
    setRestrictedAppIds((prev) => prev.filter((id) => id !== appId));
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setNewKeyName('');
    setRateLimit('');
    setSelectedMethods([]);
    setAllowedIps('');
    setBlockedIps('');
    setRestrictAccess(false);
    setRestrictedCollectionIds([]);
    setRestrictBrands(false);
    setRestrictedBrandIds([]);
    setRestrictApplications(false);
    setRestrictedAppIds([]);
    setAppInput('');
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    const body: Record<string, unknown> = {
      name: newKeyName.trim(),
      rateLimit: rateLimit ? parseInt(rateLimit, 10) : undefined,
      rateLimitPerMinute: rateLimit ? parseInt(rateLimit, 10) : undefined,
      allowedMethods: selectedMethods.length > 0 ? selectedMethods : undefined,
      allowedIps: allowedIps ? allowedIps.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
      blockedIps: blockedIps ? blockedIps.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
      allCollections: !restrictAccess,
      allowedCollectionIds: restrictAccess ? restrictedCollectionIds : undefined,
      collectionIds: restrictAccess ? restrictedCollectionIds : undefined,
      allBrands: !restrictBrands,
      allowedBrandIds: restrictBrands ? restrictedBrandIds : undefined,
      allApplications: !restrictApplications,
      allowedAppIds: restrictApplications ? restrictedAppIds : undefined,
    };

    const res = await apiPost<{ success: boolean; plaintextKey?: string; key?: ApiKey; error?: string }>('/api/api-keys', body);
    const plaintext = res.plaintextKey;
    if (res.success && plaintext) {
      setCreatedPlaintextKey(plaintext);
      rememberTryApiKey(plaintext);
      toastSuccess('API Key Created', 'Keep your new key stored safely.');
      handleCloseModal();
      refresh();
    } else {
      toastError('Creation Failed', res.error || 'Failed to create key');
    }
  };

  const handleRevoke = async (keyId: string) => {
    const res = await apiPut<{ success: boolean }>('/api/api-keys', { id: keyId, keyId, status: 'revoked' });
    if (res.success) {
      toastSuccess('Key Revoked', 'API Key status updated to revoked.');
      refresh();
    }
  };

  const handleDeleteKey = (keyId: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete API Key',
      message: 'Are you sure you want to delete this API Key? This action is permanent.',
      onConfirm: async () => {
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
        const res = await apiDelete<{ success: boolean; error?: string }>(`/api/api-keys?id=${keyId}&keyId=${keyId}`);
        if (res.success) {
          toastSuccess('Key Deleted', 'API Key deleted permanently.');
          refresh();
        } else {
          toastError('Delete Failed', res.error || 'Failed to delete key');
        }
      },
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-background text-foreground overflow-y-auto select-none h-full min-w-0 p-6 space-y-4">
      <div className="flex items-center gap-2">
        <KeyRound className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">External Keys</h2>
        <InfoTooltip
          content="Credentials external apps present to this gateway. Grants access to every collection by default."
          label="About External Keys"
        />
      </div>

      {loading ? (
        <div className="text-muted-foreground text-xs">Loading...</div>
      ) : (
        <div className="space-y-2 max-w-3xl">
          {createdPlaintextKey && (
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded px-3 py-2 text-xs shadow-2xs">
              <span className="text-emerald-800 font-semibold">New key (shown once - copy it now; kept for Try &amp; Send until this tab closes):</span>
              <span className="text-foreground font-mono font-bold flex-1 truncate select-all">{createdPlaintextKey}</span>
              <button
                onClick={handleCopyKey}
                className="p-1 text-muted-foreground hover:text-emerald-600 flex items-center gap-1 transition cursor-pointer"
                title="Copy API Key"
              >
                {copiedKey ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-[10px] text-emerald-600 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span className="text-[10px] text-muted-foreground hover:text-foreground font-semibold">Copy</span>
                  </>
                )}
              </button>
              <button onClick={() => setCreatedPlaintextKey(null)} className="p-1 text-muted-foreground hover:text-foreground ml-1 cursor-pointer">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {apiKeys.map((k) => (
            <div key={k.id} className="flex items-center gap-3 bg-card border border-border rounded px-3 py-2 text-xs shadow-2xs">
              <span className="text-foreground font-medium flex-1 truncate">{k.name}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground font-mono">••••{k.keyLastFour}</span>
              </div>
              <span className="text-[10px] text-muted-foreground">
                {k.allCollections ? 'all collections' : (k.allowedCollectionIds?.length ? `${k.allowedCollectionIds.length} collections` : 'restricted')}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {k.allBrands !== false ? 'all brands' : (k.allowedBrandIds?.length ? `${k.allowedBrandIds.length} brands` : 'restricted brands')}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {k.allApplications !== false ? 'all apps' : (k.allowedAppIds?.length ? `${k.allowedAppIds.length} app IDs` : 'restricted apps')}
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] border ${k.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>{k.status}</span>
              {k.status === 'active' && (
                <button onClick={() => handleRevoke(k.id)} className="p-1 text-muted-foreground hover:text-amber-700 cursor-pointer" title="Revoke">
                  <Ban className="h-3.5 w-3.5" />
                </button>
              )}
              <button onClick={() => handleDeleteKey(k.id)} className="p-1 text-muted-foreground hover:text-rose-700 cursor-pointer" title="Delete">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {apiKeys.length === 0 && (
            <EmptyState
              icon={<KeyRound className="h-8 w-8 text-muted-foreground" />}
              title="No External Keys Issued"
              description="Create an API Key to grant external applications access to this gateway."
            />
          )}

          <div className="pt-4 border-t border-border">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Create External Key
            </Button>
          </div>
        </div>
      )}

      {/* Create External Key Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-xs transition-all duration-200 animate-in fade-in flex items-center justify-center p-4 select-none text-xs text-foreground">
          <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-primary" />
                <h3 className="font-bold text-sm text-foreground">Create External Key</h3>
              </div>
              <button onClick={handleCloseModal} className="p-1 text-muted-foreground hover:text-foreground rounded cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Key Name */}
              <div className="space-y-1.5">
                <label className="block text-muted-foreground font-medium">Key Name <span className="text-rose-500">*</span></label>
                <Input
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g. mobile-app, partner-service"
                />
              </div>

              {/* Rate Limit per Minute */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <label className="text-muted-foreground font-medium">Rate Limit (optional)</label>
                  <InfoTooltip content="Maximum requests per minute for this key. Leave empty for unlimited." label="About Rate Limit" />
                </div>
                <Input
                  type="number"
                  value={rateLimit}
                  onChange={(e) => setRateLimit(e.target.value)}
                  placeholder="e.g. 100 (leave empty for unlimited)"
                />
              </div>

              {/* Allowed HTTP Methods */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <label className="text-muted-foreground font-medium">Allowed HTTP Methods</label>
                  <InfoTooltip content="Defaults to all methods when none are selected." label="About Allowed HTTP Methods" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map((method) => {
                    const isSelected = selectedMethods.includes(method);
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => {
                          setSelectedMethods((prev) =>
                            prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]
                          );
                        }}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold border transition cursor-pointer ${
                          isSelected
                            ? 'bg-primary/20 border-primary text-primary'
                            : 'bg-white border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        {method}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Allowed & Blocked IPs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <label className="text-muted-foreground font-medium">Allowed IPs (optional)</label>
                    <InfoTooltip content="Comma-separated list of IPs or CIDR ranges allowed to use this key." label="About Allowed IPs" />
                  </div>
                  <Input
                    value={allowedIps}
                    onChange={(e) => setAllowedIps(e.target.value)}
                    placeholder="e.g. 192.168.1.1, 10.0.0.0/24"
                    className="font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <label className="text-muted-foreground font-medium">Blocked IPs (optional)</label>
                    <InfoTooltip content="Comma-separated list of IPs or CIDR ranges blocked from using this key." label="About Blocked IPs" />
                  </div>
                  <Input
                    value={blockedIps}
                    onChange={(e) => setBlockedIps(e.target.value)}
                    placeholder="e.g. 192.168.1.99"
                    className="font-mono"
                  />
                </div>
              </div>

              {/* Restrict to Collections */}
              <div className="space-y-2 pt-2 border-t border-border">
                <label className="flex items-center gap-1.5 text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={restrictAccess}
                    onChange={(e) => setRestrictAccess(e.target.checked)}
                    className="accent-primary"
                  />
                  Restrict key access to specific collections
                </label>
                {restrictAccess && (
                  <ChipMultiSelect
                    tone="amber"
                    showCheckbox
                    className="pl-5 pt-1"
                    options={collections.map((c) => ({ value: c.id, label: c.name }))}
                    value={restrictedCollectionIds}
                    onChange={(next) => setRestrictedCollectionIds(next)}
                    emptyMessage="No collections found."
                  />
                )}
              </div>

              {/* Restrict to Brands */}
              <div className="space-y-2 pt-2 border-t border-border">
                <label className="flex items-center gap-1.5 text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={restrictBrands}
                    onChange={(e) => setRestrictBrands(e.target.checked)}
                    className="accent-primary"
                  />
                  Restrict key access to specific brands
                </label>
                {restrictBrands && (
                  <ChipMultiSelect
                    tone="amber"
                    showCheckbox
                    className="pl-5 pt-1"
                    options={availableBrands.map((b) => ({ value: b.id, label: b.name }))}
                    value={restrictedBrandIds}
                    onChange={(next) => setRestrictedBrandIds(next)}
                    emptyMessage="No brands found."
                  />
                )}
              </div>

              {/* Restrict to Application IDs */}
              <div className="space-y-2 pt-2 border-t border-border">
                <label className="flex items-center gap-1.5 text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={restrictApplications}
                    onChange={(e) => setRestrictApplications(e.target.checked)}
                    className="accent-primary"
                  />
                  Restrict key access to specific application IDs
                </label>
                {restrictApplications && (
                  <div className="pl-5 pt-1 space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={appInput}
                        onChange={(e) => setAppInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddAppId();
                          }
                        }}
                        placeholder="e.g. pos-checkout-v1, mobile-ios"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddAppId}
                        disabled={!appInput.trim()}
                      >
                        Add
                      </Button>
                    </div>
                    {restrictedAppIds.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {restrictedAppIds.map((appId) => (
                          <span
                            key={appId}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-amber-50 border border-amber-300 text-amber-900 font-mono"
                          >
                            {appId}
                            <button
                              type="button"
                              onClick={() => handleRemoveAppId(appId)}
                              className="hover:text-amber-950 p-0.5 cursor-pointer"
                              title="Remove"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-3 border-t border-border flex justify-end gap-2 bg-slate-50">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCloseModal}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleCreateKey}
                disabled={!newKeyName.trim()}
              >
                Generate Key
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmLabel="Delete"
        isDestructive={true}
      />
    </div>
  );
};
