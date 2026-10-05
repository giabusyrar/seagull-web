'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import 'survey-core/survey-core.css';
import 'survey-core/i18n/indonesian';
import plainLight from 'survey-core/themes/plain-light-panelless';

import { readPersisted, writePersisted } from '@gateway-experience/shared';
import { useBrand } from '../../lib/brand';
import { useIntake, answersKey } from '../../lib/intake';
import { useLang } from '../../lib/i18n';
import { answerAsText } from '../../lib/conversation';
import { surveySchema, type SurveyRow } from '../../lib/form';
import { useSurveys } from '../form/useSurveys';
import { useFlowSurveys } from '../conversation/useFlowSurveys';
import { btnGhost, btnPrimary, btnSecondary, card, cardPad, eyebrow, field, pageSub, pageTitle } from '../ui';

/** The simulator's accent (rose-500 / rose-600), on SurveyJS 3's brand variables (blue by default). */
const SURVEY_ACCENT: Record<string, string> = {
  '--sjs2-color-project-brand-600': 'rgba(244, 63, 94, 1)',
  '--sjs2-color-bg-brand-primary-dim': 'rgba(225, 29, 72, 1)',
  '--sjs2-color-bg-brand-secondary': 'rgba(244, 63, 94, 0.1)',
};

/** Debounce for telling the advisor about a form edit, so ticking several boxes sends one answer. */
const SYNC_DELAY_MS = 1200;

/** Which question is open, so a reload reopens it. */
const openKey = (code: string) => `sim.intake.open.${code}`;

/** Required questions still empty: what stands between the form and the next step. */
function missingRequired(m: Model): number {
  return m.getAllQuestions().filter((q) => q.isVisible && q.isRequired && q.isEmpty()).length;
}

function SurveyPicker({ rows, value, onChange, loading, error, ready, flowCodes }: {
  rows: SurveyRow[]; value: string; onChange(code: string): void; loading: boolean; error: string | null; ready: boolean; flowCodes: Set<string> | null;
}) {
  const { t } = useLang();
  return (
    <div className="flex flex-col gap-1.5">
      <select aria-label={t('Form', 'Form')} className={`${field} h-10 w-full text-sm`} value={value} onChange={(e) => onChange(e.target.value)} disabled={!ready || loading || rows.length === 0}>
        <option value="">{!ready ? t('Choose brand & application first (top)', 'Pilih brand & aplikasi dulu (atas)') : loading ? t('Loading forms…', 'Memuat form…') : rows.length ? t('Choose a form', 'Pilih form') : t('No active form', 'Tidak ada form aktif')}</option>
        {rows.map((r) => (
          <option key={r.code} value={r.code}>{r.title || r.code}{flowCodes && !flowCodes.has(r.code) ? ` (${t('form only', 'form saja')})` : ''}</option>
        ))}
      </select>
      {error && <span className="text-xs text-red-700">{error}</span>}
    </div>
  );
}

/**
 * Step 1: the brand's questionnaire, answered on the form, by talking with
 * the advisor, or both at once. Form edits are told to the advisor; answers
 * the advisor records come back into the form (with an engine that reports
 * them, see lib/conversation answersSupported).
 */
