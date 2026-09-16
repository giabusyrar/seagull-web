'use client';

import React, { useState, useEffect } from 'react';
import { User, Check, AlertTriangle } from 'lucide-react';
import { EmptyState, Button } from '@gateway-experience/shared';
import type {
  ScoreRuleset,
  VisualAxisConfig,
  VisualProfileMappingConfig,
} from '../../types';
import {
  decompileJDMToVisualComponents,
  compileVisualToJDM,
} from '../../utils/jdm-compiler';
import { ProfileMappingTable } from '../reusable/ProfileMappingTable';

interface SkinProfilesTabProps {
  rulesets: ScoreRuleset[];
  selectedRuleset: ScoreRuleset | null;
  onSelectRuleset: (ruleset: ScoreRuleset) => void;
  onSaveRuleset: (updated: Partial<ScoreRuleset>) => Promise<void>;
}

const STRATEGY_LABEL: Record<string, string> = {
  combination_matrix: 'Combination matrix',
  total_score: 'Total score',
  primary_concern: 'Primary concern',
};

export const SkinProfilesTab: React.FC<SkinProfilesTabProps> = ({
  rulesets,
  selectedRuleset,
  onSelectRuleset,
  onSaveRuleset,
}) => {
  const activeRuleset = selectedRuleset || rulesets[0] || null;

  const [axes, setAxes] = useState<VisualAxisConfig[]>([]);
  const [profileConfig, setProfileConfig] = useState<VisualProfileMappingConfig>({
    strategy: 'combination_matrix',
    profiles: [],
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isLegacy, setIsLegacy] = useState(false);

  useEffect(() => {
    if (activeRuleset && activeRuleset.schema) {
      try {
        const { axes: decompiledAxes, profileConfig: decompiledProfiles, legacy } =
          decompileJDMToVisualComponents(activeRuleset.schema);
        setAxes(decompiledAxes);
        setProfileConfig(decompiledProfiles);
        setIsLegacy(legacy);
        setSaveError(null);
      } catch (err) {
        setSaveError(
          'Could not read the profile mapping: ' +
            (err instanceof Error ? err.message : 'invalid schema'),
        );
      }
    }
  }, [activeRuleset]);

  const handleSave = async () => {
    if (!activeRuleset) return;
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);
    try {
      const updatedSchema = compileVisualToJDM(axes, profileConfig);
      await onSaveRuleset({
        id: activeRuleset.id,
        code: activeRuleset.code,
        title: activeRuleset.title,
        description: activeRuleset.description,
        brandId: activeRuleset.brandId,
        applicationId: activeRuleset.applicationId,
        status: activeRuleset.status,
        schema: updatedSchema,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save skin profiles');
    } finally {
      setIsSaving(false);
    }
  };

  if (!activeRuleset) {
    return (
      <EmptyState
        icon={<User className="h-6 w-6 text-muted-foreground" />}
        title="No grading model selected"
        description="Create or pick a grading model to map its skin profiles."
        className="py-16 rounded-lg border border-border bg-card"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 min-w-0">
          <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
            Grading model
          </span>
          <select
            value={activeRuleset.id}
            onChange={(e) => {
              const r = rulesets.find((item) => item.id === e.target.value);
              if (r) onSelectRuleset(r);
            }}
            className="h-8 max-w-md w-full truncate rounded-md bg-muted/40 border border-border px-2.5 text-foreground text-xs outline-none focus:border-ring"
            style={{ colorScheme: 'dark' }}
          >
            {rulesets.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title} ({r.code} v{r.version})
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="rounded border border-border bg-muted/40 px-2 py-0.5 text-foreground">
              {STRATEGY_LABEL[profileConfig.strategy] ?? profileConfig.strategy}
            </span>
            <span>{profileConfig.profiles.length} profiles</span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {saveSuccess && (
            <span className="text-xs text-beak flex items-center gap-1">
              <Check className="h-3.5 w-3.5" />
              Saved
            </span>
          )}
          <Button variant="primary" size="sm" onClick={handleSave} isLoading={isSaving}>
            {isSaving ? 'Saving…' : 'Save profiles'}
          </Button>
        </div>
      </div>

      {saveError && (
        <div className="p-3 rounded-md border border-destructive/40 bg-destructive/10 text-xs text-destructive flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {isLegacy && (
        <div className="p-3 rounded-md border border-beak/40 bg-beak/10 text-xs text-foreground flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-beak" />
          <span>
            Ruleset ini dibuat dengan format lama. Isian di bawah adalah hasil konversi
            terbaik — periksa dulu sebelum <strong>Save profiles</strong>, karena menyimpan
            akan menulis ulang ruleset ke format baru.
          </span>
        </div>
      )}

      <ProfileMappingTable axes={axes} config={profileConfig} onChange={setProfileConfig} />
    </div>
  );
};
