'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, Radio, Edit2, Loader2 } from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';
import type { Collection, CollectionEnvironment, GlobalSecret } from '@/types/api-client';
import { useToast } from '@/components/ui/toast';
import { ConfirmDialog, Modal, SearchableSelect, InfoTooltip, type SelectOption } from '@gateway-experience/shared';

interface ApiClientCollectionSettingsModalProps {
  collection?: Collection | null;
  onClose: () => void;
  onCollectionUpdated: () => void;
}

const isCollectionDescendant = (targetId: string, parentId: string, collections: Collection[]) => {
  if (targetId === parentId) return true;
  let current: string | undefined | null = targetId;
  const visited = new Set<string>();
  while (current && !visited.has(current)) {
    visited.add(current);
    const parent = collections.find((c) => c.id === current)?.parentId;
    if (parent === parentId) return true;
    current = parent;
  }
  return false;
};

type Tab = 'general' | 'environments' | 'variables' | 'knowledge';


interface ParameterRow {
  id: string;
  kind: string;
  key: string;
  value: string;
  enabled: boolean;
}

interface VariableRow {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export const CollectionSettingsModal: React.FC<ApiClientCollectionSettingsModalProps> = ({
  collection,
  onClose,
  onCollectionUpdated,
}) => {
  const { toastError, toastSuccess } = useToast();
  const isCreateMode = !collection;

  const [tab, setTab] = useState<Tab>('general');
  const [name, setName] = useState(collection?.name || '');
  const [parentId, setParentId] = useState<string>(collection?.parentId || '');
  const [isCore, setIsCore] = useState<boolean>(collection?.isCore ?? false);
  const [isTogglingCore, setIsTogglingCore] = useState(false);
  const [allCollections, setAllCollections] = useState<Collection[]>([]);
  const [type, setType] = useState<'proxy' | 'llm' | 'core-engine'>((collection?.type as 'proxy' | 'llm' | 'core-engine') || 'proxy');
  const [provider, setProvider] = useState<string>(collection?.provider || 'openai');
  const [originalPrefix, setOriginalPrefix] = useState((collection?.originalPrefix || '').replace(/^\/+|\/+$/g, ''));
  const [healthCheckPath, setHealthCheckPath] = useState(collection?.healthCheckPath || '/health');
  const [knowledgeBase, setKnowledgeBase] = useState(collection?.knowledgeBase || '');
  const [outboundSecretId, setOutboundSecretId] = useState(collection?.outboundSecretId || '');
  const [secrets, setSecrets] = useState<GlobalSecret[]>([]);

  const [generalSaved, setGeneralSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const [environments, setEnvironments] = useState<CollectionEnvironment[]>([]);
  const [activeEnvironmentId, setActiveEnvironmentId] = useState<string | null>(collection?.activeEnvironmentId || null);
  // An environment is named by whoever adds it; the gateway stores any name.
  const [selectedEnvName, setSelectedEnvName] = useState<string>('');
  const [envHostInput, setEnvHostInput] = useState<string>('');
  const [envSaveStatus, setEnvSaveStatus] = useState<boolean>(false);

  useEffect(() => {
    setEnvHostInput('');
  }, [selectedEnvName]);

  const [editingEnvId, setEditingEnvId] = useState<string | null>(null);
  const [editingEnvHost, setEditingEnvHost] = useState('');

  const [parameters, setParameters] = useState<ParameterRow[]>([]);
  const [variables, setVariables] = useState<VariableRow[]>([]);
  const [newParamKind, setNewParamKind] = useState<'header' | 'query'>('header');
  const [newParamKey, setNewParamKey] = useState('');
  const [newParamValue, setNewParamValue] = useState('');
  const [newVarKey, setNewVarKey] = useState('');
  const [newVarValue, setNewVarValue] = useState('');

  const [editingParamId, setEditingParamId] = useState<string | null>(null);
  const [editingParamKind, setEditingParamKind] = useState<'header' | 'query'>('header');
  const [editingParamKey, setEditingParamKey] = useState('');
  const [editingParamValue, setEditingParamValue] = useState('');

  const [editingVarId, setEditingVarId] = useState<string | null>(null);
  const [editingVarKey, setEditingVarKey] = useState('');
  const [editingVarValue, setEditingVarValue] = useState('');

  const [knowledgeSaved, setKnowledgeSaved] = useState(false);

  useEffect(() => {
    apiGet<{ success: boolean; secrets?: GlobalSecret[] }>('/api/secrets').then((res) => {
      if (res.success && res.secrets) setSecrets(res.secrets);
    });

    apiGet<{ success: boolean; collections?: Collection[] }>('/api/collections').then((res) => {
      if (res.success && res.collections) setAllCollections(res.collections);
    });

    if (!collection) return;
    setName(collection.name);
    setParentId(collection.parentId || '');
    setIsCore(collection.isCore ?? false);
    setType(collection.type);
    setProvider(collection.provider || 'openai');
    setOriginalPrefix((collection.originalPrefix || '').replace(/^\/+|\/+$/g, ''));
    setHealthCheckPath(collection.healthCheckPath);
    setActiveEnvironmentId(collection.activeEnvironmentId);
    setKnowledgeBase(collection.knowledgeBase || '');
    setOutboundSecretId(collection.outboundSecretId || '');

    if (collection.type === 'proxy') {
      apiGet<{ success: boolean; environments?: CollectionEnvironment[] }>(`/api/collections/${collection.id}/environments`).then((res) => {
        if (res.success && res.environments) setEnvironments(res.environments);
      });
      apiGet<{ success: boolean; parameters?: ParameterRow[] }>(`/api/collections/${collection.id}/parameters`).then((res) => {
        if (res.success && res.parameters) setParameters(res.parameters);
      });
    }

    apiGet<{ success: boolean; variables?: VariableRow[] }>(`/api/collections/${collection.id}/global-variables`).then((res) => {
      if (res.success && res.variables) setVariables(res.variables);
    });
  }, [collection]);

  const handleSaveOrUpdateEnvironment = async () => {
    if (!selectedEnvName || !envHostInput.trim()) return;

    if (isCreateMode) {
      const existing = environments.find((e) => e.name.toLowerCase() === selectedEnvName.toLowerCase());
      if (existing) {
        setEnvironments((prev) => prev.map((e) => (e.id === existing.id ? { ...e, targetHost: envHostInput.trim() } : e)));
      } else {
        const newEnv: CollectionEnvironment = {
          id: 'temp-' + Date.now(),
          collectionId: '',
          name: selectedEnvName,
          targetHost: envHostInput.trim(),
        };
        setEnvironments((prev) => [...prev, newEnv]);
      }
      setEnvHostInput('');
      return;
    }

    const existing = environments.find((e) => e.name.toLowerCase() === selectedEnvName.toLowerCase());
    if (existing) {
      const res = await apiPut<{ success: boolean; error?: string }>(`/api/collections/${collection.id}/environments`, {
        envId: existing.id,
        targetHost: envHostInput.trim(),
      });
      if (res.success) {
        setEnvironments((prev) => prev.map((e) => (e.id === existing.id ? { ...e, targetHost: envHostInput.trim() } : e)));
        setEnvSaveStatus(true);
        setTimeout(() => setEnvSaveStatus(false), 2000);
        onCollectionUpdated();
      } else {
        toastError('Update Failed', res.error || 'Failed to update environment');
      }
    } else {
      const res = await apiPost<{ success: boolean; environment?: CollectionEnvironment; error?: string }>(`/api/collections/${collection.id}/environments`, {
        name: selectedEnvName,
        targetHost: envHostInput.trim(),
      });
      if (res.success && res.environment) {
        const newEnv = res.environment;
        setEnvironments((prev) => [...prev, newEnv]);
        if (!activeEnvironmentId) {
          setActiveEnvironmentId(newEnv.id);
        }
        setEnvSaveStatus(true);
        setTimeout(() => setEnvSaveStatus(false), 2000);
        onCollectionUpdated();
      } else {
        toastError('Creation Failed', res.error || 'Failed to create environment');
      }
    }
  };

  const handleUpdateTargetHost = async (envId: string) => {
    if (!editingEnvHost.trim()) return;
    if (isCreateMode) {
      setEnvironments((prev) => prev.map((e) => (e.id === envId ? { ...e, targetHost: editingEnvHost.trim() } : e)));
      setEditingEnvId(null);
      return;
    }
    const res = await apiPut<{ success: boolean }>(`/api/collections/${collection.id}/environments`, {
      envId,
      targetHost: editingEnvHost.trim(),
    });
    if (res.success) {
      setEnvironments((prev) => prev.map((e) => (e.id === envId ? { ...e, targetHost: editingEnvHost.trim() } : e)));
      setEditingEnvId(null);
      onCollectionUpdated();
    }
  };

  const handleSetActive = async (envId: string) => {
    if (isCreateMode) {
      setActiveEnvironmentId(envId);
      return;
    }
    const res = await apiPut<{ success: boolean }>(`/api/collections/${collection.id}`, { activeEnvironmentId: envId });
    if (res.success) {
      setActiveEnvironmentId(envId);
      onCollectionUpdated();
    }
  };

  const handleDeleteEnvironment = (envId: string) => {
    if (isCreateMode) {
      setEnvironments((prev) => prev.filter((e) => e.id !== envId));
      return;
    }
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Environment',
      message: 'Are you sure you want to delete this environment?',
      onConfirm: async () => {
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
        const res = await apiDelete<{ success: boolean; error?: string }>(`/api/collections/${collection?.id}/environments?envId=${envId}`);
        if (res.success) {
          setEnvironments((prev) => prev.filter((e) => e.id !== envId));
          toastSuccess('Environment Deleted', 'Environment deleted successfully.');
        } else {
          toastError('Delete Failed', res.error || 'Failed to delete environment');
        }
      },
    });
  };

