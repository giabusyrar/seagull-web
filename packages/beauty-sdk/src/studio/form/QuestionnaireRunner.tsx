'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import type { CalculationMethod, QuestionnaireItem } from './types';
import { applyCalculationMethod } from './catalog';
import { getQuestionnaireModel } from './api';
import {
  type SurveyJSModel,
  scoreSurveyAnswers,
  toSurveyModel,
} from './surveyjs';
import { XG_SURVEY_THEME } from './survey-theme';

/**
 * QuestionnaireRunner — consumer-facing, embeddable questionnaire.
 *
 * Renders a SurveyJS form from a stored schema, so every SurveyJS question type
 * is available. On completion it computes the per-dimension scores client-side
 * (from the `score` / `dimension` props carried on the schema) and hands the
 * parent a payload. Respondents never see scores.
 *
 * `customerId` is opaque and only forwarded into the payload — the seam where a
 * pForm customer id will be threaded through later.
 *
 * The consumer app must load SurveyJS styles once, e.g.
 * `import 'survey-core/survey-core.css'` at the page/layout level.
 */

export interface RunnerDimensionScore {
  code: string;
  calculation_method: CalculationMethod;
  score: number;
  raw_scores: number[];
}

/** One entry of SurveyJS's canonical result export (survey.getPlainData()). */
export interface RunnerPlainDatum {
  name: string;
  title: string;
  value: unknown;
  displayValue: unknown;
}

export interface QuestionnaireRunnerPayload {
  questionnaire_code: string;
  customer_id?: string;
  source: 'questionnaire';
  brand_id?: string;
  application_id?: string;
  /** SurveyJS answer data: questionName -> value (or value[]). */
  answers: Record<string, unknown>;
  /** SurveyJS canonical export: name / title / value / displayValue per question. */
  plain_data: RunnerPlainDatum[];
  dimensions: RunnerDimensionScore[];
  completed_at: string;
}

export interface QuestionnaireRunnerProps {
  /** `code` of the questionnaire to run. Ignored when `model` is supplied. */
  questionnaireCode: string;
  /** Pre-loaded SurveyJS model; skips the network fetch. */
  model?: SurveyJSModel;
  /** Pre-loaded builder item; converted to a SurveyJS model. */
  questionnaire?: QuestionnaireItem;
  /** Opaque customer id (supplied by the integrating client), forwarded verbatim into the payload. */
  customerId?: string;
  brandId?: string;
  applicationId?: string;
  /** Fired once, with the computed payload, when the respondent submits. */
  onComplete: (payload: QuestionnaireRunnerPayload) => void | Promise<void>;
  /** Fired on every answer change. */
  onAnswer?: (questionName: string, value: unknown) => void;
  /** Rendered after submit instead of the built-in confirmation. */
  renderComplete?: (payload: QuestionnaireRunnerPayload) => React.ReactNode;
  className?: string;
}

function computeDimensions(
  schema: SurveyJSModel,
  data: Record<string, unknown>
): RunnerDimensionScore[] {
  const byDimension = scoreSurveyAnswers(schema, data);
  const methods = schema.calculation_methods || {};
  return Object.entries(byDimension).map(([code, raw]) => {
    const method: CalculationMethod = methods[code] || 'sum';
    return {
      code,
      calculation_method: method,
      score: Math.round(applyCalculationMethod(raw, method) * 100) / 100,
      raw_scores: raw,
    };
  });
}

export const QuestionnaireRunner: React.FC<QuestionnaireRunnerProps> = ({
  questionnaireCode,
  model: modelProp,
  questionnaire,
  customerId,
  brandId,
  applicationId,
  onComplete,
  onAnswer,
  renderComplete,
  className = '',
}) => {
  const initialSchema = modelProp
    ? modelProp
    : questionnaire
    ? toSurveyModel(questionnaire)
    : null;

  const [schema, setSchema] = useState<SurveyJSModel | null>(initialSchema);
  const [loading, setLoading] = useState(!initialSchema);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<QuestionnaireRunnerPayload | null>(null);

  useEffect(() => {
    if (initialSchema) {
      setSchema(initialSchema);
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    setError(null);
    getQuestionnaireModel(questionnaireCode)
      .then((m) => {
        if (!alive) return;
        if (m) setSchema(m);
        else setError('This questionnaire is not available.');
      })
      .catch(() => alive && setError('Could not load the questionnaire.'))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [questionnaireCode, modelProp, questionnaire]);

  const survey = useMemo(() => {
    if (!schema) return null;
    const m = new Model(schema);
    m.showCompletedPage = false;
    m.applyTheme(XG_SURVEY_THEME as never);
    // Yes/No as radiogroup: the toggle-switch reads scrollWidth on an unmounted
    // node in survey-core 3.x and throws on every re-render.
    m.getAllQuestions().forEach((q) => {
      if (q.getType() === 'boolean') (q as { renderAs: string }).renderAs = 'radio';
    });
    return m;
  }, [schema]);

  useEffect(() => {
    if (!survey || !schema) return;

    const onValue = (_: unknown, opt: { name: string; value: unknown }) =>
      onAnswer?.(opt.name, opt.value);

    const onComplete_ = async (sender: Model) => {
      const data = sender.data as Record<string, unknown>;
      let plain: RunnerPlainDatum[] = [];
      try {
        plain = (sender.getPlainData?.() as RunnerPlainDatum[]) ?? [];
      } catch {
        plain = [];
      }
      const result: QuestionnaireRunnerPayload = {
        questionnaire_code: schema.code || questionnaireCode,
        customer_id: customerId,
        source: 'questionnaire',
        brand_id: brandId,
        application_id: applicationId,
        answers: data,
        plain_data: plain,
        dimensions: computeDimensions(schema, data),
        completed_at: new Date().toISOString(),
      };
      try {
        await onComplete(result);
      } finally {
        setPayload(result);
      }
    };

    survey.onValueChanged.add(onValue);
    survey.onComplete.add(onComplete_);
    return () => {
      survey.onValueChanged.remove(onValue);
      survey.onComplete.remove(onComplete_);
    };
  }, [survey, schema, customerId, brandId, applicationId]);

  const shell = `w-full max-w-2xl mx-auto text-foreground ${className}`;

  if (loading) {
    return (
      <div className={shell}>
        <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          Loading…
        </div>
      </div>
    );
  }

  if (error || !survey) {
    return (
      <div className={shell}>
        <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          {error || 'This questionnaire is not available.'}
        </div>
      </div>
    );
  }

  if (payload) {
    return (
      <div className={shell}>
        {renderComplete ? (
          <>{renderComplete(payload)}</>
        ) : (
          <div className="rounded-xl border border-border bg-card p-8 text-center space-y-2">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-beak/15 text-beak text-xl">
              ✓
            </div>
            <p className="text-sm font-semibold">Thanks — your answers are in.</p>
            <p className="text-xs text-muted-foreground">You can close this window now.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={shell}>
      <Survey model={survey} />
    </div>
  );
};