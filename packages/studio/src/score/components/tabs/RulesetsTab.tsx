'use client';

import React from 'react';
import { Sliders, Pencil, Trash2, Play, Plus, Copy, Check } from 'lucide-react';
import { StatusBadge, EmptyState, SearchFilterBar, Button } from '@gateway-experience/shared';
import type { ScoreRuleset } from '../../types';

interface RulesetsTabProps {
  rulesets: ScoreRuleset[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenCreateModal: () => void;
  onOpenEditModal: (ruleset: ScoreRuleset) => void;
  onSelectSimulatorRuleset: (ruleset: ScoreRuleset) => void;
  onDeleteRuleset: (id: string, code: string) => void;
}

const filterSelect =
  'h-8 rounded-md bg-muted/40 border border-border px-2.5 text-foreground text-xs outline-none focus:border-ring';

export const RulesetsTab: React.FC<RulesetsTabProps> = ({
  rulesets,
  searchQuery,
  onSearchChange,
  onOpenCreateModal,
  onOpenEditModal,
  onSelectSimulatorRuleset,
  onDeleteRuleset,
}) => {
  const [filterBrand, setFilterBrand] = React.useState('ALL');
  const [filterStatus, setFilterStatus] = React.useState('ALL');
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const copyId = (id: string) => {
    navigator.clipboard?.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const filteredRulesets = rulesets.filter((r) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      r.code.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      (r.description ?? '').toLowerCase().includes(q);
    const matchesBrand = filterBrand === 'ALL' || r.brandId === filterBrand;
    const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;
    return matchesSearch && matchesBrand && matchesStatus;
  });

  const uniqueBrands = Array.from(new Set(rulesets.map((r) => r.brandId).filter(Boolean)));

  return (
    <div className="space-y-4">
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search grading models by title, code, or brand…"
        actionLabel="New grading model"
        onAction={onOpenCreateModal}
        actionIcon={<Plus className="h-4 w-4" />}
        customFilterContent={
          <div className="flex items-center gap-2">
            <select
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
              className={filterSelect}
              style={{ colorScheme: 'dark' }}
            >
              <option value="ALL">All brands</option>
              <option value="*">* (universal)</option>
              {uniqueBrands
                .filter((b) => b !== '*')
                .map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={filterSelect}
              style={{ colorScheme: 'dark' }}
            >
              <option value="ALL">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="DRAFT">Draft</option>
              <option value="INACTIVE">Inactive</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        }
      />

      {filteredRulesets.length === 0 ? (
        <EmptyState
          icon={<Sliders className="h-6 w-6 text-muted-foreground" />}
          title="No grading models yet"
          description="A grading model turns 0–100 dimension scores into Level 1–5 severity and a skin profile."
          actionLabel="New grading model"
          onAction={onOpenCreateModal}
          actionIcon={<Plus className="h-4 w-4" />}
          className="py-12 rounded-lg border border-border bg-card"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredRulesets.map((ruleset) => {
            let dimCount = 0;
            try {
              const parsed = JSON.parse(ruleset.schema);
              // Phase-2 schemas carry one decisionTableNode regardless of how many
              // dimensions — the real count is in dimension_weights / concern_labels.
              const dimKeys =
                parsed.dimension_weights ||
                parsed.concern_labels ||
                parsed.axis_codes ||
                {};
              dimCount = Object.keys(dimKeys).length;
            } catch {
              /* ignore */
            }

            return (
              <div
                key={ruleset.id}
                className="rounded-lg border border-border bg-card p-4 flex flex-col justify-between transition-colors hover:border-beak/50"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-beak bg-beak/10 px-2 py-0.5 rounded border border-beak/30">
                      {ruleset.code}
                    </span>
                    <span className="text-[11px] text-muted-foreground">v{ruleset.version}</span>
                    <StatusBadge status={ruleset.status} />
                  </div>
                  <h3 className="text-sm font-bold text-foreground mt-1.5">{ruleset.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                    {ruleset.description || 'Severity bands and skin-profile mapping for this brand.'}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-muted-foreground mt-3">
                    <span>
                      Brand <span className="text-foreground">{ruleset.brandId}</span>
                    </span>
                    <span>
                      App <span className="text-foreground">{ruleset.applicationId}</span>
                    </span>
                    <span>
                      <span className="text-foreground">{dimCount}</span> dimensions
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => copyId(ruleset.id)}
                    title="Copy ID — needed for PUT /core/score-engine/rulesets/:id"
                    className="mt-2 flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-foreground"
                  >
                    {copiedId === ruleset.id ? (
                      <Check className="h-3 w-3 text-beak" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    <span className="truncate max-w-[16rem]">
                      {copiedId === ruleset.id ? 'ID copied' : `ID ${ruleset.id}`}
                    </span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onOpenEditModal(ruleset)}
                      leftIcon={<Pencil className="h-3.5 w-3.5" />}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectSimulatorRuleset(ruleset)}
                      leftIcon={<Play className="h-3.5 w-3.5" />}
                    >
                      Simulate
                    </Button>
                  </div>
                  <button
                    onClick={() => onDeleteRuleset(ruleset.id, ruleset.code)}
                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-muted/40 rounded transition-colors"
                    title="Delete grading model"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
