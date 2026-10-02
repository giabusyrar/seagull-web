'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Boxes, Loader2, X } from 'lucide-react';
import { Modal, SearchableSelect, InfoTooltip } from '@gateway-experience/shared';
import type { ProductGroup, ProductCatalogItem } from '../../types';
import { resolveDynamicEndpoint } from '../../../core/collection-resolver';

interface ProductGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<ProductGroup, 'id' | 'createdAt'> & { id?: string }) => Promise<void>;
  editingGroup: ProductGroup | null;
  defaultBrand?: string;
}

const BRAND_OPTIONS = [
  { value: 'wardah', label: 'Wardah Beauty' },
  { value: 'kahf', label: 'Kahf Men Care' },
  { value: 'labore', label: 'Laboré Sensitive Skin' },
  { value: 'emina', label: 'Emina Teen & Young' },
];

export const ProductGroupModal: React.FC<ProductGroupModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingGroup,
  defaultBrand,
}) => {
  const [brandId, setBrandId] = useState(defaultBrand && defaultBrand !== '*' ? defaultBrand : 'wardah');
  const [applicationId, setApplicationId] = useState('*');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [productIds, setProductIds] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryDraft, setCategoryDraft] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [products, setProducts] = useState<ProductCatalogItem[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    const endpoint = resolveDynamicEndpoint('match', `/api/matching/products?brand_id=${encodeURIComponent(brandId || '*')}`);
    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.products)) setProducts(data.products);
      })
      .catch(() => {});
  }, [isOpen, brandId]);

  useEffect(() => {
    if (editingGroup) {
      setBrandId(editingGroup.brandId);
      setApplicationId(editingGroup.applicationId || '*');
      setName(editingGroup.name);
      setCode(editingGroup.code || '');
      setDescription(editingGroup.description || '');
      setProductIds(editingGroup.productIds || []);
      setCategories(editingGroup.categories || []);
      setIsActive(editingGroup.isActive ?? true);
    } else {
      setBrandId(defaultBrand && defaultBrand !== '*' ? defaultBrand : 'wardah');
      setApplicationId('*');
      setName('');
      setCode('');
      setDescription('');
      setProductIds([]);
      setCategories([]);
      setIsActive(true);
    }
    setCategoryDraft('');
  }, [editingGroup, isOpen, defaultBrand]);

  const productOptions = useMemo(
    () => products.map((p) => ({ value: p.id, label: p.name, description: p.category })),
    [products]
  );

  const availableCategories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category).filter(Boolean))),
    [products]
  );

  const addCategory = (raw: string) => {
    const value = raw.trim();
    if (!value || categories.includes(value)) return;
    setCategories((prev) => [...prev, value]);
    setCategoryDraft('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !brandId.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        ...(editingGroup ? { id: editingGroup.id } : {}),
        brandId: brandId.trim(),
        applicationId: applicationId.trim() || '*',
        name: name.trim(),
        code: code.trim(),
        description: description.trim(),
        productIds,
        categories,
        isActive,
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
      size="lg"
      icon={<Boxes className="h-4 w-4 text-primary" />}
      title={editingGroup ? 'Edit Product Group' : 'New Product Group'}
      isLoading={isSubmitting}
      loadingText={isSubmitting ? (editingGroup ? 'Updating Product Group...' : 'Saving Product Group...') : undefined}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[#888888]">Brand:</label>
            <select
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              disabled={!!editingGroup}
              className="w-full bg-[#161616] border border-[#333333] rounded px-3 py-2 text-white font-mono disabled:opacity-60"
            >
              {BRAND_OPTIONS.map((b) => (
                <option key={b.value} value={b.value}>{b.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[#888888]">Group Name:</label>
            <input
              type="text"
              required
              placeholder="e.g. Ramadan 2026 Glow Edit"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#161616] border border-[#333333] rounded px-3 py-2 text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[#888888]">Group Code:</label>
            <input
              type="text"
              placeholder="e.g. RAMADAN26_GLOW"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-[#161616] border border-[#333333] rounded px-3 py-2 text-white font-mono"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[#888888] flex items-center justify-between">
              <span>Status:</span>
            </label>
            <label className="flex items-center gap-2 bg-[#161616] border border-[#333333] rounded px-3 py-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="accent-primary"
              />
              <span className="text-white">Active in matching engine</span>
            </label>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[#888888]">Campaign Description:</label>
          <textarea
            rows={2}
            placeholder="e.g. Curated brightening & hydration lineup for the Ramadan campaign"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-[#161616] border border-[#333333] rounded px-3 py-2 text-white resize-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[#888888]">Products in Group:</label>
          <SearchableSelect
            multiple
            options={productOptions}
            value={productIds}
            onChange={setProductIds}
            placeholder="-- Select products --"
            searchPlaceholder="Search products..."
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <label className="text-[#888888]">Categories in Group:</label>
            <InfoTooltip content="Every product in each listed category is included in the group." label="About Categories in Group" />
          </div>
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            {categories.map((c) => (
              <span
                key={c}
                className="flex items-center gap-1 bg-amber-500/15 text-amber-400 font-mono px-2 py-0.5 rounded text-[10px] uppercase border border-amber-500/30 font-bold"
              >
                {c}
                <button
                  type="button"
                  onClick={() => setCategories((prev) => prev.filter((x) => x !== c))}
                  className="hover:text-white cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            list="product-group-category-list"
            placeholder="Type a category and press Enter (e.g. Serum)"
            value={categoryDraft}
            onChange={(e) => setCategoryDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCategory(categoryDraft);
              }
            }}
            className="w-full bg-[#161616] border border-[#333333] rounded px-3 py-2 text-white"
          />
          <datalist id="product-group-category-list">
            {availableCategories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary hover:opacity-90 text-primary-foreground font-bold rounded disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
          >
            {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            <span>{isSubmitting ? (editingGroup ? 'Updating...' : 'Saving...') : (editingGroup ? 'Update Group' : 'Save Group')}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