/** `active`: this step is on screen, so the advisor is told which question is open. */
export function IntakeStep({ active, onContinue, onSkip }: { active: boolean; onContinue(): void; onSkip(): void }) {
  const { t, lang } = useLang();
  const brand = useBrand();
  const intake = useIntake();
  const { code, setCode, conv } = intake;
  const surveys = useSurveys(brand);
  const flows = useFlowSurveys(brand);
  const row = surveys.rows.find((r) => r.code === code);
  const schema = useMemo(() => surveySchema(row), [row]);
  const [missing, setMissing] = useState(0);
  const applying = useRef(false);
  const pending = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  /** Form edits made while no socket was open; sent when the advisor is connected again. */
  const unsent = useRef(new Set<string>());

  const survey = useMemo(() => {
    if (!schema) return null;
    const m = new Model(schema);
    // SurveyJS's plain theme with the simulator's accent.
    m.applyTheme({ ...plainLight, cssVariables: { ...plainLight.cssVariables, ...SURVEY_ACCENT } } as never);
    m.locale = lang;
    m.showCompleteButton = false;
    m.showCompletedPage = false;
    // One question at a time; the advisor follows the open one (see the view effect below).
    m.questionsOnPageMode = 'questionPerPage';
    m.showProgressBar = true;
    m.progressBarLocation = 'top';
    // Yes/No as radio: the toggle switch throws on re-render in survey-core 3.x (as in studio's QuestionnaireRunner).
    m.getAllQuestions().forEach((q) => { if (q.getType() === 'boolean') (q as { renderAs: string }).renderAs = 'radio'; });
    const saved = readPersisted<Record<string, unknown>>(answersKey(code));
    if (saved) m.data = saved;
    const at = readPersisted<string>(openKey(code));
    if (at && m.getQuestionByName(at)?.isVisible) m.currentElementName = at;
    return m;
  }, [schema, code, lang]);

  const { sendAnswer, sendView, sendAction } = conv;

  // The open question: remembered for a reload, and while this step is on screen the advisor
  // is told about it (on arrival, and each time another question opens).
  useEffect(() => {
    if (!survey) return;
    const tell = () => { if (active) sendView({ screen: 'questionnaire', question: survey.currentElementName || undefined }); };
    tell();
    const onOpen = (sender: Model) => {
      const name = sender.currentElementName;
      if (name) writePersisted(openKey(code), name);
      tell();
    };
    survey.onCurrentPageChanged.add(onOpen);
    return () => survey.onCurrentPageChanged.remove(onOpen);
  }, [survey, code, active, sendView]);
  useEffect(() => { if (active && !survey) sendView({ screen: 'questionnaire' }); }, [active, survey, sendView]);
  // Save every change; tell the advisor about the customer's own edits.
  useEffect(() => {
    if (!survey) return;
    const timers = pending.current;
    queueMicrotask(() => setMissing(missingRequired(survey)));
    const onValue = (sender: Model, opt: { name: string }) => {
      writePersisted(answersKey(code), sender.data);
      setMissing(missingRequired(sender));
      if (applying.current) return;
      const q = sender.getQuestionByName(opt.name);
      clearTimeout(timers.get(opt.name));
      timers.set(opt.name, setTimeout(() => {
        timers.delete(opt.name);
        const value = sender.getValue(opt.name);
        if (value === undefined) return;
        if (sendAnswer(opt.name, value, answerAsText(q?.title ?? opt.name, String(q?.displayValue ?? value), lang))) unsent.current.delete(opt.name);
        else unsent.current.add(opt.name);
      }, SYNC_DELAY_MS));
    };
    survey.onValueChanged.add(onValue);
    return () => { survey.onValueChanged.remove(onValue); timers.forEach(clearTimeout); timers.clear(); };
  }, [survey, code, sendAnswer, lang]);

  // Each time the advisor is connected: a new session hears everything the form already holds;
  // a resumed one (its history already has the earlier answers) hears only the edits made while
  // it was away. Pending debounced edits are folded in, so nothing is told twice.
  const briefedConn = useRef(false);
  const sessionId = conv.session?.id ?? null;
  const connReady = conv.conn === 'ready';
  useEffect(() => {
    if (!connReady) { briefedConn.current = false; return; }
    if (!survey || !sessionId || briefedConn.current) return;
    briefedConn.current = true;
    const fresh = conv.live.turns.length === 0;
    pending.current.forEach((timer, name) => { clearTimeout(timer); unsent.current.add(name); });
    pending.current.clear();
    const due = survey.getAllQuestions().filter((q) => q.isVisible && !q.isEmpty() && (fresh || unsent.current.has(q.name)));
    unsent.current.clear();
    if (!due.length) return;
    if (conv.live.progress.answers !== undefined) {
      due.forEach((q) => sendAnswer(q.name, q.value, ''));
    } else {
      const lines = due.map((q) => `${q.title}: ${String(q.displayValue ?? q.value)}`).join('; ');
      conv.sendText(answerAsText(fresh ? t('Already answered', 'Sudah dijawab') : t('Changed while paused', 'Diubah saat jeda'), lines, lang));
    }
  }, [survey, connReady, sessionId, conv, sendAnswer, t, lang]);

  // Answers the advisor recorded flow into the form.
  const engineAnswers = conv.live.progress.answers;
  useEffect(() => {
    if (!survey || !engineAnswers) return;
    applying.current = true;
    try {
      let answeredOpen = false;
      for (const [k, v] of Object.entries(engineAnswers)) {
        if (JSON.stringify(survey.getValue(k)) !== JSON.stringify(v)) {
          survey.setValue(k, v);
          if (k === survey.currentElementName) answeredOpen = true;
        }
      }
      // The advisor answered what is on screen: follow it to the next open question.
      if (answeredOpen) {
        const next = survey.getAllQuestions().find((q) => q.isVisible && q.isEmpty());
        if (next) survey.currentElementName = next.name;
      }
    } finally {
      applying.current = false;
    }
  }, [survey, engineAnswers]);

  const convDone = typeof conv.live.progress.visibleTotal === 'number' && conv.live.progress.visibleTotal > 0 && conv.live.progress.answered === conv.live.progress.visibleTotal;
  const ready = !!survey && (missing === 0 || convDone);
  const reset = async () => {
    if (!window.confirm(t('Reset the questionnaire? The answers and the advisor session are cleared.', 'Reset kuesioner? Jawaban dan sesi advisor dihapus.'))) return;
    await intake.resetIntake();
  };

  return (
    <section className="flex w-full flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className={pageTitle}>{t('Questionnaire', 'Kuesioner')}</h1>
          <p className={pageSub}>{t('Fill in the form, talk it through with the advisor, or both — answers stay in sync.', 'Isi form, ngobrol dengan advisor, atau keduanya — jawaban tetap sinkron.')}</p>
        </div>
        <div className="flex w-full flex-col gap-1 sm:w-80">
          <span className={eyebrow}>{t('Form', 'Form')}</span>
          <SurveyPicker rows={surveys.rows} value={code} onChange={setCode} loading={surveys.loading} error={surveys.error} ready={surveys.ready} flowCodes={flows.codes} />
        </div>
      </div>

      {!code || !row ? (
        <div className={`${cardPad} py-14 text-center text-sm text-zinc-500`}>
          {code && !surveys.loading ? t('This form is not available for this brand/application.', 'Form ini tidak tersedia untuk brand/aplikasi ini.') : t('Choose a form to start.', 'Pilih form untuk mulai.')}
        </div>
      ) : !schema ? (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-900">{t('The form schema could not be read.', 'Skema form tidak bisa dibaca.')} ({row.code})</p>
      ) : (
        <div className={`${card} overflow-hidden p-2`}>
          {survey && <Survey key={`${code}-${lang}`} model={survey} />}
        </div>
      )}

      <div className={`${cardPad} flex flex-wrap items-center justify-between gap-3`}>
        <div className="flex flex-wrap items-center gap-3">
          {(code || conv.session) && <button type="button" className={btnGhost} onClick={reset}>{t('Reset questionnaire', 'Reset kuesioner')}</button>}
        </div>
        <div className="flex items-center gap-2">
          {!ready && survey && <span className="text-xs text-zinc-500">{missing} {t('required question(s) left', 'pertanyaan wajib tersisa')}</span>}
          <button type="button" className={btnSecondary} onClick={() => { sendAction('skip_questionnaire', survey?.currentElementName || undefined); onSkip(); }}>{t('Skip', 'Lewati')}</button>
          <button type="button" className={btnPrimary} disabled={!ready} onClick={() => { sendAction('continue_to_photo'); onContinue(); }}>{t('Continue to photo', 'Lanjut ke foto')} →</button>
        </div>
      </div>
    </section>
  );
}
