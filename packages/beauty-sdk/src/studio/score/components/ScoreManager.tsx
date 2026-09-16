'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sliders, Play, FileText, User } from 'lucide-react';
import { PageHeader, TabNav, ConfirmDialog, type TabItem } from '@gateway-experience/shared';
import type { ScoreRuleset } from '../types';

import { RulesetsTab } from './tabs/RulesetsTab';
import { SkinProfilesTab } from './tabs/SkinProfilesTab';
import { ScoreSimulatorTab } from './tabs/ScoreSimulatorTab';
import { RulesetModal } from './modals/RulesetModal';

// Score Engine is reached through the API Gateway "Core Engine API" collection,
// which forwards `/core/score-engine/*` to the engine host and injects the API
// key. Routes are registered as bare resources (e.g. `/core/score-engine/rulesets`).
const SCORE = '/core/score-engine';

export const ScoreManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rulesets' | 'profiles' | 'simulator'>('rulesets');
  const [searchQuery, setSearchQuery] = useState('');

  // Rulesets Data
  const [rulesets, setRulesets] = useState<ScoreRuleset[]>([]);
  const [selectedRuleset, setSelectedRuleset] = useState<ScoreRuleset | null>(null);

  // Modals Visibility
  const [isRulesetModalOpen, setIsRulesetModalOpen] = useState(false);
  const [editingRuleset, setEditingRuleset] = useState<ScoreRuleset | null>(null);

  // Confirm Delete Dialog State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    isLoading?: boolean;
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    isLoading: false,
    onConfirm: () => {},
  });

  const loadRulesets = useCallback(() => {
    fetch(`${SCORE}/rulesets`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.rulesets)) {
          setRulesets(data.rulesets);
          if (data.rulesets.length > 0) {
            setSelectedRuleset((prev) => prev || data.rulesets[0]);
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadRulesets();
  }, [loadRulesets]);

  const scoreTabs: TabItem[] = [
    {
      id: 'rulesets',
      label: 'Skin Grading',
      icon: <Sliders className="h-4 w-4" />,
      badge: rulesets.length,
    },
    {
      id: 'profiles',
      label: 'Skin Profiles',
      icon: <User className="h-4 w-4" />,
    },
    {
      id: 'simulator',
      label: 'Simulator',
      icon: <Play className="h-4 w-4" />,
    },
  ];

  const handleSaveRuleset = async (rulesetData: Partial<ScoreRuleset>) => {
    const isEdit = !!rulesetData.id;
    const url = isEdit ? `${SCORE}/rulesets/${rulesetData.id}` : `${SCORE}/rulesets`;
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rulesetData),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Failed to save skin grading framework');
    }

    loadRulesets();
  };

  const handleDeleteRuleset = (id: string, code: string) => {
    setDeleteConfirm({
      isOpen: true,
      title: 'Delete Skin Grading Framework',
      message: `Are you sure you want to delete skin grading framework "${code}"? This cannot be undone.`,
      onConfirm: async () => {
        setDeleteConfirm((prev) => ({ ...prev, isLoading: true }));
        try {
          const res = await fetch(`${SCORE}/rulesets/${id}`, { method: 'DELETE' });
          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || 'Failed to delete ruleset');
          }
          loadRulesets();
        } catch (err: any) {
          alert(err.message);
        } finally {
          setDeleteConfirm((prev) => ({ ...prev, isOpen: false, isLoading: false }));
        }
      },
    });
  };

  return (
    <div className="flex-1 min-w-0 h-full overflow-y-auto bg-background text-foreground font-sans flex flex-col select-none">
      {/* Studio Header */}
      <PageHeader
        icon={<FileText className="h-5 w-5" />}
        breadcrumbs={[
          { label: 'Workbench', href: '/api-client' },
          { label: 'Core Engines' },
          { label: 'Score Engine' },
        ]}
        title="Score Engine"
      >
        <TabNav
          tabs={scoreTabs}
          activeTab={activeTab}
          onTabChange={(id: string) => {
            setActiveTab(id as any);
            setSearchQuery('');
          }}
        />
      </PageHeader>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto">
        {activeTab === 'rulesets' && (
          <RulesetsTab
            rulesets={rulesets}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onOpenCreateModal={() => {
              setEditingRuleset(null);
              setIsRulesetModalOpen(true);
            }}
            onOpenEditModal={(r) => {
              setEditingRuleset(r);
              setIsRulesetModalOpen(true);
            }}
            onSelectSimulatorRuleset={(r) => {
              setSelectedRuleset(r);
              setActiveTab('simulator');
            }}
            onDeleteRuleset={handleDeleteRuleset}
          />
        )}

        {activeTab === 'profiles' && (
          <SkinProfilesTab
            rulesets={rulesets}
            selectedRuleset={selectedRuleset}
            onSelectRuleset={setSelectedRuleset}
            onSaveRuleset={handleSaveRuleset}
          />
        )}

        {activeTab === 'simulator' && (
          <ScoreSimulatorTab
            rulesets={rulesets}
            selectedRuleset={selectedRuleset}
            onSelectRuleset={setSelectedRuleset}
          />
        )}
      </main>

      {/* Modals */}
      <RulesetModal
        isOpen={isRulesetModalOpen}
        onClose={() => setIsRulesetModalOpen(false)}
        onSave={handleSaveRuleset}
        editingRuleset={editingRuleset}
      />

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title={deleteConfirm.title}
        message={deleteConfirm.message}
        onConfirm={deleteConfirm.onConfirm}
        onClose={() => setDeleteConfirm((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
