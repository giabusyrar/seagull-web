'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { Modal } from '@gateway-experience/shared';
import type { ConflictMatrixRule } from '../../types';
import { listReferenceIngredients } from '../../api';

interface ConflictRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<ConflictMatrixRule, 'id' | 'brandId' | 'applicationId'> & { id?: string }) => Promise<void>;
  editingConflict: ConflictMatrixRule | null;
}

export const ConflictRuleModal: React.FC<ConflictRuleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingConflict,
}) => {
  const [confA, setConfA] = useState('');
  const [confB, setConfB] = useState('');
  const [confType, setConfType] = useState<ConflictMatrixRule['conflictType']>('over_exfoliation');
  const [confAction, setConfAction] = useState<ConflictMatrixRule['resolutionAction']>('split_am_pm');
  const [confWarning, setConfWarning] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ingredients, setIngredients] = useState<Array<{ code: string; name: string }>>([]);

  useEffect(() => {
    listReferenceIngredients()
      .then((list) => {
        if (list.length > 0) setIngredients(list);
      })
      .catch(() => {});
  }, [isOpen]);

  useEffect(() => {
    if (editingConflict) {
      setConfA(editingConflict.ingredientA);
      setConfB(editingConflict.ingredientB);
      setConfType(editingConflict.conflictType);
      setConfAction(editingConflict.resolutionAction);
      setConfWarning(editingConflict.warningMessage || '');
    } else {
      setConfA('');
      setConfB('');
      setConfType('over_exfoliation');
      setConfAction('split_am_pm');
      setConfWarning('');
    }
  }, [editingConflict, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confA.trim() || !confB.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        ...(editingConflict ? { id: editingConflict.id } : {}),
        ingredientA: confA.trim(),
        ingredientB: confB.trim(),
        conflictType: confType,
        resolutionAction: confAction,
        severity: 'high',
        warningMessage: confWarning.trim(),
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      icon={<ShieldAlert className="h-4 w-4 text-rose-400" />}
      title={editingConflict ? 'Edit Conflict Rule' : 'New Ingredient Conflict'}
      isLoading={isSubmitting}
      loadingText={isSubmitting ? (editingConflict ? 'Updating Conflict Rule...' : 'Saving Conflict Rule...') : undefined}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-muted-foreground">Primary Ingredient (A):</label>
            <input
              type="text"
              required
              list="conflict-ing-list"
              placeholder="e.g. Retinol 0.5%"
              value={confA}
              onChange={(e) => setConfA(e.target.value)}
              className="w-full bg-muted/40 border border-border rounded px-3 py-2 text-foreground"
            />
          </div>
          <div className="space-y-1">
            <label className="text-muted-foreground">Conflicting Ingredient (B):</label>
            <input
              type="text"
              required
              list="conflict-ing-list"
              placeholder="e.g. Glycolic Acid (AHA)"
              value={confB}
              onChange={(e) => setConfB(e.target.value)}
              className="w-full bg-muted/40 border border-border rounded px-3 py-2 text-foreground"
            />
          </div>
          <datalist id="conflict-ing-list">
            {ingredients.map((ing) => (
              <option key={ing.code} value={ing.name} />
            ))}
          </datalist>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-muted-foreground">Conflict Type:</label>
            <select
              value={confType}
              onChange={(e) => setConfType(e.target.value as any)}
              className="w-full bg-muted/40 border border-border rounded px-3 py-2 text-foreground font-mono"
            >
              <option value="incompatible">Strictly Incompatible</option>
              <option value="over_exfoliation">Over-exfoliation Risk</option>
              <option value="pH_clash">pH Neutralization Clash</option>
              <option value="barrier_irritation">Barrier Irritation Risk</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-muted-foreground">Resolution Protocol:</label>
            <select
              value={confAction}
              onChange={(e) => setConfAction(e.target.value as any)}
              className="w-full bg-muted/40 border border-border rounded px-3 py-2 text-foreground font-mono"
            >
              <option value="split_am_pm">Split Routine (AM vs PM)</option>
              <option value="alternate_days">Alternate Use Days</option>
              <option value="strict_block">Strict Product Exclusion</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-muted-foreground">Clinical Warning Message:</label>
          <textarea
            rows={2}
            placeholder="e.g. Do not layer pure Vitamin C with Retinol simultaneously..."
            value={confWarning}
            onChange={(e) => setConfWarning(e.target.value)}
            className="w-full bg-muted/40 border border-border rounded px-3 py-2 text-foreground resize-none"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-foreground font-bold rounded disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
          >
            {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            <span>{isSubmitting ? (editingConflict ? 'Updating...' : 'Saving...') : (editingConflict ? 'Update Rule' : 'Save Rule')}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
