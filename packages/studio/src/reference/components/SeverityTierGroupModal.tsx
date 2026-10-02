'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Plus, Trash2, Save, Sparkles, Layers, Loader2 } from 'lucide-react';
import { Modal } from '@gateway-experience/shared';

export interface SeverityTierItemInput {
  id?: string;
  code: string;
  name: string;
  orderIndex: number;
  colorCode: string;
  description?: string;
}

export interface SeverityTierGroupInput {
  id?: string;
  code: string;
  name: string;
  description?: string;
  items: SeverityTierItemInput[];
}

interface SeverityTierGroupModalProps {
  isOpen: boolean;
  initialData?: SeverityTierGroupInput | null;
  onClose: () => void;
  onSave: (data: SeverityTierGroupInput) => Promise<void>;
}

const PRESET_COLORS = [
  '#10b981', // Emerald
  '#38bdf8', // Sky
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#f59e0b', // Amber
  '#f97316', // Orange
  '#ef4444', // Red
  '#f43f5e', // Rose
  '#ec4899', // Pink
  '#06b6d4', // Cyan
];

export const SeverityTierGroupModal: React.FC<SeverityTierGroupModalProps> = ({
  isOpen,
  initialData,
  onClose,
  onSave,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<SeverityTierItemInput[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setCode(initialData.code || '');
        setName(initialData.name || '');
        setDescription(initialData.description || '');
        setItems(Array.isArray(initialData.items) ? initialData.items : []);
      } else {
        setCode('');
        setName('');
        setDescription('');
        setItems([
          {
            code: 'TIER_1',
            name: 'Tier 1',
            orderIndex: 1,
            colorCode: '#10b981',
            description: '',
          },
        ]);
      }
      setError(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (!initialData) {
      setCode(val.toUpperCase().replace(/[^A-Z0-9]/g, '_').slice(0, 40));
    }
  };

  const handleAddItem = () => {
    const nextIdx = items.length + 1;
    const fallbackColor = PRESET_COLORS[(nextIdx - 1) % PRESET_COLORS.length];
    setItems((prev) => [
      ...prev,
      {
        code: `TIER_${nextIdx}`,
        name: `Tier ${nextIdx}`,
        orderIndex: nextIdx,
        colorCode: fallbackColor,
        description: '',
      },
    ]);
  };

  const handleUpdateItem = (index: number, field: keyof SeverityTierItemInput, value: any) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      if (field === 'name' && !initialData && (!next[index].code || next[index].code.startsWith('TIER_'))) {
        next[index].code = String(value).toUpperCase().replace(/[^A-Z0-9]/g, '_').slice(0, 30);
      }
      return next;
    });
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setError('Group Name and Code are required.');
      return;
    }
    if (items.length === 0) {
      setError('Please add at least one classification tier item.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const payload: SeverityTierGroupInput = {
        ...(initialData?.id ? { id: initialData.id } : {}),
        code: code.trim().toUpperCase(),
        name: name.trim(),
        description: description.trim(),
        items: items.map((it, idx) => ({
          ...it,
          orderIndex: idx + 1,
          code: (it.code || it.name).trim().toUpperCase().replace(/[^A-Z0-9]/g, '_'),
          name: it.name.trim(),
          colorCode: it.colorCode || '#10b981',
          description: (it.description || '').trim(),
        })),
      };

      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save Severity Tier Group');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      icon={<ShieldAlert className="h-5 w-5 text-amber-400" />}
      title={initialData ? `Edit Classification Group (${code})` : 'New Severity Classification Group'}
      subtitle="Define a diagnostic group (e.g. Severity Level, Acne Prone Level) and configure its classification tier items."
      isLoading={isSubmitting}
      loadingText={isSubmitting ? (initialData ? 'Updating Classification Group...' : 'Creating Classification Group...') : undefined}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Group Header Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-secondary/40 p-3.5 rounded-xl border border-border">
          <div className="space-y-1">
            <label className="text-muted-foreground font-bold">
              Group Display Name <span className="text-amber-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Acne Prone Level, Severity Level"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full bg-background border border-border focus:border-ring rounded-lg px-3 py-2 text-foreground outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-muted-foreground font-bold">
              Group Code <span className="text-amber-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. ACNE_PRONE_LEVEL, SEVERITY_LEVEL"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full bg-background border border-border focus:border-ring rounded-lg px-3 py-2 text-foreground font-mono uppercase font-bold outline-none"
            />
          </div>

          <div className="col-span-1 sm:col-span-2 space-y-1">
            <label className="text-muted-foreground font-bold">Clinical / Operational Description</label>
            <textarea
              rows={2}
              placeholder="e.g. Multi-tier classification for diagnosing inflammatory lesion reactivity & tolerance"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-background border border-border focus:border-ring rounded-lg p-2.5 text-foreground outline-none resize-none"
            />
          </div>
        </div>

        {/* Nested Classification Tiers */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-foreground font-bold flex items-center gap-1.5 text-xs">
              <Layers className="h-4 w-4 text-amber-500" />
              <span>Classification Tier Items ({items.length})</span>
            </span>

            <button
              type="button"
              onClick={handleAddItem}
              className="px-2.5 py-1 bg-secondary hover:bg-accent border border-border text-amber-600 hover:text-foreground rounded-lg flex items-center gap-1.5 font-semibold text-xs transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Tier Item</span>
            </button>
          </div>

          {/* Table Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '48px 1fr 140px 120px 40px',
              gap: '8px',
              alignItems: 'center',
            }}
            className="px-3 py-1.5 bg-secondary/40 border border-border rounded-lg text-[10px] font-bold text-muted-foreground uppercase tracking-wider select-none"
          >
            <div className="text-center">#</div>
            <div>Display Name</div>
            <div>Code</div>
            <div className="text-center">Badge Color</div>
            <div className="text-center">Act</div>
          </div>

          {/* Table Rows */}
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {items.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '48px 1fr 140px 120px 40px',
                  gap: '8px',
                  alignItems: 'center',
                }}
                className="bg-card hover:bg-accent/50 border border-border hover:border-ring/40 p-2 rounded-lg transition"
              >
                {/* Rank */}
                <div className="text-center font-mono font-bold text-amber-600 bg-secondary/60 border border-border rounded py-1">
                  #{idx + 1}
                </div>

                {/* Name */}
                <div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sensitive Stinger"
                    value={item.name}
                    onChange={(e) => handleUpdateItem(idx, 'name', e.target.value)}
                    className="w-full bg-background border border-border focus:border-ring rounded px-2.5 py-1 text-foreground text-xs outline-none"
                  />
                </div>

                {/* Code */}
                <div>
                  <input
                    type="text"
                    required
                    placeholder="CODE"
                    value={item.code}
                    onChange={(e) => handleUpdateItem(idx, 'code', e.target.value.toUpperCase())}
                    className="w-full bg-background border border-border focus:border-ring rounded px-2 py-1 text-purple-600 font-mono uppercase font-bold text-xs outline-none"
                  />
                </div>

                {/* Color Swatch & Hex */}
                <div className="flex items-center gap-1.5 justify-center">
                  <input
                    type="color"
                    value={item.colorCode || '#10b981'}
                    onChange={(e) => handleUpdateItem(idx, 'colorCode', e.target.value)}
                    className="w-6 h-6 rounded border border-border cursor-pointer bg-transparent shrink-0"
                    title="Choose Badge Color"
                  />
                  <input
                    type="text"
                    value={item.colorCode || '#10b981'}
                    onChange={(e) => handleUpdateItem(idx, 'colorCode', e.target.value)}
                    className="w-16 bg-background border border-border rounded px-1.5 py-1 text-[11px] font-mono text-foreground outline-none"
                  />
                </div>

                {/* Remove */}
                <div className="text-center">
                  <button
                    type="button"
                    disabled={items.length <= 1}
                    onClick={() => handleRemoveItem(idx)}
                    className="p-1 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 disabled:opacity-30 rounded transition cursor-pointer"
                    title={items.length <= 1 ? 'Minimum 1 tier required' : 'Remove Tier'}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 flex items-center justify-end border-t border-border">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-md"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>{isSubmitting ? (initialData ? 'Updating...' : 'Creating...') : (initialData ? 'Update Group' : 'Create Group')}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
