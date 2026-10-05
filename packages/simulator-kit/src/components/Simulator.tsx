'use client';
import { accentGradient, card } from './ui';
import { useCallback, useEffect, useState } from 'react';
import { usePersistentState } from '@gateway-experience/shared';
import { useBrand } from '../lib/brand';
import { useLang } from '../lib/i18n';
import { IntakeProvider, useIntake } from '../lib/intake';
import type { EvaluationOutput } from '../lib/types/form';
import { IntakeStep } from './intake/IntakeStep';
import { CustomerStep } from './intake/CustomerStep';
import { AdvisorDock } from './conversation/AdvisorDock';
import { PhotoSimulator, type ExtraTab, type PhotoPhase } from './photo/PhotoSimulator';
import { TabShell } from './photo/TabShell';
import { EvaluationResult } from './form/EvaluationResult';
import { MatchResult, type MatchOutput } from './conversation/parts';
import { useSurveys } from './form/useSurveys';

type View = 'customer' | 'intake' | 'photo';
type StepId = 'customer' | 'intake' | 'photo' | 'results';

function Stepper({ steps, at, onPick }: { steps: { id: StepId; label: string; enabled: boolean }[]; at: number; onPick(id: StepId): void }) {
  return (
    <ol className={`${card} flex items-center gap-1 p-1.5`}>
      {steps.map((s, i) => (
        <li key={s.id} className="flex min-w-0 flex-1 items-center gap-1">
          <button type="button" disabled={!s.enabled} onClick={() => onPick(s.id)} aria-current={i === at ? 'step' : undefined}
            className={`flex min-w-0 flex-1 items-center justify-center gap-2 rounded-2xl px-2 py-2.5 text-sm transition-all disabled:cursor-not-allowed ${
              i === at ? `${accentGradient} font-semibold text-white shadow-md shadow-rose-500/25` : s.enabled ? 'text-zinc-700 hover:bg-zinc-50' : 'text-zinc-400'}`}>
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
              i === at ? 'bg-white/25 text-white' : i < at ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-200' : 'bg-zinc-100 text-zinc-400'}`}>{i < at ? '✓' : i + 1}</span>
            <span className="truncate max-sm:hidden">{s.label}</span>
          </button>
          {i < steps.length - 1 && <span className={`h-0.5 w-3 shrink-0 rounded-full sm:w-6 ${i < at ? 'bg-rose-300' : 'bg-zinc-200'}`} />}
        </li>
      ))}
    </ol>
  );
}

function Flow() {
  const { t } = useLang();
  const brand = useBrand();
  const intake = useIntake();
  const surveys = useSurveys(brand);
  const [view, setView] = usePersistentState<View>('sim.view', 'customer');
  const [phase, setPhase] = useState<PhotoPhase>('capture');
  const [dockOpen, setDockOpen] = useState(false);
  // No forms for this brand/application: the questionnaire step does not apply. Only a
  // settled answer counts, and the user's chosen step is left alone so a brand with
  // forms gets its questionnaire back.
  const noForms = surveys.ready && !surveys.loading && !surveys.error && surveys.rows.length === 0;
  const hasForms = !noForms;
  const effectiveView: View = !hasForms && view === 'intake' ? 'photo' : view;
  const named = !!intake.who.fullName?.trim();

  const step: StepId = effectiveView === 'customer' ? 'customer' : effectiveView === 'intake' ? 'intake' : phase === 'result' ? 'results' : 'photo';
  const steps = [
    { id: 'customer' as const, label: t('Customer', 'Pelanggan'), enabled: true },
    ...(hasForms ? [{ id: 'intake' as const, label: t('Questionnaire', 'Kuesioner'), enabled: named }] : []),
    { id: 'photo' as const, label: t('Photo', 'Foto'), enabled: named },
    { id: 'results' as const, label: t('Results', 'Hasil'), enabled: phase === 'result' },
  ];
  const pick = (id: StepId) => setView(id === 'customer' ? 'customer' : id === 'intake' ? 'intake' : 'photo');
  const onPhase = useCallback((p: PhotoPhase) => setPhase(p), []);
  const { sendView, sendAction } = intake.conv;
  // The advisor follows the customer through the steps; the questionnaire reports its own open question.
  useEffect(() => { if (step !== 'intake') sendView({ screen: step }); }, [step, sendView]);
  const onAnalyze = useCallback(async (front: File, b: typeof brand) => {
    sendAction('photo_analysed');
    await intake.submitWithPhoto(front, b);
  }, [intake, sendAction]);

  // Results from the questionnaire: the advisor's submission, else the form's own evaluation.
  const convScore = intake.conv.live.results.score as EvaluationOutput | undefined;
  const convMatch = intake.conv.live.results.match as MatchOutput | undefined;
  const advisorPending = !!intake.conv.session && intake.conv.live.turns.length > 0 && !convScore;
  const assessment: ExtraTab = {
    id: 'assessment',
    label: t('Assessment', 'Penilaian'),
    state: convScore ? 'ok' : intake.evaluation.loading || advisorPending ? 'loading'
      : intake.evaluation.error || (intake.evaluation.result && !intake.evaluation.result.ok) ? 'error'
      : intake.evaluation.result ? 'ok' : 'idle',
    render: () => convScore ? <EvaluationResult r={convScore} />
      : intake.evaluation.result || intake.evaluation.loading || intake.evaluation.error
        ? <TabShell state={intake.evaluation}>{(json) => <EvaluationResult r={(json ?? {}) as EvaluationOutput} />}</TabShell>
        : <p className="py-10 text-center text-sm text-zinc-500">
            {advisorPending
              ? t('Waiting for the advisor to submit the questionnaire…', 'Menunggu advisor mengirim kuesioner…')
              : t('No questionnaire answered for this run.', 'Belum ada kuesioner yang dijawab untuk analisis ini.')}
          </p>,
  };
  const recommendation: ExtraTab = {
    id: 'recommendation',
    label: t('Recommendation', 'Rekomendasi'),
    state: convMatch ? 'ok' : advisorPending ? 'loading' : 'idle',
    render: () => convMatch ? <MatchResult r={convMatch} /> : (
      <p className="py-10 text-center text-sm text-zinc-500">{t('Recommendations come from the advisor conversation in the questionnaire step.', 'Rekomendasi datang dari obrolan dengan advisor di langkah kuesioner.')}</p>
    ),
  };

  return (
    <div className={`flex flex-col gap-6 transition-[padding] ${dockOpen ? 'lg:pr-[420px]' : ''}`}>
      <AdvisorDock onGoPhoto={() => setView('photo')} onOpenChange={setDockOpen} />
      <Stepper steps={steps} at={steps.findIndex((s) => s.id === step)} onPick={pick} />
      <div hidden={effectiveView !== 'customer'}>
        <CustomerStep onContinue={() => setView(hasForms ? 'intake' : 'photo')} />
      </div>
      {hasForms && (
        <div hidden={effectiveView !== 'intake'}>
          <IntakeStep active={effectiveView === 'intake'} onContinue={() => setView('photo')} onSkip={() => setView('photo')} />
        </div>
      )}
      <div hidden={effectiveView !== 'photo'}>
        <PhotoSimulator onPhase={onPhase} onAnalyze={onAnalyze} before={[assessment]} after={[recommendation]} />
      </div>
    </div>
  );
}

/** Questionnaire → photo → results, in one flow. */
export function Simulator() {
  return (
    <IntakeProvider>
      <Flow />
    </IntakeProvider>
  );
}
