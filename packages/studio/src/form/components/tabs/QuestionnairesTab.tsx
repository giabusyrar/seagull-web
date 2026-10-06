'use client';

import React, { useState } from 'react';
import { FileText, Pencil, Trash2, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { SearchFilterBar, EmptyState } from '@gateway-experience/shared';
import type { QuestionnaireItem } from '../../types';
import { CALCULATION_METHODS, getDimensionMeta } from '../../catalog';

interface QuestionnairesTabProps {
  questionnaires: QuestionnaireItem[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (q: QuestionnaireItem) => void;
  onDeleteQuestionnaire: (code: string) => void;
}

const methodLabel = (q: QuestionnaireItem, dimension: string): string => {
  const m = q.calculationMethods?.[dimension] || 'sum';
  return CALCULATION_METHODS.find((x) => x.value === m)?.label || m;
};

export const QuestionnairesTab: React.FC<QuestionnairesTabProps> = ({
  questionnaires,
  searchQuery,
  onSearchChange,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteQuestionnaire,
}) => {
  const [expandedCode, setExpandedCode] = useState<string | null>(null);

  const filtered = questionnaires.filter((q) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      q.name.toLowerCase().includes(query) ||
      q.code.toLowerCase().includes(query) ||
      q.description?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-4">
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search questionnaires by name, code, or description…"
        actionLabel="New questionnaire"
        onAction={onOpenAddModal}
      />

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-6 w-6 text-muted-foreground" />}
            title="No questionnaires yet"
            description="Build a questionnaire that turns answers into one score per dimension."
            actionLabel="New questionnaire"
            onAction={onOpenAddModal}
            actionIcon={<Plus className="h-4 w-4" />}
            className="py-14"
          />
        ) : (
          filtered.map((q) => {
            const isExpanded = expandedCode === q.code;
            const questions = q.questions || [];
            const dimensions = Array.from(new Set(questions.map((qu) => qu.dimension)));

            return (
              <div
                key={q.code}
                className="rounded-lg border border-border bg-card overflow-hidden transition hover:border-beak/50"
              >
                <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <code className="text-[11px] font-mono text-beak bg-beak/10 border border-beak/30 px-1.5 py-0.5 rounded">{q.code}</code>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold ${
                          q.status === 'published'
                            ? 'bg-beak/15 text-beak'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {q.status || 'draft'}
                      </span>
                    </div>

                    <h4 className="font-bold text-foreground text-sm">{q.name}</h4>
                    {q.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed">{q.description}</p>
                    )}

                    {dimensions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {dimensions.map((dim) => (
                          <span
                            key={dim}
                            className="rounded border border-border px-2 py-0.5 text-[11px] text-muted-foreground"
                          >
                            <span className="text-foreground font-medium">
                              {getDimensionMeta(dim).label}
                            </span>{' '}
                            · {methodLabel(q, dim)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <span className="text-[11px] text-muted-foreground hidden sm:block">
                      {questions.length || q.questionsCount || 0} questions
                    </span>
                    <button
                      onClick={() => setExpandedCode(isExpanded ? null : q.code)}
                      className="h-8 px-2.5 rounded-md border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-ring transition flex items-center gap-1.5"
                    >
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      {isExpanded ? 'Hide' : 'Preview'}
                    </button>
                    <button
                      onClick={() => onOpenEditModal(q)}
                      className="h-8 w-8 rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-ring transition flex items-center justify-center"
                      title="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteQuestionnaire(q.code)}
                      className="h-8 w-8 rounded-md border border-border text-muted-foreground hover:text-destructive hover:border-destructive/50 transition flex items-center justify-center"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-border bg-muted/20 p-4 space-y-2">
                    {questions.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No questions configured.</p>
                    ) : (
                      questions.map((qu, qIdx) => (
                        <div key={qu.id || qIdx} className="rounded-md border border-border bg-card p-3 space-y-2">
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <span className="text-foreground">
                              <span className="text-muted-foreground mr-1">{qIdx + 1}.</span>
                              {qu.label}
                            </span>
                            <span className="text-[10px] uppercase tracking-wide text-beak shrink-0">
                              {getDimensionMeta(qu.dimension).label}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {qu.options.map((opt, oi) => (
                              <div
                                key={oi}
                                className="rounded border border-border px-2 py-1 flex items-center justify-between text-xs"
                              >
                                <span className="text-muted-foreground truncate pr-2">{opt.label}</span>
                                {opt.score != null ? (
                                  <span className="text-foreground font-mono shrink-0">
                                    {opt.score > 0 ? '+' : ''}{opt.score}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground text-[10px] shrink-0">not scored</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};