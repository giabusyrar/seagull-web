'use client';

import React, { useMemo, useRef, useState } from 'react';
import { Upload, Download, Trash2, FileX, CheckCircle2, CircleDashed, Edit2, Plus, MapPin } from 'lucide-react';
import {
  DataTable,
  Badge,
  Button,
  ConfirmDialog,
  InfoTooltip,
  FACIAL_ZONES,
  type ColumnDef,
} from '@gateway-experience/shared';
import { useToast } from '@/components/ui/toast';
import { useVisionModels, type CapabilityRow } from './useVisionModels';
import { CapabilityMappingModal } from './CapabilityMappingModal';
import { ApplicableZonesModal } from './ApplicableZonesModal';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Stable identity: CapabilityMappingModal re-initialises its form whenever
// initialSelectedCodes changes, so a fresh `[]` on every render (e.g. when a
// toast fires) would wipe whatever the user had typed/selected.
const NO_SELECTED_CODES: string[] = [];
const NO_ZONES: string[] = [];
const ZONE_LABELS = new Map<string, string>(FACIAL_ZONES.map((zone) => [zone.code, zone.label]));

export function ModelRegistryPanel() {
  const {
    rows,
    allConditions,
    allDimensions,
    isLoading,
    uploadModel,
    downloadModel,
    deleteModel,
    updateApplicableZones,
    updateCapabilityMapping,
    deleteCapability,
  } = useVisionModels();
  const { toastSuccess, toastError } = useToast();
  const [uploadingCapability, setUploadingCapability] = useState<string | null>(null);
  const [mappingModalRow, setMappingModalRow] = useState<CapabilityRow | null>(null);
  const [isAddCapabilityOpen, setIsAddCapabilityOpen] = useState(false);
  const [deletingCapability, setDeletingCapability] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [zonesModalRow, setZonesModalRow] = useState<CapabilityRow | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const conditionOptions = useMemo(() => {
    const dimensionNameByCode = new Map(allDimensions.map((d) => [d.code, d.name]));
    return allConditions.map((c) => ({
      code: c.code,
      name: c.name || c.code,
      dimensionCode: c.dimensionCode,
      dimensionName: c.dimensionCode ? dimensionNameByCode.get(c.dimensionCode) || c.dimensionCode : undefined,
    }));
  }, [allConditions, allDimensions]);

  const handleSaveMapping = async (capability: string, selectedCodes: string[]) => {
    const res = await updateCapabilityMapping(capability, selectedCodes);
    if (res.success) {
      toastSuccess('Mapping Saved', `"${capability}" mapping updated`);
    } else {
      toastError('Save Failed', res.error || 'Failed to update mapping');
    }
    return res;
  };

  const handleUploadBaseModel = async (capability: string, file: File, zones: string[]) => {
    if (!file.name.toLowerCase().endsWith('.onnx')) {
      return { success: false, error: 'Model file must be a .onnx file' };
    }
    const res = await uploadModel(capability, file, zones);
    if (res.success) {
      toastSuccess('Base Model Registered', `"${capability}" registered as a base model`);
    } else {
      toastError('Upload Failed', res.error || 'Failed to upload base model');
    }
    return res;
  };

  const handleSaveZones = async (capability: string, zones: string[]) => {
    const res = await updateApplicableZones(capability, zones);
    if (res.success) {
      toastSuccess('Zones Saved', `"${capability}" now scores ${zones.length > 0 ? `${zones.length} zone(s)` : 'all zones'}`);
    } else {
      toastError('Save Failed', res.error || 'Failed to update applicable zones');
    }
    return res;
  };

  const handleFileChange = async (capability: string, file: File | undefined) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.onnx')) {
      toastError('Invalid File', 'Model file must be a .onnx file');
      return;
    }
    setUploadingCapability(capability);
    const res = await uploadModel(capability, file);
    setUploadingCapability(null);
    if (res.success) {
      toastSuccess('Model Uploaded', `Model registered for capability "${capability}"`);
    } else {
      toastError('Upload Failed', res.error || 'Failed to upload model');
    }
  };

  const handleDelete = async (capability: string) => {
    const ok = await deleteModel(capability);
    if (ok) {
      toastSuccess('Model Removed', `Model for "${capability}" deleted`);
    } else {
      toastError('Delete Failed', 'Failed to delete model');
    }
  };

  const handleDeleteCapability = async () => {
    if (!deletingCapability) return;
    const hadModel = !!rows.find((r) => r.capability === deletingCapability)?.model;
    setIsDeleting(true);
    const res = await deleteCapability(deletingCapability);
    setIsDeleting(false);
    setDeletingCapability(null);
    if (res.success) {
      toastSuccess(
        'Capability Removed',
        `"${deletingCapability}" unmapped from all skin conditions${hadModel ? ' and its uploaded model deleted' : ''}`
      );
    } else {
      toastError('Delete Failed', res.error || 'Failed to remove capability');
    }
  };

  const columns: ColumnDef<CapabilityRow>[] = [
    {
      key: 'actions',
      header: 'Actions',
      align: 'left',
      className: 'w-16',
      render: (row) => (
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setMappingModalRow(row)}
            className="hover:text-amber-600"
            title="Edit mapped skin conditions"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setDeletingCapability(row.capability)}
            className="hover:bg-rose-500/10 hover:text-rose-600"
            title="Remove this capability entirely (unmaps it from every skin condition and deletes its model)"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
    {
      key: 'capability',
      header: 'Capability',
      render: (row) => <span className="font-mono text-xs font-semibold text-foreground">{row.capability}</span>,
    },
    {
      key: 'skinConditions',
      header: 'Mapped Skin Condition(s)',
      render: (row) =>
        row.skinConditions.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {row.skinConditions.map((c) => (
              <Badge key={c} variant="secondary" size="sm">
                {c}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground italic">Unmapped</span>
        ),
    },
    {
      key: 'status',
      header: 'Model Status',
      render: (row) =>
        row.model ? (
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span className="text-xs text-foreground">
              v{row.model.version} · {formatBytes(row.model.sizeBytes)}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <CircleDashed className="h-3.5 w-3.5 shrink-0" />
            <span className="text-xs">Not uploaded</span>
          </div>
        ),
    },
    {
      key: 'zones',
      header: 'Zones',
      render: (row) =>
        row.model ? (
          <div className="flex items-center gap-1.5">
            {row.model.applicableZones && row.model.applicableZones.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {row.model.applicableZones.map((code) => (
                  <Badge key={code} variant="secondary" size="sm">
                    {ZONE_LABELS.get(code) ?? code}
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">All zones</span>
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setZonesModalRow(row)}
              title="Edit the facial zones this model scores"
            >
              <MapPin className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      key: 'uploadedAt',
      header: 'Uploaded',
      render: (row) =>
        row.model ? (
          <span className="text-xs text-muted-foreground">
            {new Date(row.model.uploadedAt).toLocaleString()}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      key: 'model',
      header: 'Model File',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <input
            ref={(el) => {
              fileInputRefs.current[row.capability] = el;
            }}
            type="file"
            accept=".onnx"
            className="hidden"
            onChange={(e) => handleFileChange(row.capability, e.target.files?.[0])}
          />
          <Button
            variant="ghost"
            size="xs"
            onClick={() => fileInputRefs.current[row.capability]?.click()}
            isLoading={uploadingCapability === row.capability}
            leftIcon={<Upload className="h-3.5 w-3.5" />}
            title={row.model ? 'Replace model' : 'Upload model'}
          >
            {row.model ? 'Update Model' : 'Add Model'}
          </Button>
          {row.model && (
            <>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => downloadModel(row.capability)}
                title="Download model"
              >
                <Download className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => handleDelete(row.capability)}
                className="hover:text-rose-600"
                title="Remove uploaded model only (keeps this capability mapped)"
              >
                <FileX className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <InfoTooltip
          label="About the model registry"
          content={
            <>
              Every capability referenced by a skin condition&apos;s &quot;Vision Capabilities&quot; is listed here. Upload
              a .onnx model (single 224×224 RGB input, single severity-score output) to score it per facial zone —
              capabilities with no model are skipped and reported as UNSUPPORTED_CAPABILITY warnings.
            </>
          }
        />
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Plus className="h-3.5 w-3.5" />}
          onClick={() => setIsAddCapabilityOpen(true)}
          className="shrink-0"
        >
          Add Capability
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={rows}
        keyExtractor={(row) => row.capability}
        isLoading={isLoading}
        emptyMessage="No vision capabilities found. Add a Skin Condition with Vision Capabilities in Reference Data first."
      />

      <CapabilityMappingModal
        isOpen={!!mappingModalRow}
        onClose={() => setMappingModalRow(null)}
        onSave={handleSaveMapping}
        onUploadModel={handleUploadBaseModel}
        capability={mappingModalRow?.capability ?? null}
        initialSelectedCodes={mappingModalRow?.skinConditionCodes ?? NO_SELECTED_CODES}
        allConditions={conditionOptions}
      />
      <CapabilityMappingModal
        isOpen={isAddCapabilityOpen}
        onClose={() => setIsAddCapabilityOpen(false)}
        onSave={handleSaveMapping}
        onUploadModel={handleUploadBaseModel}
        capability={null}
        initialSelectedCodes={NO_SELECTED_CODES}
        allConditions={conditionOptions}
      />
      <ApplicableZonesModal
        isOpen={!!zonesModalRow}
        onClose={() => setZonesModalRow(null)}
        capability={zonesModalRow?.capability ?? null}
        initialZones={zonesModalRow?.model?.applicableZones ?? NO_ZONES}
        onSave={handleSaveZones}
      />

      <ConfirmDialog
        isOpen={!!deletingCapability}
        onClose={() => setDeletingCapability(null)}
        onConfirm={handleDeleteCapability}
        title="Remove Capability"
        message={`Remove "${deletingCapability}"? This unmaps it from every skin condition it's currently linked to${
          rows.find((r) => r.capability === deletingCapability)?.model ? ' and deletes its uploaded model' : ''
        }. This cannot be undone.`}
        confirmLabel="Remove"
        isDestructive
        isLoading={isDeleting}
      />
    </div>
  );
}
