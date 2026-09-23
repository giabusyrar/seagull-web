'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Copy, Check, Plus, AlertTriangle, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { Modal, Button, BrandSelect, ApplicationSelect, StatusSelect, InfoTooltip } from '@gateway-experience/shared';
import type {
  ScoreRuleset,
  VisualAxisConfig,
  VisualProfileMappingConfig,
  VisualBand,
} from '../../types';
import { DEFAULT_SCORE_RANGE_BANDS, DEFAULT_SEVERITY_BANDS } from '../../types';
import {
  compileVisualToJDM,
  decompileJDMToVisualComponents,
  defaultConcernLabel,
  DEFAULT_STARTER_AXES,
  DEFAULT_STARTER_PROFILES,
} from '../../utils/jdm-compiler';
import { ClinicalAxisCard } from '../reusable/ClinicalAxisCard';
import { BandTable } from '../reusable/BandTable';
import { ProfileMappingTable } from '../reusable/ProfileMappingTable';

interface RulesetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ruleset: Partial<ScoreRuleset>) => Promise<void>;
  editingRuleset: ScoreRuleset | null;
}

const inputCls =
  'w-full h-9 rounded-md bg-muted/40 border border-border px-3 text-foreground text-sm placeholder:text-muted-foreground outline-none focus:border-ring disabled:opacity-50';
const labelCls = 'block text-xs font-semibold text-foreground mb-1.5';

const slugify = (v: string) =>
  v.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

