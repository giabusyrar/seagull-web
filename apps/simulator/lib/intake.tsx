'use client';
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { readPersisted, usePersistentState, writePersisted } from '@gateway-experience/shared';
import { useLiveConversation } from '@/components/conversation/useLiveConversation';
import { call } from './http';
import { evaluateSurvey, type Respondent } from './form';
import { photoRequested } from './conversation';
import type { Brand } from './photo';
import { IDLE, type TabState } from '@/components/photo/TabShell';

/** Who the simulator submits as by default: a test identity, named so it cannot pass for a real customer. */
export const TEST_RESPONDENT: Respondent = { customerId: 'sim-customer', consentDataProcessing: false, consentMarketing: false };

export const answersKey = (code: string) => `sim.form.answers.${code}`;

/**
 * The intake step's state, shared with the photo and results steps: the
 * chosen survey, the respondent, the live conversation (one per page, so a
 * session keeps running across steps) and the form's own evaluation.
 */
function useIntakeState() {
  const [code, setCode] = usePersistentState<string>('sim.intake.survey', '');
  const [who, setWho] = usePersistentState<Respondent>('sim.form.respondent', TEST_RESPONDENT);
  const [evaluation, setEvaluation] = useState<TabState>(IDLE);
  const conv = useLiveConversation();

  /**
   * Called when the photo is analysed. A conversation that asked for a photo
   * gets it, and the advisor submits the form itself; otherwise the form's
   * answers are scored directly. A conversation that is still under way
   * submits on its own later, so nothing is scored twice.
   */
  const submitWithPhoto = useCallback(async (front: File, brand: Brand) => {
    if (conv.session && conv.conn === 'ready' && photoRequested(conv.live)) {
      await conv.sendPhoto(front);
      return;
    }
    if (conv.session && conv.live.turns.length > 0) return;
    const data = code ? readPersisted<Record<string, unknown>>(answersKey(code)) : undefined;
    if (!code || !data || Object.keys(data).length === 0) return;
    setEvaluation({ loading: true });
    try {
      // The customer has no id of their own in the simulator: always the fixed test id.
      setEvaluation({ loading: false, result: await call(evaluateSurvey(code, brand, data, { ...who, customerId: TEST_RESPONDENT.customerId })) });
    } catch (e) {
      setEvaluation({ loading: false, error: e instanceof Error ? e.message : String(e) });
    }
  }, [code, conv, who]);

  /** Forgets the chosen survey, its answers, the evaluation and the conversation. */
  const resetIntake = useCallback(async () => {
    if (code) writePersisted(answersKey(code), undefined);
    setCode('');
    setEvaluation(IDLE);
    await conv.reset();
  }, [code, conv, setCode]);

  return { code, setCode, who, setWho, evaluation, setEvaluation, conv, submitWithPhoto, resetIntake };
}

type Intake = ReturnType<typeof useIntakeState>;
const IntakeCtx = createContext<Intake | null>(null);

export function IntakeProvider({ children }: { children: ReactNode }) {
  return <IntakeCtx.Provider value={useIntakeState()}>{children}</IntakeCtx.Provider>;
}

export function useIntake(): Intake {
  const c = useContext(IntakeCtx);
  if (!c) throw new Error('useIntake needs an <IntakeProvider>.');
  return c;
}
