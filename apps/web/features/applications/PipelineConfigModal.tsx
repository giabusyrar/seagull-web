'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@gateway-experience/shared';
import { Loader2 } from 'lucide-react';
import { getPipelineConfig, savePipelineConfig } from './api';

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
      const data = await savePipelineConfig({
        brandId,
        applicationId,
        formEnabled,
        questionnaireCode,
        visionEnabled,
        visionPipelineCode,
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

          {/* Weights are not set here: they belong to the scoring ruleset. */}
          <p className="rounded-lg border border-border bg-slate-50/50 p-4 text-xs text-muted-foreground">
            How form, vision and any other source are weighted is set per dimension in the scoring ruleset
            (Score studio → Blending), so every engine scores from the same weights.
          </p>

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