  const handleAddParameter = async () => {
    if (!newParamKey.trim() || !newParamValue.trim()) return;
    if (isCreateMode) {
      setParameters((prev) => [
        ...prev,
        { id: 'temp-param-' + Date.now(), kind: newParamKind, key: newParamKey.trim(), value: newParamValue.trim(), enabled: true },
      ]);
      setNewParamKey('');
      setNewParamValue('');
      return;
    }
    const res = await apiPost<{ success: boolean; parameter?: ParameterRow }>(`/api/collections/${collection.id}/parameters`, {
      kind: newParamKind, key: newParamKey.trim(), value: newParamValue.trim(),
    });
    if (res.success && res.parameter) {
      setParameters((prev) => [...prev, res.parameter!]);
      setNewParamKey('');
      setNewParamValue('');
    }
  };

  const handleUpdateParameter = async (paramId: string) => {
    if (!editingParamKey.trim()) return;
    if (isCreateMode) {
      setParameters((prev) =>
        prev.map((p) => (p.id === paramId ? { ...p, kind: editingParamKind, key: editingParamKey.trim(), value: editingParamValue.trim() } : p))
      );
      setEditingParamId(null);
      return;
    }
    const res = await apiPut<{ success: boolean; parameter?: ParameterRow; error?: string }>(`/api/collections/${collection.id}/parameters`, {
      id: paramId,
      parameterId: paramId,
      kind: editingParamKind,
      key: editingParamKey.trim(),
      value: editingParamValue.trim(),
    });
    if (res.success) {
      setParameters((prev) =>
        prev.map((p) => (p.id === paramId ? { ...p, kind: editingParamKind, key: editingParamKey.trim(), value: editingParamValue.trim() } : p))
      );
      setEditingParamId(null);
    } else {
      toastError('Update Failed', res.error || 'Failed to update parameter');
    }
  };

