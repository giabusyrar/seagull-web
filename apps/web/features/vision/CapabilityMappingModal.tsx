'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link2, Upload, BookmarkPlus, Target, Trash2 } from 'lucide-react';
import {
  Modal,
  Button,
  Input,
  SearchableSelect,
  ChipMultiSelect,
  InfoTooltip,
  type ChipGroup,
  type SelectOption,
} from '@gateway-experience/shared';
import type { SkinConditionOption } from './useVisionModels';
import { FACIAL_ZONE_OPTIONS } from './ApplicableZonesModal';

interface CapabilityMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (capability: string, selectedConditionCodes: string[]) => Promise<{ success: boolean; error?: string }>;
  /** Uploads the base model's .onnx file — the only thing that actually persists a
   *  capability with zero mapped skin conditions (nothing else references it). */
  onUploadModel: (capability: string, file: File, zones: string[]) => Promise<{ success: boolean; error?: string }>;
  /** null when creating a brand-new capability; a fixed capability code when editing an existing row's mapping. */
  capability: string | null;
  initialSelectedCodes: string[];
  allConditions: SkinConditionOption[];
}

interface SkinConditionPreset {
  id: string;
  name: string;
  codes: string[];
}

const PRESETS_STORAGE_KEY = 'vision-capability-condition-presets';