export const RulesetModal: React.FC<RulesetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingRuleset,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [codeEdited, setCodeEdited] = useState(false);
  const [showCodeField, setShowCodeField] = useState(false);
  const [description, setDescription] = useState('');
  const [brandId, setBrandId] = useState('*');
  const [applicationId, setApplicationId] = useState('*');
  const [status, setStatus] = useState('ACTIVE');

  const [axes, setAxes] = useState<VisualAxisConfig[]>(DEFAULT_STARTER_AXES);
  const [profileConfig, setProfileConfig] = useState<VisualProfileMappingConfig>(DEFAULT_STARTER_PROFILES);
  const [scoreRangeBands, setScoreRangeBands] = useState<VisualBand[]>(DEFAULT_SCORE_RANGE_BANDS);
  const [severityBands, setSeverityBands] = useState<VisualBand[]>(DEFAULT_SEVERITY_BANDS);

  const [tab, setTab] = useState<'setup' | 'dimensions' | 'bands'>('setup');
  const [schemaOpen, setSchemaOpen] = useState(true);
  const notesRef = useRef<HTMLTextAreaElement | null>(null);

  // Grow the Notes field to fit its content so it never gets its own scrollbar —
  // the modal body is the single scroll surface.
  const fitNotes = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };
  const [copied, setCopied] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isLegacy, setIsLegacy] = useState(false);

  useEffect(() => {
    if (editingRuleset) {
      setName(editingRuleset.title);
      setCode(editingRuleset.code);
      setCodeEdited(true);
      setShowCodeField(false);
      setDescription(editingRuleset.description || '');
      setBrandId(editingRuleset.brandId || '*');
      setApplicationId(editingRuleset.applicationId || '*');
      setStatus(editingRuleset.status || 'ACTIVE');
      const { axes: a, profileConfig: p, scoreRangeBands: sr, severityBands: sv, legacy } =
        decompileJDMToVisualComponents(editingRuleset.schema);
      setAxes(a);
      setProfileConfig(p);
      setScoreRangeBands(sr);
      setSeverityBands(sv);
      setIsLegacy(legacy);
    } else {
      setName('');
      setCode('');
      setCodeEdited(false);
      setShowCodeField(false);
      setDescription('');
      setBrandId('*');
      setApplicationId('*');
      setStatus('ACTIVE');
      setAxes(DEFAULT_STARTER_AXES);
      setProfileConfig(DEFAULT_STARTER_PROFILES);
      setScoreRangeBands(DEFAULT_SCORE_RANGE_BANDS);
      setSeverityBands(DEFAULT_SEVERITY_BANDS);
      setIsLegacy(false);
    }
    setTab('setup');
    setFormError(null);
  }, [editingRuleset, isOpen]);

  // Re-fit Notes after hydration and whenever it re-mounts on the Setup tab.
  useEffect(() => {
    fitNotes(notesRef.current);
  }, [description, tab, isOpen]);

  const effectiveCode = codeEdited ? code : slugify(name);
  const totalWeight = axes.reduce((sum, a) => sum + (Number(a.weight) || 0), 0);

  const addAxis = () => {
    const n = axes.length + 1;
    setAxes((prev) => [
      ...prev,
      {
        id: `axis_${Date.now()}`,
        axisCode: `DIM_${n}`,
        name: `Dimension ${n}`,
        dimensionKey: 'sensitivity',
        weight: 1,
        concernLabel: defaultConcernLabel('sensitivity'),
      },
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setTab('setup');
      return setFormError('Name is required.');
    }
    if (!effectiveCode) {
      setTab('setup');
      return setFormError('Could not derive a code — set one manually.');
    }

    setIsSubmitting(true);
    try {
      await onSave({
        id: editingRuleset?.id,
        code: effectiveCode,
        title: name.trim(),
        description: description.trim(),
        brandId,
        applicationId,
        status,
        schema: compileVisualToJDM(axes, profileConfig, scoreRangeBands, severityBands),
      });
      onClose();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save grading model');
    } finally {
      setIsSubmitting(false);
    }
  };

  const jsonText = compileVisualToJDM(axes, profileConfig, scoreRangeBands, severityBands);

  // Ready-to-paste request bodies for the Core Score Engine API collection.
  // `schema` goes over the wire as a JSON string, so it is embedded as-is here
  // (JSON.stringify escapes it) — no manual stringifying needed.
  const createRequestBody = JSON.stringify(
    {
      brandId,
      applicationId,
      code: effectiveCode || '<code>',
      title: name.trim() || '<name>',
      description: description.trim(),
      status,
      schema: jsonText,
    },
    null,
    2,
  );
  const simulateRequestBody = JSON.stringify(
    {
      schema: jsonText,
      dimension_scores: Object.fromEntries(
        axes.map((a) => [a.dimensionKey.toLowerCase(), 50]),
      ),
      customer_condition: {},
    },
    null,
    2,
  );

  const copyAs = (label: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingRuleset ? `Edit: ${editingRuleset.title}` : 'New grading model'}
      maxWidth="max-w-5xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {isLegacy && (
          <div className="p-3 rounded-md border border-beak/40 bg-beak/10 text-xs text-foreground flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-beak" />
            <span>
              Ruleset ini dibuat dengan format lama. Dimensi, band, dan profil di bawah adalah
              hasil konversi terbaik — periksa dulu sebelum <strong>Save changes</strong>, karena
              menyimpan akan menulis ulang ruleset ke format baru.
            </span>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-4 items-start">
          {/* Left column — tabbed editor */}
          <div className="w-full lg:flex-1 min-w-0 space-y-3">
            <div className="flex items-center gap-1 rounded-md border border-border bg-muted/40 p-1">
              {(
                [
                  ['setup', 'Setup'],
                  ['dimensions', `Dimensions${axes.length ? ` (${axes.length})` : ''}`],
                  ['bands', 'Score, Severity & Profiles'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`flex-1 rounded px-3 py-1.5 text-xs font-semibold transition-colors ${
                    tab === id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Tab 1 — Setup */}
            {tab === 'setup' && (
              <div className="space-y-3">
                <div>
                  <label className={labelCls}>
                    Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Wardah Skinverse grading"
                    className={inputCls}
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    saved as <span className="text-foreground font-mono">{effectiveCode || '…'}</span>
                    {!editingRuleset && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowCodeField((v) => !v);
                          if (!codeEdited) setCode(effectiveCode);
                        }}
                        className="ml-2 underline hover:text-foreground"
                      >
                        edit
                      </button>
                    )}
                  </p>
                  {showCodeField && !editingRuleset && (
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => {
                        setCode(slugify(e.target.value));
                        setCodeEdited(true);
                      }}
                      className={inputCls + ' mt-1.5 font-mono'}
                    />
                  )}
                  {editingRuleset?.id && (
                    <button
                      type="button"
                      onClick={() => copyAs('ID', editingRuleset.id)}
                      title="Copy ID — needed for PUT /core/score-engine/rulesets/:id"
                      className="mt-1 flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-foreground"
                    >
                      {copied === 'ID' ? (
                        <Check className="h-3 w-3 text-beak" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      {copied === 'ID' ? 'ID copied' : `ID ${editingRuleset.id}`}
                    </button>
                  )}
                </div>

                <div className="max-w-xs">
                  <label className={labelCls}>Status</label>
                  <StatusSelect value={status} onChange={setStatus} label="" />
                </div>

                <div className="rounded-md border border-border bg-muted/20">
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                    Scope &amp; notes
                  </div>
                  <div className="border-t border-border p-3 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <BrandSelect value={brandId} onChange={setBrandId} includeUniversal label="Brand" />
                      <ApplicationSelect
                        value={applicationId}
                        onChange={setApplicationId}
                        includeUniversal
                        label="Application"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Notes</label>
                      <textarea
                        ref={(el) => {
                          notesRef.current = el;
                          fitNotes(el);
                        }}
                        rows={2}
                        value={description}
                        onChange={(e) => {
                          setDescription(e.target.value);
                          fitNotes(e.target);
                        }}
                        placeholder="What this model covers and why the thresholds are set this way…"
                        className={inputCls + ' h-auto py-2 resize-none overflow-hidden'}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2 — Dimensions */}
            {tab === 'dimensions' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-foreground">Dimensions</h3>
                    <InfoTooltip
                      content="Weights are relative — a dimension’s share of the overall score is its weight ÷ the total of all weights. The concern label is what the customer sees when that dimension is their dominant concern."
                      label="About dimensions"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addAxis}
                    leftIcon={<Plus className="h-3.5 w-3.5" />}
                  >
                    Add dimension
                  </Button>
                </div>
                {axes.map((axis, i) => (
                  <ClinicalAxisCard
                    key={axis.id}
                    axis={axis}
                    index={i}
                    defaultOpen={axes.length === 1}
                    siblingWeightTotal={totalWeight}
                    onUpdate={(updated) =>
                      setAxes((prev) => prev.map((a) => (a.id === axis.id ? updated : a)))
                    }
                    onDelete={() => {
                      if (axes.length <= 1) {
                        setFormError('Keep at least one dimension.');
                        return;
                      }
                      setAxes((prev) => prev.filter((a) => a.id !== axis.id));
                      setFormError(null);
                    }}
                    canDelete={axes.length > 1}
                  />
                ))}
              </div>
            )}

            {/* Tab 3 — Score Range + Severity Level (both applied to the overall score) */}
            {tab === 'bands' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-foreground">Score Range</h3>
                    <InfoTooltip
                      content="Coarse category for the overall score (100 = optimal)."
                      label="About Score Range"
                    />
                  </div>
                  <BandTable bands={scoreRangeBands} onChange={setScoreRangeBands} idPrefix="sr" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-foreground">Severity Level</h3>
                    <InfoTooltip
                      content="Overall clinical severity from the total score."
                      label="About Severity Level"
                    />
                  </div>
                  <BandTable bands={severityBands} onChange={setSeverityBands} idPrefix="sv" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-foreground">Skin Profiles</h3>
                    <InfoTooltip
                      content="Maps combinations of dimension axis codes to a named, described profile (e.g. DSPT → 'Kulit kering, sensitif...')."
                      label="About Skin Profiles"
                    />
                  </div>
                  <ProfileMappingTable axes={axes} config={profileConfig} onChange={setProfileConfig} />
                </div>
              </div>
            )}
          </div>

          {/* Right column — schema & API bodies. Open: a fixed panel. Collapsed:
              a thin vertical rail (structural sizing is inline so it does not
              depend on a Tailwind rebuild picking up the classes). */}
          {!schemaOpen ? (
            <button
              type="button"
              onClick={() => setSchemaOpen(true)}
              title="Show schema & API"
              className="rounded-md border border-border bg-muted/20 text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:border-beak/50"
              style={{
                flex: '0 0 34px',
                width: 34,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                padding: '12px 0',
              }}
            >
              <PanelRightOpen className="h-3.5 w-3.5" style={{ flexShrink: 0 }} />
              <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', whiteSpace: 'nowrap' }}>
                Schema &amp; API
              </span>
            </button>
          ) : (
            <div className="w-full lg:w-64 lg:shrink-0">
              <div className="rounded-md border border-border bg-muted/20 lg:sticky lg:top-0">
                <button
                  type="button"
                  onClick={() => setSchemaOpen(false)}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  <span>Schema &amp; API</span>
                  <PanelRightClose className="h-3.5 w-3.5 shrink-0" />
                </button>
                <div className="border-t border-border">
                  <div className="flex flex-wrap items-center gap-1.5 px-3 py-2">
                    {[
                      { label: 'Schema', text: jsonText },
                      { label: 'Copy request body', text: createRequestBody },
                      { label: 'Simulate request', text: simulateRequestBody },
                    ].map(({ label, text }) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => copyAs(label, text)}
                        className="flex items-center gap-1 rounded border border-border bg-card px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:border-beak/50"
                      >
                        {copied === label ? (
                          <Check className="h-3 w-3 text-beak" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        {copied === label ? 'Copied' : label}
                      </button>
                    ))}
                  </div>
                  <textarea
                    rows={10}
                    readOnly
                    value={jsonText}
                    className="w-full border-t border-border bg-card px-3 py-2 font-mono text-[11px] text-foreground outline-none leading-relaxed lg:max-h-[30vh]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {formError && (
          <div className="p-3 rounded-md border border-destructive/40 bg-destructive/10 text-xs text-destructive flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting} disabled={!name.trim()}>
            {editingRuleset ? 'Save changes' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
