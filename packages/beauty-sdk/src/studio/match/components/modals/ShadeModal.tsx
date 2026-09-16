'use client';

import React, { useState, useEffect } from 'react';
import { Palette, Loader2 } from 'lucide-react';
import { Modal, InfoTooltip } from '@gateway-experience/shared';
import type { Shade } from '../../types';

interface ShadeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Shade, 'id' | 'extractionStatus' | 'assetId'> & { id?: string }) => Promise<void>;
  editingShade: Shade | null;
  productId: string;
}

export const ShadeModal: React.FC<ShadeModalProps> = ({ isOpen, onClose, onSave, editingShade, productId }) => {
  const [name, setName] = useState('');
  const [hexColor, setHexColor] = useState('#C41E3A');
  const [region, setRegion] = useState<Shade['region']>('lip');
  const [referencePhotoUrl, setReferencePhotoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingShade) {
      setName(editingShade.name);
      setHexColor(editingShade.hexColor);
      setRegion(editingShade.region);
      setReferencePhotoUrl(editingShade.referencePhotoUrl || '');
    } else {
      setName('');
      setHexColor('#C41E3A');
      setRegion('lip');
      setReferencePhotoUrl('');
    }
  }, [editingShade, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !hexColor.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        ...(editingShade ? { id: editingShade.id } : {}),
        productId,
        name: name.trim(),
        hexColor: hexColor.trim(),
        region,
        referencePhotoUrl: referencePhotoUrl.trim(),
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
      icon={<Palette className="h-4 w-4 text-primary" />}
      title={editingShade ? 'Edit Shade' : 'New Shade'}
      isLoading={isSubmitting}
      loadingText={isSubmitting ? (editingShade ? 'Updating Shade...' : 'Saving Shade...') : undefined}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[#888888]">Shade Name:</label>
            <input
              type="text"
              required
              placeholder="e.g. Ruby Red"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#161616] border border-[#333333] rounded px-3 py-2 text-white"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[#888888]">Exact Color:</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={hexColor}
                onChange={(e) => setHexColor(e.target.value)}
                className="h-9 w-9 rounded border border-[#333333] bg-transparent cursor-pointer"
              />
              <input
                type="text"
                required
                pattern="^#[0-9A-Fa-f]{6}$"
                value={hexColor}
                onChange={(e) => setHexColor(e.target.value)}
                className="flex-1 bg-[#161616] border border-[#333333] rounded px-3 py-2 text-white font-mono"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[#888888]">Applies To:</label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value as Shade['region'])}
            className="w-full bg-[#161616] border border-[#333333] rounded px-3 py-2 text-white font-mono"
          >
            <option value="lip">Lips</option>
            <option value="eye">Eyes</option>
            <option value="cheek">Cheeks</option>
            <option value="skin">Skin / Foundation</option>
          </select>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <label className="text-[#888888]">Reference Photo URL:</label>
            <InfoTooltip content="A face photo used to generate the realistic shade texture." label="About Reference Photo URL" />
          </div>
          <input
            type="url"
            required
            placeholder="https://..."
            value={referencePhotoUrl}
            onChange={(e) => setReferencePhotoUrl(e.target.value)}
            className="w-full bg-[#161616] border border-[#333333] rounded px-3 py-2 text-white"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary hover:opacity-90 text-primary-foreground font-bold rounded disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
          >
            {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            <span>{isSubmitting ? (editingShade ? 'Updating...' : 'Saving...') : (editingShade ? 'Update Shade' : 'Save Shade & Start Extraction')}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
