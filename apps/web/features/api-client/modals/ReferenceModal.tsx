'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Trash2 } from 'lucide-react';
import { Modal, Input, Button, InfoTooltip } from '@gateway-experience/shared';

export interface ReferenceModalProps {
  isOpen: boolean;
  mode: 'add-item' | 'edit-item' | 'add-type';
  typeKey?: string;
  typeLabel?: string;
  item?: { id: string; name: string; description?: string | null };
  onClose: () => void;
  onSave: (data: { name: string; description?: string; key?: string; label?: string }) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export const ReferenceModal: React.FC<ReferenceModalProps> = ({
  isOpen,
  mode,
  typeKey,
  typeLabel,
  item,
  onClose,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [key, setKey] = useState('');
  const [label, setLabel] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    if (item && mode === 'edit-item') {
      setName(item.name || '');
      setDescription(item.description || '');
    } else {
      setName('');
      setDescription('');
      setKey('');
      setLabel('');
    }
  }, [item, mode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({ name, description, key, label });
      onClose();
    } catch {
      // Handled in callback
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!item?.id || !onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(item.id);
      onClose();
    } catch {
      // Handled in callback
    } finally {
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  const title =
    mode === 'add-type'
      ? 'Create Reference Type'
      : mode === 'edit-item'
      ? `Edit ${typeLabel || 'Reference'} Item`
      : `Add Item to ${typeLabel || typeKey}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title={title}
      icon={<Tag className="h-4 w-4 text-primary" />}
      isLoading={isSaving}
      loadingText={mode === 'edit-item' ? 'Saving Changes...' : 'Creating Reference...'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'add-type' ? (
          <>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <label className="text-muted-foreground font-medium text-xs">Type Key</label>
                <InfoTooltip content="Unique identifier for this reference type." label="About Type Key" />
              </div>
              <Input
                type="text"
                placeholder="e.g. supplier, brand-event"
                required
                value={key}
                onChange={(e) => setKey(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-muted-foreground font-medium text-xs">Display Label</label>
              <Input
                type="text"
                placeholder="e.g. Suppliers"
                required
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>
          </>
        ) : (
          <div className="space-y-1.5">
            <label className="block text-muted-foreground font-medium text-xs">Item Name</label>
            <Input
              type="text"
              placeholder="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-muted-foreground font-medium text-xs">Description (optional)</label>
          <textarea
            placeholder="Provide context or description..."
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-secondary/50 border border-border rounded p-2 text-xs text-foreground outline-none focus:border-ring resize-none"
          />
        </div>

        <div className="pt-3 flex items-center justify-between border-t border-border">
          {mode === 'edit-item' && onDelete ? (
            <Button
              type="button"
              variant="destructive"
              size="xs"
              onClick={() => setShowConfirmDelete(true)}
              disabled={isDeleting}
              leftIcon={<Trash2 className="h-3.5 w-3.5" />}
            >
              Delete
            </Button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSaving}
            >
              {mode === 'edit-item' ? 'Save Changes' : 'Create'}
            </Button>
          </div>
        </div>
      </form>

      {showConfirmDelete && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-10 animate-in fade-in duration-150">
          <div className="bg-card border border-border rounded-xl p-5 text-center space-y-4 max-w-xs shadow-2xl">
            <div className="w-10 h-10 rounded-full bg-destructive/10 border border-destructive/30 text-destructive flex items-center justify-center mx-auto">
              <Trash2 className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-foreground text-sm">Delete Item</h4>
              <p className="text-xs text-muted-foreground">
                Are you sure you want to delete &quot;{item?.name}&quot;? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setShowConfirmDelete(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="flex-1"
                onClick={handleDelete}
                isLoading={isDeleting}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
