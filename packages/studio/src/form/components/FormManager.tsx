'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Play } from 'lucide-react';
import {
  PageHeader,
  TabNav,
  usePersistentState,
  ConfirmDialog,
  BrandSelect,
  ApplicationSelect,
  InfoTooltip,
  type TabItem,
  readPersisted,
  writePersisted,
} from '@gateway-experience/shared';
import type { QuestionnaireItem } from '../types';

const TENANT_KEY = 'xg.formEngine.tenant';
const readTenant = (): { brandId: string; applicationId: string } => {
  const t = readPersisted<{ brandId?: string; applicationId?: string } | null>(TENANT_KEY);
  if (t?.brandId && t?.applicationId) return t as { brandId: string; applicationId: string };
  return { brandId: 'wardah', applicationId: 'skinverse' };
};

import { QuestionnairesTab } from './tabs/QuestionnairesTab';
import { FormSimulatorTab } from './tabs/FormSimulatorTab';
import { QuestionnaireModal } from './modals/QuestionnaireModal';

import { listQuestionnaires, saveQuestionnaire, deleteQuestionnaire } from '../api';

export const FormManager: React.FC = () => {
  const [activeTab, setActiveTab] = usePersistentState<'questionnaires' | 'simulator'>('xg.formEngine.activeTab', 'questionnaires');
  const [searchQuery, setSearchQuery] = useState('');

  // Confirm Delete Dialog State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Active tenant — drives the questionnaire list and new-questionnaire defaults.
  const [{ brandId, applicationId }, setTenant] = useState(readTenant);

  // Dynamic API State
  const [questionnaires, setQuestionnaires] = useState<QuestionnaireItem[]>([]);

  // Modals Visibility
  const [isQuestionnaireModalOpen, setIsQuestionnaireModalOpen] = useState(false);

  // Edit Targets
  const [editingQ, setEditingQ] = useState<QuestionnaireItem | null>(null);

  // Simulator State — Form Engine only calculates; no Score Engine call.
  const [selectedQCode, setSelectedQCode] = usePersistentState('xg.formEngine.simulator.questionnaire', '');

  const loadData = () => {
    // Questionnaires are served by the Form Engine via /core/form-engine/survey,
    // scoped to the active brand / application tenant.
    listQuestionnaires(brandId, applicationId)
      .then(setQuestionnaires)
      .catch(() => setQuestionnaires([]));
  };

  useEffect(() => {
    loadData();
    writePersisted(TENANT_KEY, { brandId, applicationId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandId, applicationId]);

  // Keep the simulator pointed at a real questionnaire once the list loads.
  useEffect(() => {
    if (questionnaires.length === 0) return;
    if (!questionnaires.some((q) => q.code === selectedQCode)) {
      setSelectedQCode(questionnaires[0].code);
    }
  }, [questionnaires, selectedQCode]);

  const formTabs: TabItem[] = [
    { id: 'questionnaires', label: 'Questionnaires', icon: <FileText className="h-4 w-4" />, badge: questionnaires.length },
    { id: 'simulator', label: 'Simulator', icon: <Play className="h-4 w-4" /> },
  ];

  // Save Handlers
  const handleSaveQuestionnaire = async (data: QuestionnaireItem) => {
    if (editingQ) {
      const updated = { ...editingQ, ...data };
      setQuestionnaires((prev) => prev.map((x) => (x.code === editingQ.code ? updated : x)));
      try {
        await saveQuestionnaire(updated, brandId, applicationId);
      } catch {}
    } else {
      const newItem: QuestionnaireItem = {
        ...data,
        brandId: data.brandId || brandId,
        applicationId: data.applicationId || applicationId,
        questionsCount: data.questions?.length || 0,
      };
      setQuestionnaires((prev) => [...prev, newItem]);
      try {
        await saveQuestionnaire(newItem, brandId, applicationId);
      } catch {}
    }
    loadData();
  };

  const handleDeleteQuestionnaire = (code: string) => {
    const q = questionnaires.find((x) => x.code === code);
    setDeleteConfirm({
      isOpen: true,
      title: 'Delete Questionnaire Form',
      message: `Are you sure you want to delete questionnaire form "${q?.name || code}" (${code})?`,
      onConfirm: async () => {
        setQuestionnaires((prev) => prev.filter((q) => q.code !== code));
        try {
          await deleteQuestionnaire(code, brandId, applicationId);
        } catch {}
        setDeleteConfirm((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  return (
    <div className="flex-1 min-w-0 h-full overflow-y-auto bg-background text-foreground font-sans flex flex-col select-none">
      <PageHeader
        icon={<FileText className="h-5 w-5" />}
        breadcrumbs={[
          { label: 'Workbench', href: '/' },
          { label: 'Core Engines' },
          { label: 'Form Engine' },
        ]}
        title="Form Engine"
      >
        <TabNav
          tabs={formTabs}
          activeTab={activeTab}
          onTabChange={(id) => setActiveTab(id as any)}
        />
      </PageHeader>

      <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
        <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-3">
          <BrandSelect
            value={brandId}
            includeUniversal={false}
            label="Brand"
            className="w-48"
            onChange={(v) => setTenant((t) => ({ ...t, brandId: v }))}
          />
          <ApplicationSelect
            value={applicationId}
            includeUniversal={false}
            label="Application"
            className="w-48"
            onChange={(v) => setTenant((t) => ({ ...t, applicationId: v }))}
          />
          <div className="flex pb-2">
            <InfoTooltip
              content="Questionnaires below are scoped to this brand / application."
              label="About brand / application scope"
            />
          </div>
        </div>

        {activeTab === 'questionnaires' && (
          <QuestionnairesTab
            questionnaires={questionnaires}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onOpenAddModal={() => {
              setEditingQ(null);
              setIsQuestionnaireModalOpen(true);
            }}
            onOpenEditModal={(q) => {
              setEditingQ(q);
              setIsQuestionnaireModalOpen(true);
            }}
            onDeleteQuestionnaire={handleDeleteQuestionnaire}
          />
        )}

        {activeTab === 'simulator' && (
          <FormSimulatorTab
            brandId={brandId}
            applicationId={applicationId}
            questionnaires={questionnaires}
            selectedQCode={selectedQCode}
            setSelectedQCode={setSelectedQCode}
          />
        )}
      </main>

      {/* Modals */}
      <QuestionnaireModal
        isOpen={isQuestionnaireModalOpen}
        onClose={() => setIsQuestionnaireModalOpen(false)}
        onSave={handleSaveQuestionnaire}
        editingQ={editingQ}
        brandId={brandId}
        applicationId={applicationId}
      />

      {/* Global Delete Confirmation Dialog */}
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
