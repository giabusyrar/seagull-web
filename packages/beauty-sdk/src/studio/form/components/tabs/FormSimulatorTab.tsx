'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Play, ChevronRight, ChevronDown } from 'lucide-react';
import { EmptyState, readPersisted, usePersistentState } from '@gateway-experience/shared';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import type { CalculationMethod, QuestionnaireItem } from '../../types';
import { CALCULATION_METHODS, applyCalculationMethod, getDimensionMeta } from '../../catalog';
import { toSurveyModel, buildScoreRequest } from '../../surveyjs';
import { XG_SURVEY_THEME } from '../../survey-theme';

// Simulator answers are kept per questionnaire, so a reload (or switching
// questionnaires and back) restores the answers last given to each one.
const ANSWERS_KEY_PREFIX = 'xg.formEngine.simulator.answers.';
const CUSTOMER_ID_KEY = 'xg.formEngine.simulator.customerId';

interface FormSimulatorTabProps {
  questionnaires: QuestionnaireItem[];
  selectedQCode: string;
  setSelectedQCode: (c: string) => void;
}

export const FormSimulatorTab: React.FC<FormSimulatorTabProps> = ({
  questionnaires,
  selectedQCode,
  setSelectedQCode,
}) => {
  const currentQ =
    questionnaires.find((q) => q.code === selectedQCode) || questionnaires[0];
  const hasQuestions = (currentQ?.questions?.length ?? 0) > 0;

  const schema = useMemo(
    () => (currentQ ? toSurveyModel(currentQ) : null),
    [currentQ],
  );

  const answersKey = currentQ?.code ? ANSWERS_KEY_PREFIX + currentQ.code : null;
  const [data, setData] = usePersistentState<Record<string, unknown>>(answersKey, {});
  const [showPayload, setShowPayload] = useState(false);
  const [customerId, setCustomerId] = usePersistentState(CUSTOMER_ID_KEY, 'demo-customer-001');
  const [copied, setCopied] = useState('');

  const copy = (text: string, tag: string) => {
    navigator.clipboard?.writeText(text).then(
      () => {
        setCopied(tag);
        setTimeout(() => setCopied(''), 1500);
      },
      () => {},
    );
  };

  const survey = useMemo(() => {
    if (!schema || !hasQuestions) return null;
    const m = new Model(schema);
    m.showNavigationButtons = false;
    m.showCompleteButton = false;
    m.showProgressBar = 'off';
    m.questionsOnPageMode = 'singlePage';
    m.applyTheme(XG_SURVEY_THEME as never);
    // Yes/No as radiogroup: the toggle-switch reads scrollWidth on an unmounted
    // node in survey-core 3.x and throws on every re-render.
    m.getAllQuestions().forEach((q) => {
      if (q.getType() === 'boolean') (q as { renderAs: string }).renderAs = 'radio';
    });
    const saved = answersKey ? readPersisted<Record<string, unknown>>(answersKey) : undefined;
    if (saved) m.data = saved;
    return m;
  }, [schema, hasQuestions, answersKey]);

  useEffect(() => {
    // Mirror whatever the new survey starts with — its restored answers, or
    // nothing — so the preview and payload match what the form shows.
    setData({ ...((survey?.data as Record<string, unknown>) ?? {}) });
    if (!survey) return;
    const onValue = (sender: Model) => setData({ ...(sender.data as object) });
    survey.onValueChanged.add(onValue);
    return () => survey.onValueChanged.remove(onValue);
  }, [survey, setData]);

  const core = useMemo(
    () =>
      schema
        ? buildScoreRequest(schema, data)
        : { answer_list: [], customer_condition: {}, dimensions: [] },
    [schema, data],
  );

  // Friendly preview — the aggregation the Score Engine would apply.
  const results = core.dimensions.map((d) => ({
    dc: d.key,
    method: d.calculation_method as CalculationMethod,
    scores: d.answers,
    value: Math.round(applyCalculationMethod(d.answers, d.calculation_method) * 100) / 100,
  }));

  // The request body a client POSTs to Submit Answers
  // (POST /v1/survey/:code/evaluate). This is what you paste into the API workbench.
  const submitBody = {
    brand_id: 'wardah',
    application_id: 'skinverse',
    customer_id: customerId,
    data,
  };
  const submitBodyJson = JSON.stringify(submitBody, null, 2);

  // Exact ScoreModuleRequest the Form Engine then forwards to the Score Engine.
  const payload = {
    code: currentQ?.code,
    brand_id: 'wardah',
    application_id: 'skinverse',
    answer_list: core.answer_list,
    customer_condition: core.customer_condition,
    dimensions: core.dimensions,
    vision_signals: {},
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Answers */}
      <div className="lg:col-span-7 space-y-3">
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <label className="block space-y-1">
            <span className="text-muted-foreground text-xs font-semibold">Questionnaire</span>
            <select
              value={selectedQCode}
              onChange={(e) => setSelectedQCode(e.target.value)}
              className="w-full h-9 rounded-md bg-muted/40 border border-border px-3 text-foreground text-xs outline-none focus:border-ring"
              style={{ colorScheme: 'dark' }}
            >
              {questionnaires.map((q) => (
                <option
                  key={q.code}
                  value={q.code}
                  style={{ backgroundColor: 'var(--popover)', color: 'var(--popover-foreground)' }}
                >
                  {q.name}
                </option>
              ))}
            </select>
          </label>

          {!survey ? (
            <p className="text-muted-foreground text-xs py-6 text-center">
              This questionnaire has no questions configured.
            </p>
          ) : (
            <Survey model={survey} />
          )}
        </div>
      </div>

      {/* Final score per dimension */}
      <div className="lg:col-span-5 space-y-3">
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-foreground text-sm font-bold">Score per dimension</h3>
            <span className="text-[11px] text-muted-foreground">Form Engine output</span>
          </div>

          {results.length === 0 ? (
            <EmptyState
              icon={<Play className="h-5 w-5 text-muted-foreground" />}
              title="Nothing to calculate yet"
              description="Answer a question to see its dimension score."
              className="py-10"
            />
          ) : (
            <div className="space-y-2">
              {results.map((r) => {
                const methodLabel =
                  CALCULATION_METHODS.find((m) => m.value === r.method)?.label || r.method;
                return (
                  <div key={r.dc} className="rounded-md border border-border bg-muted/20 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">
                        {getDimensionMeta(r.dc).label}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        {methodLabel}
                      </span>
                    </div>
                    <div className="mt-1 flex items-baseline justify-between">
                      <span className="text-lg font-black text-beak font-mono">{r.value}</span>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        [{r.scores.join(', ')}] → {r.method}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Submit Answers request body — paste straight into the API workbench */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-foreground text-sm font-bold">Submit Answers body</h3>
              <p className="text-[11px] text-muted-foreground truncate">
                POST <span className="font-mono">/v1/survey/{currentQ?.code}/evaluate</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => copy(submitBodyJson, 'submit')}
              className="h-7 shrink-0 rounded-md border border-beak/40 bg-beak/10 px-2.5 text-[11px] font-semibold text-beak hover:bg-beak/20"
            >
              {copied === 'submit' ? 'Copied' : 'Copy body'}
            </button>
          </div>
          <label className="flex items-center gap-2 text-[11px] text-muted-foreground">
            customer_id
            <input
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="h-7 flex-1 rounded-md bg-muted/40 border border-border px-2 text-foreground font-mono outline-none focus:border-ring"
            />
          </label>
          <pre className="max-h-56 overflow-auto rounded-md bg-muted/40 border border-border p-2.5 text-[11px] text-foreground font-mono leading-relaxed whitespace-pre">
            {submitBodyJson}
          </pre>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <button
            type="button"
            onClick={() => setShowPayload((v) => !v)}
            className="flex w-full items-center justify-between gap-2 px-4 py-3 text-xs font-bold text-foreground"
          >
            <span>Internal: forwarded to Score Engine</span>
            {showPayload ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          {showPayload && (
            <pre className="border-t border-border px-4 py-3 text-[11px] text-muted-foreground whitespace-pre-wrap break-all font-mono leading-relaxed">
              {JSON.stringify(payload, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};