  const handleUpdateVariable = async (varId: string) => {
    if (!editingVarKey.trim()) return;
    if (isCreateMode) {
      setVariables((prev) =>
        prev.map((v) => (v.id === varId ? { ...v, key: editingVarKey.trim(), value: editingVarValue.trim() } : v))
      );
      setEditingVarId(null);
      return;
    }
    const res = await apiPut<{ success: boolean; variable?: VariableRow; error?: string }>(`/api/collections/${collection.id}/global-variables`, {
      id: varId,
      variableId: varId,
      key: editingVarKey.trim(),
      value: editingVarValue.trim(),
    });
    if (res.success) {
      setVariables((prev) =>
        prev.map((v) => (v.id === varId ? { ...v, key: editingVarKey.trim(), value: editingVarValue.trim() } : v))
      );
      setEditingVarId(null);
    } else {
      toastError('Update Failed', res.error || 'Failed to update variable');
    }
  };

  const handleDeleteParameter = (id: string) => {
    if (isCreateMode) {
      setParameters((prev) => prev.filter((p) => p.id !== id));
      return;
    }
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Parameter',
      message: 'Are you sure you want to delete this parameter?',
      onConfirm: async () => {
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
        const res = await apiDelete<{ success: boolean }>(`/api/collections/${collection?.id}/parameters?parameterId=${id}`);
        if (res.success) {
          setParameters((prev) => prev.filter((p) => p.id !== id));
          toastSuccess('Parameter Deleted', 'Parameter deleted successfully.');
        }
      },
    });
  };

  const handleAddVariable = async () => {
    if (!newVarKey.trim() || !newVarValue.trim()) return;
    if (isCreateMode) {
      setVariables((prev) => [
        ...prev,
        { id: 'temp-var-' + Date.now(), key: newVarKey.trim(), value: newVarValue.trim(), enabled: true },
      ]);
      setNewVarKey('');
      setNewVarValue('');
      return;
    }
    const res = await apiPost<{ success: boolean; variable?: VariableRow }>(`/api/collections/${collection?.id}/global-variables`, {
      key: newVarKey.trim(), value: newVarValue.trim(),
    });
    if (res.success && res.variable) {
      setVariables((prev) => [...prev, res.variable!]);
      setNewVarKey('');
      setNewVarValue('');
    }
  };

  const handleDeleteVariable = (id: string) => {
    if (isCreateMode) {
      setVariables((prev) => prev.filter((v) => v.id !== id));
      return;
    }
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Variable',
      message: 'Are you sure you want to delete this variable?',
      onConfirm: async () => {
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
        const res = await apiDelete<{ success: boolean }>(`/api/collections/${collection?.id}/global-variables?variableId=${id}`);
        if (res.success) {
          setVariables((prev) => prev.filter((v) => v.id !== id));
          toastSuccess('Variable Deleted', 'Variable deleted successfully.');
        }
      },
    });
  };

  const handleToggleCore = async (next: boolean) => {
    if (!collection) return;
    setIsTogglingCore(true);
    try {
      const res = await apiPut<{ success: boolean; error?: string }>(`/api/collections/${collection.id}`, { isCore: next });
      if (res.success) {
        setIsCore(next);
        onCollectionUpdated();
        toastSuccess(next ? 'Marked as Core' : 'Core Protection Removed', `"${collection.name}" is now ${next ? 'protected' : 'editable'}.`);
      } else {
        toastError('Toggle Failed', res.error || 'Failed to update core status');
      }
    } catch (err: any) {
      toastError('Toggle Failed', err?.message || 'Failed to reach the server');
    } finally {
      setIsTogglingCore(false);
    }
  };

  const handleSaveGeneral = async () => {
    if (!collection) return;

    let cleanPrefix = originalPrefix;
    if (collection.type === 'proxy') {
      cleanPrefix = originalPrefix.replace(/^\/+|\/+$/g, '').trim();
      if (cleanPrefix && !/^[a-zA-Z0-9_\-]+$/.test(cleanPrefix)) {
        toastError('Invalid Collection Path', "Collection path must consist of a single path variable (e.g. 'inventory') without '/' slashes.");
        return;
      }
      setOriginalPrefix(cleanPrefix);
    }

    setIsSubmitting(true);
    try {
      if (parentId) {
        // Convert this collection into a folder inside the selected parent collection
        const res = await apiPost<{ success: boolean; error?: string }>(`/api/collections/${collection.id}/convert-to-folder`, {
          targetCollectionId: parentId,
          targetParentGroupId: null,
        });
        if (res.success) {
          toastSuccess('Collection Converted', 'Collection converted to folder in target parent collection.');
          setGeneralSaved(true);
          onCollectionUpdated();
          onClose();
          return;
        } else {
          toastError('Conversion Failed', res.error || 'Failed to convert collection to folder');
          return;
        }
      }

      const res = await apiPut<{ success: boolean; error?: string }>(`/api/collections/${collection.id}`, {
        name,
        parentId: null,
        ...(collection.type === 'proxy' ? { originalPrefix: cleanPrefix, healthCheckPath } : {}),
        ...(collection.type === 'llm' ? { outboundSecretId } : {}),
      });
      if (res.success) {
        setGeneralSaved(true);
        onCollectionUpdated();
        onClose();
      } else {
        toastError('Save Failed', res.error || 'Failed to save collection settings');
      }
    } catch (err: any) {
      toastError('Save Failed', err?.message || 'Failed to reach the server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveKnowledgeBase = async () => {
    if (!collection) return;
    setIsSubmitting(true);
    try {
      const res = await apiPut<{ success: boolean; error?: string }>(`/api/collections/${collection.id}`, { knowledgeBase });
      if (res.success) {
        setKnowledgeSaved(true);
        onCollectionUpdated();
        onClose();
      } else {
        toastError('Save Failed', res.error || 'Failed to save knowledge base');
      }
    } catch (err: any) {
      toastError('Save Failed', err?.message || 'Failed to reach the server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCollection = async () => {
    if (!name.trim()) {
      toastError('Validation Error', 'Collection Name is required');
      return;
    }

    let cleanPrefix = originalPrefix.replace(/^\/+|\/+$/g, '').trim();
    if (type === 'proxy') {
      if (!cleanPrefix) {
        toastError('Validation Error', 'Path is required for Proxy Gateway collections');
        return;
      }
      if (!/^[a-zA-Z0-9_\-]+$/.test(cleanPrefix)) {
        toastError('Invalid Collection Path', "Collection path must consist of a single path variable (e.g. 'inventory') without '/' slashes.");
        return;
      }
      setOriginalPrefix(cleanPrefix);
    }

    setIsSubmitting(true);
    try {
      const res = await apiPost<{ success: boolean; collection?: Collection; error?: string }>('/api/collections', {
        name: name.trim(),
        type,
        parentId: parentId || null,
        originalPrefix: type === 'proxy' ? cleanPrefix : null,
        healthCheckPath: healthCheckPath.trim() || '/health',
        provider: type === 'llm' ? provider : null,
      });

      if (!res.success || !res.collection) {
        toastError('Creation Failed', res.error || 'Failed to create collection');
        setIsSubmitting(false);
        return;
      }

      const colId = res.collection.id;

      for (const env of environments) {
        await apiPost(`/api/collections/${colId}/environments`, {
          name: env.name,
          targetHost: env.targetHost,
        });
      }

      for (const param of parameters) {
        await apiPost(`/api/collections/${colId}/parameters`, {
          kind: param.kind,
          key: param.key,
          value: param.value,
        });
      }

      for (const v of variables) {
        await apiPost(`/api/collections/${colId}/global-variables`, {
          key: v.key,
          value: v.value,
        });
      }

      if (knowledgeBase || outboundSecretId) {
        await apiPut(`/api/collections/${colId}`, {
          ...(knowledgeBase ? { knowledgeBase } : {}),
          ...(outboundSecretId ? { outboundSecretId } : {}),
        });
      }

      onCollectionUpdated();
      onClose();
    } catch (err) {
      toastError('Creation Failed', 'Failed to create collection');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCollection = () => {
    if (!collection) return;
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Collection',
      message: `Are you sure you want to delete collection "${collection.name}"? This action cannot be undone.`,
      onConfirm: async () => {
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
        try {
          const res = await apiDelete<{ success: boolean; error?: string }>(`/api/collections/${collection.id}`);
          if (res.success) {
            onClose();
            onCollectionUpdated();
            toastSuccess('Collection Deleted', `Collection ${collection.name} deleted.`);
          } else {
            toastError('Delete Failed', res.error || 'Failed to delete collection');
          }
        } catch (err: any) {
          toastError('Delete Failed', err?.message || 'Failed to reach the server');
        }
      },
    });
  };

  return (
    <>
      <Modal
        isOpen={true}
        onClose={onClose}
        size="2xl"
        title={
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-primary" />
            <span>{isCreateMode ? 'Create New Collection' : `${collection.name} Settings`}</span>
          </div>
        }
        isLoading={isSubmitting}
        loadingText={isSubmitting ? (isCreateMode ? 'Creating Collection...' : 'Saving Collection Settings...') : undefined}
        footer={
          <div className="flex justify-between items-center w-full">
            {!isCreateMode && collection && !isCore ? (
              <button
                type="button"
                onClick={handleDeleteCollection}
                disabled={isSubmitting}
                className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded text-xs font-medium transition cursor-pointer disabled:opacity-50"
              >
                Delete Collection
              </button>
            ) : !isCreateMode && isCore ? (
              <span className="text-[11px] text-muted-foreground italic">
                System collection — cannot be moved or deleted
              </span>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              {isCreateMode ? (
                <button
                  type="button"
                  onClick={handleCreateCollection}
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground text-xs font-bold rounded flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                >
                  {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{isSubmitting ? 'Creating...' : 'Create Collection'}</span>
                </button>
              ) : tab === 'general' ? (
                <div className="flex items-center gap-2">
                  {generalSaved && <span className="text-emerald-500 text-xs font-medium">Saved!</span>}
                  <button
                    type="button"
                    onClick={handleSaveGeneral}
                    disabled={isSubmitting}
                    className="px-4 py-1.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground text-xs font-bold rounded flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                  >
                    {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              ) : tab === 'knowledge' ? (
                <div className="flex items-center gap-2">
                  {knowledgeSaved && <span className="text-emerald-500 text-xs font-medium">Saved!</span>}
                  <button
                    type="button"
                    onClick={handleSaveKnowledgeBase}
                    disabled={isSubmitting}
                    className="px-4 py-1.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground text-xs font-bold rounded flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                  >
                    {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    <span>{isSubmitting ? 'Saving...' : 'Save Knowledge Base'}</span>
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        }
      >
        <div className="flex border-b border-border shrink-0 -mt-4 -mx-4 mb-4 px-4 bg-muted/30">
          {(['general', 'environments', 'variables', 'knowledge'] as Tab[])
            .filter((t) => type === 'proxy' || t !== 'environments')
            .map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-2 text-xs font-medium capitalize transition border-b-2 -mb-px ${
                  tab === t ? 'text-primary border-primary font-semibold' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {t === 'variables' ? 'Collection Parameters & Variables' : t === 'knowledge' ? 'Knowledge Base' : t}
              </button>
            ))}
        </div>

        <div>
          {tab === 'general' && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="block text-muted-foreground font-medium text-xs">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isCore}
                  placeholder="e.g. User Service API"
                  className="w-full h-8 bg-background border border-border rounded px-3 text-xs text-foreground outline-none focus:border-ring placeholder:text-muted-foreground disabled:bg-muted/40 disabled:text-muted-foreground disabled:cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <label className="text-muted-foreground font-medium text-xs">Parent</label>
                  <InfoTooltip
                    content="Selecting a parent collection will convert this collection into a folder inside that collection, inheriting all its root settings."
                    label="About Parent"
                    iconClassName="h-3 w-3"
                  />
                </div>
                <SearchableSelect
                  value={parentId}
                  onChange={setParentId}
                  disabled={isCore}
                  options={allCollections
                    .filter((c) => !collection || !isCollectionDescendant(c.id, collection.id, allCollections))
                    .map((c) => ({ value: c.id, label: `${c.name} (${c.type})` }))}
                  placeholder="None (Root Level)"
                  searchPlaceholder="Search collections..."
                />
              </div>

              {!isCreateMode && collection && (
                <div className="flex items-center justify-between rounded border border-border bg-secondary/40 px-3 py-2">
                  <span className="flex items-center gap-1.5 font-medium text-foreground text-xs">
                    Core System Collection
                    <InfoTooltip
                      content="Marks this collection as protected — its name, parent, and other settings can't be changed, and it can't be deleted, until this is turned off. Takes effect immediately."
                      label="About Core System Collection"
                      iconClassName="h-3 w-3"
                    />
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isCore}
                    disabled={isTogglingCore}
                    onClick={() => handleToggleCore(!isCore)}
                    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                      isCore ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                        isCore ? 'translate-x-4' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              )}

              {isCreateMode && (
                <div className="space-y-1.5">
                  <label className="block text-muted-foreground font-medium text-xs">Collection Type</label>
                  <SearchableSelect
                    value={type}
                    onChange={(v) => setType(v as 'proxy' | 'llm')}
                    options={[
                      { value: 'proxy', label: 'Proxy Gateway Collection' },
                      { value: 'llm', label: 'LLM Provider Collection' },
                    ]}
                    placeholder="Select collection type..."
                  />
                </div>
              )}

              {type === 'proxy' && (
                <>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <label className="text-muted-foreground font-medium text-xs">Path</label>
                      <InfoTooltip
                        content="The path callers use to reach this on the gateway (single variable, no slashes)."
                        label="About Path"
                        iconClassName="h-3 w-3"
                      />
                    </div>
                    <div className="flex items-center bg-background border border-border focus-within:border-ring rounded overflow-hidden h-8 font-mono text-xs">
                      <span className="px-2.5 bg-muted text-muted-foreground font-bold border-r border-border select-none h-full flex items-center shrink-0">/</span>
                      <input
                        value={originalPrefix}
                        onChange={(e) => setOriginalPrefix(e.target.value.replace(/\//g, ''))}
                        disabled={isCore}
                        placeholder="inventory"
                        className="min-w-0 flex-1 bg-transparent px-3 text-xs text-foreground outline-none placeholder:text-muted-foreground disabled:text-muted-foreground disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-muted-foreground font-medium text-xs">Health Check Path</label>
                    <input
                      value={healthCheckPath}
                      onChange={(e) => setHealthCheckPath(e.target.value)}
                      disabled={isCore}
                      placeholder="/health"
                      className="w-full h-8 bg-background border border-border rounded px-3 text-xs text-foreground font-mono outline-none focus:border-ring placeholder:text-muted-foreground disabled:bg-muted/40 disabled:text-muted-foreground disabled:cursor-not-allowed"
                    />
                  </div>
                </>
              )}

              {type === 'proxy' && !isCreateMode && collection && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <label className="text-muted-foreground font-medium text-xs">Active Target Host</label>
                    <InfoTooltip
                      content="Where the gateway actually forwards the request to. Set from the Environments tab — not directly editable here."
                      label="About Active Target Host"
                      iconClassName="h-3 w-3"
                    />
                  </div>
                  <div className="text-foreground font-mono text-xs">{collection.activeTargetHost || '(no active environment)'}</div>
                </div>
              )}

              {type === 'llm' && (
                <>
                  {isCreateMode && (
                    <div className="space-y-1.5">
                      <label className="block text-muted-foreground font-medium text-xs">LLM Provider</label>
                      <SearchableSelect
                        value={provider}
                        onChange={setProvider}
                        options={[
                          { value: 'openai', label: 'OpenAI' },
                          { value: 'anthropic', label: 'Anthropic' },
                          { value: 'gemini', label: 'Google Gemini' },
                          { value: 'custom', label: 'Custom Provider' },
                        ]}
                        placeholder="Select provider..."
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <label className="text-muted-foreground font-medium text-xs">Outbound Key</label>
                      <InfoTooltip
                        content="The secret this collection presents to the provider."
                        label="About Outbound Key"
                        iconClassName="h-3 w-3"
                      />
                    </div>
                    <SearchableSelect
                      value={outboundSecretId}
                      onChange={setOutboundSecretId}
                      options={secrets.map((s) => ({ value: s.id, label: `${s.name} (••••${s.valueLastFour})` }))}
                      placeholder="(none)"
                      searchPlaceholder="Search secrets..."
                    />
                  </div>
                </>
              )}

              {!isCreateMode && collection && (
                <div className="space-y-1.5">
                  <label className="block text-muted-foreground font-medium text-xs">Status</label>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${
                        collection.status === 'healthy' ? 'bg-emerald-500' : collection.status === 'unhealthy' ? 'bg-rose-500' : 'bg-zinc-500'
                      }`}
                    />
                    <span className="text-foreground capitalize text-xs">{collection.status}</span>
                  </div>
                </div>
              )}

              {/* Save button is now standardized in modal footer */}
            </div>
          )}

          {tab === 'environments' && (
            <div className="space-y-4">
              <div className="bg-muted/40 p-3 rounded-lg border border-border space-y-2">
                <h4 className="text-xs font-semibold text-foreground">Add/Update Environment Host</h4>
                <div className="flex gap-2 items-center">
                  <div className="shrink-0 w-40">
                    <input
                      value={selectedEnvName}
                      onChange={(e) => setSelectedEnvName(e.target.value)}
                      list="collection-env-names"
                      placeholder="environment name"
                      className="w-full h-8 bg-background border border-border rounded px-3 text-xs text-foreground outline-none focus:border-ring placeholder:text-muted-foreground"
                    />
                    <datalist id="collection-env-names">
                      {environments.map((e) => (
                        <option key={e.id} value={e.name} />
                      ))}
                    </datalist>
                  </div>

                  <input
                    value={envHostInput}
                    onChange={(e) => setEnvHostInput(e.target.value)}
                    placeholder="https://api.example.com"
                    className="min-w-0 flex-1 h-8 bg-background border border-border rounded px-3 text-xs text-foreground font-mono outline-none focus:border-ring placeholder:text-muted-foreground"
                  />

                  <button
                    type="button"
                    onClick={handleSaveOrUpdateEnvironment}
                    className="h-8 px-3 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded flex items-center gap-1 shrink-0 transition"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Save Host
                  </button>
                </div>
                {envSaveStatus && <p className="text-emerald-500 text-[11px] font-medium">Saved environment successfully!</p>}
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-foreground">Configured Environments</h4>
                {environments.length === 0 ? (
                  <p className="text-muted-foreground italic text-xs">No environments configured yet.</p>
                ) : (
                  <div className="space-y-1.5">
                    {environments.map((env) => {
                      const isActive = activeEnvironmentId === env.id;
                      const isEditing = editingEnvId === env.id;

                      return (
                        <div
                          key={env.id}
                          className={`flex items-center justify-between p-2.5 rounded-lg border text-xs ${
                            isActive ? 'bg-beak/10 border-beak/40 text-foreground' : 'bg-muted/20 border-border text-muted-foreground'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                            <button
                              type="button"
                              onClick={() => handleSetActive(env.id)}
                              className={`p-1 rounded hover:bg-muted shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                              title={isActive ? 'Active Environment' : 'Set as Active'}
                            >
                              <Radio className="h-4 w-4" />
                            </button>
                            <span className="font-semibold text-foreground w-24 shrink-0">{env.name}</span>

                            {isEditing ? (
                              <div className="flex items-center gap-1 flex-1 min-w-0">
                                <input
                                  value={editingEnvHost}
                                  onChange={(e) => setEditingEnvHost(e.target.value)}
                                  className="min-w-0 flex-1 h-7 bg-background border border-primary rounded px-2 text-xs text-foreground font-mono outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleUpdateTargetHost(env.id)}
                                  className="h-7 px-2 bg-primary text-primary-foreground text-xs font-semibold rounded shrink-0"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingEnvId(null)}
                                  className="h-7 px-2 bg-secondary border border-border text-muted-foreground text-xs rounded shrink-0"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <span className="font-mono text-[11px] text-muted-foreground truncate flex-1 min-w-0">{env.targetHost}</span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {!isEditing && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingEnvId(env.id);
                                  setEditingEnvHost(env.targetHost);
                                }}
                                className="p-1 text-muted-foreground hover:text-foreground rounded"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteEnvironment(env.id)}
                              className="p-1 text-rose-500 hover:text-rose-600 rounded"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'variables' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <span>Collection Parameters</span>
                  <InfoTooltip
                    content="Headers, Query params, or Path params applied automatically to all routes in this collection."
                    label="About Collection Parameters"
                    iconClassName="h-3 w-3"
                  />
                </h4>

                <div className="bg-muted/40 p-3 rounded-lg border border-border space-y-2">
                  <div className="flex gap-2 items-center">
                    <div className="shrink-0 w-36">
                      <SearchableSelect
                        value={newParamKind}
                        onChange={(v) => setNewParamKind(v as 'header' | 'query')}
                        options={[
                          { value: 'header', label: 'Header' },
                          { value: 'query', label: 'Query Param' },
                        ]}
                        placeholder="Select kind..."
                      />
                    </div>

                    <input
                      value={newParamKey}
                      onChange={(e) => setNewParamKey(e.target.value)}
                      placeholder="Key (e.g. X-Api-Version)"
                      className="min-w-0 flex-1 h-8 bg-background border border-border rounded px-3 text-xs text-foreground outline-none focus:border-ring placeholder:text-muted-foreground"
                    />

                    <input
                      value={newParamValue}
                      onChange={(e) => setNewParamValue(e.target.value)}
                      placeholder="Value"
                      className="min-w-0 flex-1 h-8 bg-background border border-border rounded px-3 text-xs text-foreground outline-none focus:border-ring placeholder:text-muted-foreground"
                    />

                    <button
                      type="button"
                      onClick={handleAddParameter}
                      className="h-8 px-3 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded flex items-center gap-1 shrink-0 transition"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Parameter
                    </button>
                  </div>
                </div>

                {parameters.length > 0 && (
                  <div className="space-y-1.5">
                    {parameters.map((p) => {
                      const isEditing = editingParamId === p.id;

                      return (
                        <div key={p.id} className="flex items-center justify-between p-2 bg-muted/20 rounded-lg border border-border">
                          {isEditing ? (
                            <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
                              <div className="shrink-0 w-36">
                                <SearchableSelect
                                  value={editingParamKind}
                                  onChange={(v) => setEditingParamKind(v as 'header' | 'query')}
                                  options={[
                                    { value: 'header', label: 'Header' },
                                    { value: 'query', label: 'Query Param' },
                                  ]}
                                  placeholder="Select kind..."
                                />
                              </div>
                              <input
                                value={editingParamKey}
                                onChange={(e) => setEditingParamKey(e.target.value)}
                                className="min-w-0 flex-1 h-7 bg-background border border-primary rounded px-2 text-xs text-foreground outline-none"
                              />
                              <input
                                value={editingParamValue}
                                onChange={(e) => setEditingParamValue(e.target.value)}
                                className="min-w-0 flex-1 h-7 bg-background border border-primary rounded px-2 text-xs text-foreground outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleUpdateParameter(p.id)}
                                className="h-7 px-2 bg-primary text-primary-foreground text-xs font-semibold rounded shrink-0"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingParamId(null)}
                                className="h-7 px-2 bg-secondary border border-border text-muted-foreground text-xs rounded shrink-0"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 font-mono text-xs truncate flex-1 min-w-0 mr-2">
                              <span className="px-1.5 py-0.5 bg-secondary text-muted-foreground border border-border rounded text-[10px] uppercase font-sans font-semibold shrink-0">
                                {p.kind}
                              </span>
                              <span className="text-primary font-semibold shrink-0">{p.key}</span>
                              <span className="text-muted-foreground shrink-0">=</span>
                              <span className="text-foreground truncate flex-1 min-w-0">{p.value}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-1 shrink-0">
                            {!isEditing && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingParamId(p.id);
                                  setEditingParamKind(p.kind as any);
                                  setEditingParamKey(p.key);
                                  setEditingParamValue(p.value);
                                }}
                                className="p-1 text-muted-foreground hover:text-foreground rounded"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteParameter(p.id)}
                              className="p-1 text-rose-500 hover:text-rose-600 rounded"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-4 border-t border-border">
                <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <span>Global Variables</span>
                  <InfoTooltip
                    content="Variables accessible inside route URLs and payloads using {{variable_name}} syntax."
                    label="About Global Variables"
                    iconClassName="h-3 w-3"
                  />
                </h4>

                <div className="bg-muted/40 p-3 rounded-lg border border-border space-y-2">
                  <div className="flex gap-2 items-center">
                    <input
                      value={newVarKey}
                      onChange={(e) => setNewVarKey(e.target.value)}
                      placeholder="Variable Name (e.g. baseUrl)"
                      className="min-w-0 flex-1 h-8 bg-background border border-border rounded px-3 text-xs text-foreground outline-none focus:border-ring placeholder:text-muted-foreground"
                    />

                    <input
                      value={newVarValue}
                      onChange={(e) => setNewVarValue(e.target.value)}
                      placeholder="Value"
                      className="min-w-0 flex-1 h-8 bg-background border border-border rounded px-3 text-xs text-foreground outline-none focus:border-ring placeholder:text-muted-foreground"
                    />

                    <button
                      type="button"
                      onClick={handleAddVariable}
                      className="h-8 px-3 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded flex items-center gap-1 shrink-0 transition"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Variable
                    </button>
                  </div>
                </div>

                {variables.length > 0 && (
                  <div className="space-y-1.5">
                    {variables.map((v) => {
                      const isEditing = editingVarId === v.id;

                      return (
                        <div key={v.id} className="flex items-center justify-between p-2 bg-muted/20 rounded-lg border border-border">
                          {isEditing ? (
                            <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
                              <input
                                value={editingVarKey}
                                onChange={(e) => setEditingVarKey(e.target.value)}
                                className="min-w-0 flex-1 h-7 bg-background border border-primary rounded px-2 text-xs text-foreground outline-none"
                              />
                              <input
                                value={editingVarValue}
                                onChange={(e) => setEditingVarValue(e.target.value)}
                                className="min-w-0 flex-1 h-7 bg-background border border-primary rounded px-2 text-xs text-foreground outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleUpdateVariable(v.id)}
                                className="h-7 px-2 bg-primary text-primary-foreground text-xs font-semibold rounded shrink-0"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingVarId(null)}
                                className="h-7 px-2 bg-secondary border border-border text-muted-foreground text-xs rounded shrink-0"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 font-mono text-xs truncate flex-1 min-w-0 mr-2">
                              <span className="text-blue-500 font-semibold shrink-0">{`{{${v.key}}}`}</span>
                              <span className="text-muted-foreground shrink-0">=</span>
                              <span className="text-foreground truncate flex-1 min-w-0">{v.value}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-1 shrink-0">
                            {!isEditing && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingVarId(v.id);
                                  setEditingVarKey(v.key);
                                  setEditingVarValue(v.value);
                                }}
                                className="p-1 text-muted-foreground hover:text-foreground rounded"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteVariable(v.id)}
                              className="p-1 text-rose-500 hover:text-rose-600 rounded"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'knowledge' && (
            <div className="space-y-3">
              <div className="flex items-center gap-1.5">
                <label className="text-muted-foreground font-medium text-xs">Knowledge Base / Context</label>
                <InfoTooltip
                  content="Documentation, system instructions, or schema info attached to this collection."
                  label="About Knowledge Base"
                  iconClassName="h-3 w-3"
                />
              </div>
              <textarea
                value={knowledgeBase}
                onChange={(e) => setKnowledgeBase(e.target.value)}
                placeholder="Enter collection documentation, context, or schema guidelines..."
                className="w-full h-48 bg-background border border-border rounded-lg p-3 text-xs text-foreground font-mono outline-none focus:border-ring resize-none placeholder:text-muted-foreground"
              />
              {/* Save button is now standardized in modal footer */}
            </div>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmLabel="Delete"
        isDestructive={true}
      />
    </>
  );
};
