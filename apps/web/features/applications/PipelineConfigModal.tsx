'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@gateway-experience/shared';
import { Loader2 } from 'lucide-react';
import { getPipelineConfig, savePipelineConfig } from './api';

interface DimensionWeightItem {
  dimensionId: string;
  dimension: {
    id: string;
    code: string;
    name: string;
  };
  formWeight: number;
  visionWeight: number;
  isEnabled: boolean;
}

interface PipelineConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandId: string;
  applicationId: string;
  applicationName: string;
  onSuccess?: () => void;
}

export const PipelineConfigModal: React.FC<PipelineConfigModalProps> = ({
  isOpen,
  onClose,
  brandId,
  applicationId,
  applicationName,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formEnabled, setFormEnabled] = useState(true);
  const [questionnaireCode, setQuestionnaireCode] = useState('skinverse_longevity_v1');
  const [visionEnabled, setVisionEnabled] = useState(true);
  const [visionPipelineCode, setVisionPipelineCode] = useState('uv_aging_full');
  const [formWeightPercent, setFormWeightPercent] = useState(40);
  const [dimensionWeights, setDimensionWeights] = useState<DimensionWeightItem[]>([]);
  const [showAdvancedDimensions, setShowAdvancedDimensions] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchConfig = async () => {
    if (!isOpen || !applicationId) return;
    setLoading(true);
    setStatusMessage(null);
    try {
      const c = await getPipelineConfig(brandId, applicationId);
      if (c) {
        setFormEnabled(c.formEnabled ?? true);
        setQuestionnaireCode(c.questionnaireCode || 'skinverse_longevity_v1');
        setVisionEnabled(c.visionEnabled ?? true);
        setVisionPipelineCode(c.visionPipelineCode || 'uv_aging_full');
        setFormWeightPercent(Math.round((c.defaultFormWeight ?? 0.4) * 100));
        if (Array.isArray(c.dimensionWeights)) {
          setDimensionWeights(c.dimensionWeights);
        }
      }
    } catch (err: any) {
      console.error('Failed to load pipeline config', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchConfig();
    }
  }, [isOpen, applicationId, brandId]);

  const handleSave = async () => {
    setSaving(true);
    setStatusMessage(null);
    try {
      const formWeight = formWeightPercent / 100;
      const visionWeight = (100 - formWeightPercent) / 100;

      const data = await savePipelineConfig({
        brandId,
        applicationId,
        formEnabled,
        questionnaireCode,
        visionEnabled,
        visionPipelineCode,
        defaultFormWeight: formWeight,
        defaultVisionWeight: visionWeight,
        dimensionWeights: dimensionWeights.map((dw) => ({
          dimensionId: dw.dimensionId,
          formWeight: dw.formWeight,
          visionWeight: dw.visionWeight,
          isEnabled: dw.isEnabled,
        })),
      });
      if (data.success) {
        setStatusMessage('Pipeline configuration saved.');
        if (onSuccess) onSuccess();
        setTimeout(() => {
          onClose();
        }, 600);
      } else {
        setStatusMessage(data.error || 'Failed to save configuration.');
      }
    } catch (err: any) {
      setStatusMessage(err.message || 'Error saving pipeline config.');
    } finally {
      setSaving(false);
    }
  };

  const updateDimWeight = (dimensionId: string, formW: number) => {
    setDimensionWeights((prev) =>
      prev.map((item) => {
        if (item.dimensionId === dimensionId) {
          const normForm = Math.max(0, Math.min(100, formW)) / 100;
          return {
            ...item,
            formWeight: normForm,
            visionWeight: Math.round((1 - normForm) * 100) / 100,
          };
        }
        return item;
      })
    );
  };

  const toggleDimEnabled = (dimensionId: string) => {
    setDimensionWeights((prev) =>
      prev.map((item) => {
        if (item.dimensionId === dimensionId) {
          return { ...item, isEnabled: !item.isEnabled };
        }
        return item;
      })
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Pipeline Setup: ${applicationName}`}
      maxWidth="max-w-2xl"
      isLoading={saving}
      loadingText="Saving Pipeline Configuration..."
    >
      {loading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading configuration...</div>
      ) : (
        <div className="space-y-6 py-2 text-sm text-foreground">
          {/* Status Message */}
          {statusMessage && (
            <div className="rounded border border-border bg-slate-50 px-3 py-2 text-xs text-foreground">
              {statusMessage}
            </div>
          )}

          {/* Form Module */}
          <div className="rounded-lg border border-border bg-slate-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 font-medium cursor-pointer text-foreground">
                <input
                  type="checkbox"
                  checked={formEnabled}
                  onChange={(e) => setFormEnabled(e.target.checked)}
                  className="rounded border-border bg-white text-primary focus:ring-0"
                />
                <span>Form Questionnaire</span>
              </label>
              <span className="text-xs text-muted-foreground">{formEnabled ? 'Active' : 'Disabled'}</span>
            </div>

            {formEnabled && (
              <div className="pt-2">
                <label className="block text-xs text-muted-foreground mb-1">Questionnaire Template Code</label>
                <input
                  type="text"
                  value={questionnaireCode}
                  onChange={(e) => setQuestionnaireCode(e.target.value)}
                  placeholder="e.g. skinverse_longevity_v1"
                  className="w-full rounded border border-border bg-white px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Vision Module */}
          <div className="rounded-lg border border-border bg-slate-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 font-medium cursor-pointer text-foreground">
                <input
                  type="checkbox"
                  checked={visionEnabled}
                  onChange={(e) => setVisionEnabled(e.target.checked)}
                  className="rounded border-border bg-white text-primary focus:ring-0"
                />
                <span>Computer Vision Analysis</span>
              </label>
              <span className="text-xs text-muted-foreground">{visionEnabled ? 'Active' : 'Disabled'}</span>
            </div>

            {visionEnabled && (
              <div className="pt-2">
                <label className="block text-xs text-muted-foreground mb-1">Vision Pipeline Type</label>
                <input
                  type="text"
                  value={visionPipelineCode}
                  onChange={(e) => setVisionPipelineCode(e.target.value)}
                  placeholder="e.g. uv_aging_full"
                  className="w-full rounded border border-border bg-white px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Multimodal Score Weighting */}
          <div className="rounded-lg border border-border bg-slate-50/50 p-4 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-foreground">Multimodal Scoring Balance</span>
              <span className="text-muted-foreground">
                {formWeightPercent}% Form / {100 - formWeightPercent}% Vision
              </span>
            </div>

            <div className="pt-1">
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={formWeightPercent}
                onChange={(e) => setFormWeightPercent(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#d97706]"
              />
              <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
                <span>Form (Subjective)</span>
                <span>Vision (Objective Camera)</span>
              </div>
            </div>
          </div>

          {/* Optional Dimension Breakdown */}
          {dimensionWeights.length > 0 && (
            <div className="border-t border-border pt-3">
              <button
                type="button"
                onClick={() => setShowAdvancedDimensions(!showAdvancedDimensions)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {showAdvancedDimensions ? '▲ Hide Dimension Weights' : '▼ View Active Dimensions (' + dimensionWeights.length + ')'}
              </button>

              {showAdvancedDimensions && (
                <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1">
                  {dimensionWeights.map((dw) => (
                    <div
                      key={dw.dimensionId}
                      className="flex items-center justify-between py-1.5 px-2 rounded bg-slate-100/70 text-xs border border-border"
                    >
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={dw.isEnabled}
                          onChange={() => toggleDimEnabled(dw.dimensionId)}
                          className="rounded border-border bg-white text-primary focus:ring-0"
                        />
                        <span className={dw.isEnabled ? 'text-foreground font-medium' : 'text-muted-foreground line-through'}>
                          {dw.dimension?.name || dw.dimension?.code}
                        </span>
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {Math.round(dw.formWeight * 100)}% F / {Math.round(dw.visionWeight * 100)}% V
                        </span>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={10}
                          value={Math.round(dw.formWeight * 100)}
                          disabled={!dw.isEnabled}
                          onChange={(e) => updateDimWeight(dw.dimensionId, parseInt(e.target.value, 10))}
                          className="w-20 h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-[#d97706] disabled:opacity-30"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end pt-4 border-t border-border">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
