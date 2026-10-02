'use client';

import React, { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { SearchableSelect, Modal } from '@gateway-experience/shared';
import type { EntityConfig } from '../config/reference-entity-configs';

interface ReferenceFormModalProps {
  isOpen: boolean;
  config: EntityConfig;
  initialData?: any;
  onClose: () => void;
  onSave: (data: Record<string, any>) => Promise<void>;
}

export const ReferenceFormModal: React.FC<ReferenceFormModalProps> = ({
  isOpen,
  config,
  initialData,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [relationOptions, setRelationOptions] = useState<Record<string, any[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const initial: Record<string, any> = { ...(initialData || {}) };
      config.fields.forEach((f) => {
        if ((f.type === 'text' || f.type === 'textarea') && Array.isArray(initial[f.key])) {
          initial[f.key] = initial[f.key].join(', ');
        }
      });
      setFormData(initial);
      setError(null);

      config.fields.forEach(async (field) => {
        if ((field.type === 'relation' || field.type === 'multi-relation') && field.relationEntity) {
          try {
            const res = await fetch(`/api/reference/${field.relationEntity}`);
            const data = await res.json();
            const list =
              data.data ||
              data[field.relationEntity!] ||
              data.dimensions ||
              data.items ||
              data.brands ||
              data.products ||
              data.ingredients ||
              [];
            if (data.success && Array.isArray(list)) {
              setRelationOptions((prev) => ({ ...prev, [field.relationEntity!]: list }));
            }
          } catch {}
        }
      });
    }
  }, [isOpen, initialData, config]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = { ...formData };
      // Sanitize numeric fields to native number types
      config.fields.forEach((f) => {
        if (f.type === 'number' || ['minScore', 'maxScore', 'weight', 'orderIndex'].includes(f.key)) {
          const raw = payload[f.key];
          if (raw !== undefined && raw !== null && raw !== '') {
            const num = Number(raw);
            payload[f.key] = isNaN(num) ? 0 : num;
          } else if (f.key === 'maxScore') {
            payload[f.key] = 100;
          } else if (f.key === 'minScore' || f.key === 'weight' || f.key === 'orderIndex') {
            payload[f.key] = 0;
          }
        }
        // Backend expects a []string — split the comma-separated text back into an array.
        if (f.isCsvArray && typeof payload[f.key] === 'string') {
          payload[f.key] = payload[f.key]
            .split(',')
            .map((s: string) => s.trim())
            .filter((s: string) => s.length > 0);
        }
      });

      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={initialData ? `Edit ${config.singularTitle}` : `New ${config.singularTitle}`}
      isLoading={isSubmitting}
      loadingText={isSubmitting ? (initialData ? `Updating ${config.singularTitle}...` : `Saving ${config.singularTitle}...`) : undefined}
    >
      <form onSubmit={handleSubmit} className="space-y-4 pb-12 relative">
        {error && <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded text-xs">{error}</div>}

          {config.fields.map((field, idx) => {
            const zIndexVal = (config.fields.length - idx) * 10;
            return (
              <div key={field.key} style={{ zIndex: zIndexVal }} className="space-y-1.5 relative">
                <label className="block text-muted-foreground font-medium">
                  {field.label} {field.required && <span className="text-amber-500">*</span>}
                </label>

                {field.type === 'number' && (
                  <input
                    type="number"
                    required={field.required}
                    value={formData[field.key] ?? ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : Number(e.target.value);
                      setFormData({ ...formData, [field.key]: val });
                    }}
                    className="w-full h-9 bg-background border border-border rounded-lg px-3 text-foreground outline-none focus:border-ring transition font-mono"
                  />
                )}

                {field.type === 'text' && (
                  <input
                    type="text"
                    required={field.required}
                    value={formData[field.key] ?? ''}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    className="w-full h-9 bg-background border border-border rounded-lg px-3 text-foreground outline-none focus:border-ring transition"
                  />
                )}

                {field.type === 'textarea' && (
                  <textarea
                    rows={3}
                    value={formData[field.key] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg p-2.5 text-foreground outline-none focus:border-ring transition"
                  />
                )}

                {field.type === 'select' && (
                  <select
                    value={formData[field.key] || field.options?.[0]?.value || ''}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    className="w-full h-9 bg-background border border-border rounded-lg px-3 text-foreground outline-none focus:border-ring transition cursor-pointer"
                  >
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}

                {field.type === 'relation' && field.relationEntity && (() => {
                  const opts = relationOptions[field.relationEntity] || [];
                  const isCodeBased = field.relationEntity === 'dimensions';
                  const isDimensionRelation = field.relationEntity === 'dimensions';

                  const currentVal = ((): string => {
                    const direct = formData[field.key];
                    if (direct) {
                      const found = opts.find((o) => (isCodeBased ? o.code === direct : o.id === direct) || o.id === direct || o.name === direct);
                      if (found) return isCodeBased && found.code ? found.code : found.id;
                    }
                    if (field.key === 'brandId') {
                      const found = opts.find((o) => o.id === formData.brandId || o.name === formData.brandName);
                      if (found) return found.id;
                    }
                    return direct || '';
                  })();

                  return (
                    <SearchableSelect
                      options={opts.map((opt) => ({
                        value: isCodeBased && opt.code ? opt.code : opt.id,
                        label: isCodeBased && opt.code ? `${opt.name} (${opt.code})` : opt.name,
                      }))}
                      value={currentVal}
                      onChange={(val) => setFormData({ ...formData, [field.key]: val })}
                      placeholder={`-- Select ${field.label} --`}
                      searchPlaceholder={`Search ${field.label.toLowerCase()}...`}
                    />
                  );
                })()}

                {field.type === 'multi-relation' && field.relationEntity && (() => {
                  const opts = relationOptions[field.relationEntity] || [];
                  const isCodeBased = field.relationEntity === 'dimensions';

                  const rawVal = formData[field.key] ?? (formData['ingredientIds'] || []);

                  const selectedValues: string[] = Array.isArray(rawVal)
                    ? rawVal
                        .map((v: any) => {
                          if (typeof v === 'string') {
                            const found = opts.find((o) => (isCodeBased ? o.code === v : o.id === v) || o.id === v || o.name === v);
                            return found ? (isCodeBased && found.code ? found.code : found.id) : v;
                          }
                          return isCodeBased && v?.code ? v.code : v?.id || v?.ingredientId;
                        })
                        .filter(Boolean)
                    : typeof rawVal === 'string' && rawVal
                    ? [rawVal]
                    : [];

                  return (
                    <SearchableSelect
                      multiple
                      options={opts.map((opt) => ({
                        value: isCodeBased && opt.code ? opt.code : opt.id,
                        label: isCodeBased && opt.code ? `${opt.name} (${opt.code})` : opt.name,
                      }))}
                      value={selectedValues}
                      onChange={(vals) => {
                        const updated: Record<string, any> = { ...formData, [field.key]: vals };
                        if (field.key === 'ingredientIds') updated.ingredientIds = vals;
                        setFormData(updated);
                      }}
                      placeholder={`-- Select ${field.label} --`}
                      searchPlaceholder={`Search ${field.label.toLowerCase()}...`}
                    />
                  );
                })()}
              </div>
            );
          })}

          <div className="pt-3 flex items-center justify-end border-t border-border shrink-0">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              <span>{isSubmitting ? (initialData ? 'Updating...' : 'Saving...') : (initialData ? 'Update Item' : 'Save Item')}</span>
            </button>
          </div>
        </form>
      </Modal>
  );
};
