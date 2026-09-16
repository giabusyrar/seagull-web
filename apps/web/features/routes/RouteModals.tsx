'use client';

import React, { useState, useEffect } from 'react';
import type { Route, RouteGroup } from '@/types/api-client';
import { Modal, SearchableSelect, InfoTooltip, type SelectOption } from '@gateway-experience/shared';
import { Loader2 } from 'lucide-react';

/* 2. Create Route Modal */
export interface CreateRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  collectionPrefix?: string;
  targetHost?: string;
  collectionType?: 'proxy' | 'llm';
  groups?: Array<{ id: string; name: string }>;
  initialGroupId?: string;
  onCreate: (data: {
    name: string;
    method: string;
    originalPattern: string;
    targetPattern?: string;
    groupId?: string;
    llmModel?: string;
    systemInstruction?: string;
  }) => Promise<{ success: boolean; route?: Route; error?: string }>;
}

export const CreateRouteModal: React.FC<CreateRouteModalProps> = ({
  isOpen,
  onClose,
  collectionPrefix = '',
  targetHost = '',
  collectionType = 'proxy',
  groups = [],
  initialGroupId,
  onCreate,
}) => {
  const [name, setName] = useState('');
  const [method, setMethod] = useState('GET');
  const [originalPattern, setOriginalPattern] = useState('');
  const [targetPattern, setTargetPattern] = useState('');
  const [groupId, setGroupId] = useState(initialGroupId || '');
  const [llmModel, setLlmModel] = useState('');
  const [systemInstruction, setSystemInstruction] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setMethod('GET');
      setOriginalPattern('');
      setTargetPattern('');
      setGroupId(initialGroupId || '');
      setLlmModel('');
      setSystemInstruction('');
      setError(null);
    }
  }, [isOpen, collectionPrefix, initialGroupId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    setError(null);

    const res = await onCreate({
      name: name.trim(),
      method,
      originalPattern: originalPattern.trim() || '/example',
      targetPattern: targetPattern.trim() || undefined,
      groupId: groupId || undefined,
      ...(collectionType === 'llm'
        ? { llmModel: llmModel.trim() || undefined, systemInstruction: systemInstruction.trim() || undefined }
        : {}),
    });

    setIsSubmitting(false);
    if (res.success) {
      setName('');
      setOriginalPattern('');
      setTargetPattern('');
      setGroupId('');
      setMethod('GET');
      setLlmModel('');
      setSystemInstruction('');
      onClose();
    } else {
      setError(res.error || 'Failed to create route');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title="Create New Route"
      isLoading={isSubmitting}
      loadingText="Creating Route..."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2 bg-rose-500/10 border border-rose-500/30 rounded text-rose-400 text-xs">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-muted-foreground font-medium text-xs">Route Name</label>
          <input
            type="text"
            placeholder="e.g. Get User Profile"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-8 bg-background border border-border rounded px-3 text-xs text-foreground outline-none focus:border-ring placeholder:text-muted-foreground"
          />
        </div>

        {groups.length > 0 && (
          <div className="space-y-1.5">
            <label className="block text-muted-foreground font-medium text-xs">Group (Optional)</label>
            <SearchableSelect
              value={groupId}
              onChange={setGroupId}
              options={groups.map((g): SelectOption => ({ value: g.id, label: g.name }))}
              placeholder="Root (No Group)"
              searchPlaceholder="Search groups..."
            />
          </div>
        )}

        {collectionType !== 'llm' ? (
          <>
            <div className="space-y-1.5">
              <label className="block text-muted-foreground font-medium text-xs">Original Route Subpath</label>
              <div className="flex items-center gap-2">
                <SearchableSelect
                  value={method}
                  onChange={setMethod}
                  options={['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'].map((m): SelectOption => ({ value: m, label: m }))}
                  placeholder="Method"
                  searchPlaceholder="Search methods..."
                  className="w-32 shrink-0 font-mono font-bold"
                />
                <div className="min-w-0 flex-1 flex items-center bg-background border border-border rounded overflow-hidden focus-within:border-ring">
                  <span className="px-2.5 py-1.5 bg-muted text-muted-foreground text-xs font-mono border-r border-border shrink-0 select-none">
                    {collectionPrefix || '/'}
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. /users or /user/:id"
                    required
                    value={originalPattern}
                    onChange={(e) => setOriginalPattern(e.target.value)}
                    className="min-w-0 flex-1 h-8 bg-transparent px-3 text-xs text-foreground outline-none font-mono placeholder:text-muted-foreground"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-muted-foreground font-medium text-xs">Forward Target Subpath (Optional)</label>
              <input
                type="text"
                placeholder="Leave blank if identical to original route subpath"
                value={targetPattern}
                onChange={(e) => setTargetPattern(e.target.value)}
                className="w-full h-8 bg-background border border-border rounded px-3 text-xs text-foreground outline-none focus:border-ring font-mono placeholder:text-muted-foreground"
              />
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-muted-foreground font-medium text-xs">LLM Model (Optional)</label>
              <input
                type="text"
                value={llmModel}
                onChange={(e) => setLlmModel(e.target.value)}
                placeholder="e.g. gpt-4o, claude-3-5-sonnet, gemini-1.5-pro"
                className="w-full h-8 bg-background border border-border rounded px-3 text-xs text-foreground outline-none focus:border-ring placeholder:text-muted-foreground font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-muted-foreground font-medium text-xs">System Instruction (Optional)</label>
              <textarea
                value={systemInstruction}
                onChange={(e) => setSystemInstruction(e.target.value)}
                rows={3}
                placeholder="You are a helpful AI assistant..."
                className="w-full bg-background border border-border rounded px-3 py-2 text-xs text-foreground outline-none focus:border-ring placeholder:text-muted-foreground resize-none"
              />
            </div>
          </div>
        )}

        <div className="pt-2 flex justify-end border-t border-border">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-1.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground text-xs font-bold rounded flex items-center gap-1.5 transition cursor-pointer"
          >
            {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>{isSubmitting ? 'Creating...' : 'Create Route'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

/* 3. Create Group Modal */
export interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups?: RouteGroup[];
  initialParentId?: string | null;
  onCreate: (name: string, parentId?: string | null) => Promise<{ success: boolean; group?: RouteGroup; error?: string }>;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  groups = [],
  initialParentId = null,
  onCreate,
}) => {
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<string>(initialParentId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setParentId(initialParentId || '');
      setError(null);
    }
  }, [isOpen, initialParentId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    setError(null);

    const res = await onCreate(name.trim(), parentId || null);

    setIsSubmitting(false);
    if (res.success) {
      setName('');
      setParentId('');
      onClose();
    } else {
      setError(res.error || 'Failed to create group');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title="Create New Group"
      isLoading={isSubmitting}
      loadingText="Creating Group..."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2 bg-rose-500/10 border border-rose-500/30 rounded text-rose-400 text-xs">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-muted-foreground font-medium text-xs">Group Name</label>
          <input
            type="text"
            placeholder="e.g. Authentication"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-8 bg-background border border-border rounded px-3 text-xs text-foreground outline-none focus:border-ring placeholder:text-muted-foreground"
          />
        </div>

        {groups.length > 0 && (
          <div className="space-y-1.5">
            <label className="block text-muted-foreground font-medium text-xs">Parent Folder (Optional)</label>
            <SearchableSelect
              value={parentId}
              onChange={setParentId}
              options={groups.map((g): SelectOption => ({ value: g.id, label: g.name }))}
              placeholder="Root (No Parent)"
              searchPlaceholder="Search folders..."
            />
          </div>
        )}

        <div className="pt-2 flex justify-end border-t border-border">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-1.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground text-xs font-bold rounded flex items-center gap-1 transition cursor-pointer"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />}
            {isSubmitting ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

/* 4. Group (Folder) Settings Modal */
export interface GroupSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: RouteGroup | null;
  groups: RouteGroup[];
  collectionName?: string;
  onUpdate: (groupId: string, data: { name: string; parentId: string | null }) => Promise<{ success: boolean; error?: string }>;
}

const isDescendantHelper = (targetId: string, currentId: string, allGroups: RouteGroup[]) => {
  if (targetId === currentId) return true;
  let curr: string | undefined | null = targetId;
  const visited = new Set<string>();
  while (curr && !visited.has(curr)) {
    visited.add(curr);
    const parent = allGroups.find((g) => g.id === curr);
    if (parent?.parentId === currentId) return true;
    curr = parent?.parentId;
  }
  return false;
};

export const GroupSettingsModal: React.FC<GroupSettingsModalProps> = ({
  isOpen,
  onClose,
  group,
  groups,
  collectionName,
  onUpdate,
}) => {
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && group) {
      setName(group.name || '');
      setParentId(group.parentId || '');
      setError(null);
    }
  }, [isOpen, group]);

  if (!isOpen || !group) return null;

  // Filter out the group itself and its descendants to avoid circular reference
  const eligibleParents = groups.filter((g) => !isDescendantHelper(g.id, group.id, groups));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    setError(null);
    const res = await onUpdate(group.id, {
      name: name.trim(),
      parentId: parentId || null,
    });

    setIsSubmitting(false);
    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Failed to update folder settings');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title="Folder Settings"
      isLoading={isSubmitting}
      loadingText="Saving Settings..."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2 bg-rose-500/10 border border-rose-500/30 rounded text-rose-400 text-xs">
            {error}
          </div>
        )}

        {collectionName && (
          <div className="space-y-1.5">
            <label className="block text-muted-foreground font-medium text-xs">Parent Collection</label>
            <div className="w-full h-8 bg-muted/40 border border-border rounded px-3 text-xs text-foreground flex items-center font-medium select-none">
              {collectionName}
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-muted-foreground font-medium text-xs">Folder Name</label>
          <input
            type="text"
            placeholder="e.g. Authentication"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-8 bg-background border border-border rounded px-3 text-xs text-foreground outline-none focus:border-ring placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <label className="text-muted-foreground font-medium text-xs">Parent Folder</label>
            <InfoTooltip
              content="Move this folder under another folder or place it at the top level of this collection."
              label="About Parent Folder"
            />
          </div>
          <SearchableSelect
            value={parentId}
            onChange={setParentId}
            options={eligibleParents.map((g): SelectOption => ({ value: g.id, label: g.name }))}
            placeholder="Top Level of Collection"
            searchPlaceholder="Search folders..."
          />
        </div>

        <div className="pt-2 flex justify-end border-t border-border">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-1.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground text-xs font-bold rounded flex items-center gap-1 transition cursor-pointer"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />}
            {isSubmitting ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