function loadPresets(): SkinConditionPreset[] {
  try {
    const raw = window.localStorage.getItem(PRESETS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function savePresets(presets: SkinConditionPreset[]) {
  try {
    window.localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets));
  } catch {
    // localStorage unavailable — presets just won't persist this session
  }
}

const UNGROUPED_DIMENSION = '__ungrouped__';
const FIELD_LABEL_CLASS = 'text-[11px] font-semibold text-muted-foreground';

export const CapabilityMappingModal: React.FC<CapabilityMappingModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onUploadModel,
  capability,
  initialSelectedCodes,
  allConditions,
}) => {
  const [capabilityName, setCapabilityName] = useState('');
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [isBaseModel, setIsBaseModel] = useState(false);
  const [baseModelFile, setBaseModelFile] = useState<File | null>(null);
  const [baseModelZones, setBaseModelZones] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [presets, setPresets] = useState<SkinConditionPreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState('');
  const [isNamingPreset, setIsNamingPreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCapabilityName(capability || '');
      setSelectedCodes(initialSelectedCodes);
      setIsBaseModel(!capability ? false : initialSelectedCodes.length === 0);
      setBaseModelFile(null);
      setBaseModelZones([]);
      setError(null);
      setPresets(loadPresets());
      setSelectedPresetId('');
      setIsNamingPreset(false);
      setNewPresetName('');
    }
  }, [isOpen, capability, initialSelectedCodes]);

  // Auto-picking the dimension: a skin condition already carries its dimension,
  // so grouping the picker by dimension surfaces it for free — no separate
  // dimension selection step needed.
  const conditionGroups = useMemo<ChipGroup[]>(() => {
    const groups = new Map<string, ChipGroup>();
    for (const cond of allConditions) {
      const key = cond.dimensionCode || UNGROUPED_DIMENSION;
      if (!groups.has(key)) {
        groups.set(key, {
          key,
          label: cond.dimensionName || 'Ungrouped',
          icon: <Target className="h-3 w-3" />,
          options: [],
        });
      }
      groups.get(key)!.options.push({ value: cond.code, label: cond.name });
    }
    return Array.from(groups.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [allConditions]);

  const validConditionCodes = useMemo(() => new Set(allConditions.map((c) => c.code)), [allConditions]);

  const presetOptions = useMemo<SelectOption[]>(
    () =>
      presets.map((p) => ({
        value: p.id,
        label: `${p.name} (${p.codes.filter((c) => validConditionCodes.has(c)).length})`,
      })),
    [presets, validConditionCodes]
  );

  const applyPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const preset = presets.find((p) => p.id === presetId);
    if (preset) {
      // Only apply codes that still exist as real skin conditions today.
      setSelectedCodes(preset.codes.filter((c) => validConditionCodes.has(c)));
    }
  };

  const handleSavePreset = () => {
    const name = newPresetName.trim();
    if (!name || selectedCodes.length === 0) return;
    const next: SkinConditionPreset = { id: `preset-${Date.now()}`, name, codes: selectedCodes };
    const updated = [...presets, next];
    setPresets(updated);
    savePresets(updated);
    setSelectedPresetId(next.id);
    setIsNamingPreset(false);
    setNewPresetName('');
  };

  const handleDeletePreset = (presetId: string) => {
    const updated = presets.filter((p) => p.id !== presetId);
    setPresets(updated);
    savePresets(updated);
    if (selectedPresetId === presetId) setSelectedPresetId('');
  };

  const handleSubmit = async () => {
    const trimmedName = capabilityName.trim();
    if (!trimmedName) {
      setError('Capability name is required');
      return;
    }
    if (isBaseModel) {
      if (!baseModelFile) {
        setError('A base model has no skin condition mapping to anchor it — upload its .onnx file to register it');
        return;
      }
      setIsSubmitting(true);
      setError(null);
      const res = await onUploadModel(trimmedName, baseModelFile, baseModelZones);
      setIsSubmitting(false);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Failed to upload base model');
      }
      return;
    }
    if (selectedCodes.length === 0) {
      setError('Select at least one skin condition, or mark this as a base model');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    const res = await onSave(trimmedName, selectedCodes);
    setIsSubmitting(false);
    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Failed to save mapping');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={capability ? `Edit Mapping — ${capability}` : 'Add Capability'}
      icon={<Link2 className="h-4 w-4 text-cyan-400" />}
      primaryActionLabel={isSubmitting ? 'Saving...' : 'Save Mapping'}
      onPrimaryAction={handleSubmit}
      isPrimaryLoading={isSubmitting}
      isPrimaryDisabled={isSubmitting}
      isLoading={isSubmitting}
      loadingText="Saving Mapping..."
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className={FIELD_LABEL_CLASS}>Capability Code</label>
          <Input
            value={capabilityName}
            onChange={(e) => setCapabilityName(e.target.value)}
            disabled={!!capability}
            placeholder="e.g. redness_severity_detector"
            className="font-mono disabled:opacity-60 disabled:bg-muted"
          />
        </div>

        {!capability && (
          <div className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg border border-border bg-muted/40">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isBaseModel}
                onChange={(e) => {
                  setIsBaseModel(e.target.checked);
                  setError(null);
                }}
              />
              <span className="text-[11px] font-semibold text-foreground">Base model for the skin analyzer</span>
            </label>
            <InfoTooltip
              content="A general-purpose model not scoped to a specific skin condition (e.g. an overall face/skin quality or foundation embedding model)."
              label="About base models"
            />
          </div>
        )}

        {isBaseModel ? (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className={FIELD_LABEL_CLASS}>Model File (.onnx)</label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".onnx"
                className="hidden"
                onChange={(e) => setBaseModelFile(e.target.files?.[0] || null)}
              />
              <div>
                <Button
                  variant="outline"
                  size="md"
                  leftIcon={<Upload className="h-3.5 w-3.5" />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {baseModelFile ? baseModelFile.name : 'Choose .onnx file'}
                </Button>
              </div>
            </div>
            <ChipMultiSelect
              label="Applicable Zones (none selected = all zones)"
              labelClassName={FIELD_LABEL_CLASS}
              tone="cyan"
              options={FACIAL_ZONE_OPTIONS}
              value={baseModelZones}
              onChange={(next) => setBaseModelZones(next)}
            />
          </div>
        ) : (
          <>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <span className={FIELD_LABEL_CLASS}>Preset</span>
                <InfoTooltip content="Presets are saved in this browser only." label="About presets" iconClassName="h-3 w-3" />
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex-1 min-w-0">
                  <SearchableSelect
                    value={selectedPresetId}
                    onChange={applyPreset}
                    options={presetOptions}
                    disabled={presets.length === 0}
                    placeholder={presets.length > 0 ? 'Apply a saved preset...' : 'No saved presets yet'}
                    searchPlaceholder="Search presets..."
                  />
                </div>
                {selectedPresetId && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDeletePreset(selectedPresetId)}
                    title="Delete this preset"
                    className="text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
                {isNamingPreset ? (
                  <>
                    <div className="w-32">
                      <Input
                        autoFocus
                        value={newPresetName}
                        onChange={(e) => setNewPresetName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSavePreset()}
                        placeholder="Preset name"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="md"
                      onClick={handleSavePreset}
                      disabled={!newPresetName.trim() || selectedCodes.length === 0}
                    >
                      Save
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="md"
                    leftIcon={<BookmarkPlus className="h-3.5 w-3.5" />}
                    onClick={() => setIsNamingPreset(true)}
                    disabled={selectedCodes.length === 0}
                    title="Save the current selection as a reusable preset"
                  >
                    Save as preset
                  </Button>
                )}
              </div>
            </div>

            <ChipMultiSelect
              label="Mapped Skin Conditions"
              labelClassName={FIELD_LABEL_CLASS}
              tone="indigo"
              groups={conditionGroups}
              value={selectedCodes}
              onChange={(next) => setSelectedCodes(next)}
              listClassName="max-h-72 overflow-y-auto p-0.5"
              emptyMessage="No skin conditions found in Reference Data."
            />
          </>
        )}

        {error && <p className="text-[11px] text-rose-600">{error}</p>}
      </div>
    </Modal>
  );
};
