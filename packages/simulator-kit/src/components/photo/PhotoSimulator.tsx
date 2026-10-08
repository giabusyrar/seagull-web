'use client';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useBrand } from '../../lib/brand';
import { usePhotos } from '../../lib/photos';
import { useLang } from '../../lib/i18n';
import { usePersistentState } from '@gateway-experience/shared';
import { useBlobUrl } from '../../lib/blob';
import { call } from '../../lib/http';
import { analyzeColour, faceArchitecture, faceHead, skinAnalyze, toggleShade, uvAnalyze, type Brand, type BuiltRequest, type Selection } from '../../lib/photo';
import { FrontPicker, PhotoTips, Questions, SideShots, UvShot, type YesNo } from './PhotoInput';
import { UvTab } from './UvTab';
import { PhotoStage } from './PhotoStage';
import type { Annotations } from './PhotoAnnotations';
import { FRONT_ANGLE, acneMarks, faceMarks, skinZoneBoxes, type SkinFocus } from '../../lib/annotations';
import type { FaceArchitectureResult } from '../../lib/types/face';
import type { VisionAnalysisResult } from '../../lib/types/skin';
import { ColourTab } from './ColourTab';
import { FaceTab, traitFocus } from './FaceTab';
import { SkinTab, skinView } from './SkinTab';
import { IDLE, humanize, type TabState } from './TabShell';
import { useTryOn } from './useTryOn';
import { btnPrimarySm, card, cardPad, pageSub, pageTitle } from '../ui';

export type PhotoPhase = 'capture' | 'questions' | 'result';

/** A results tab supplied by the flow (assessment, recommendation), shown beside the photo tabs. */
export interface ExtraTab { id: string; label: string; state: 'idle' | 'loading' | 'ok' | 'error'; render(): ReactNode }

const LOADING: TabState = { loading: true };
const stateOf = (s: TabState): ExtraTab['state'] => (s.loading ? 'loading' : s.error || (s.result && !s.result.ok) ? 'error' : s.result ? 'ok' : 'idle');
const DOT: Record<ExtraTab['state'], string> = { loading: 'bg-zinc-400 animate-pulse', error: 'bg-red-500', ok: 'bg-emerald-500', idle: 'bg-zinc-200' };

/**
 * Steps 2 and 3: the photo (front required, sides optional), two questions,
 * then the combined results. `onAnalyze` lets the flow submit the
 * questionnaire with the same photo; `before`/`after` add its result tabs.
 */
export function PhotoSimulator({ onPhase, onAnalyze, before = [], after = [] }: {
  onPhase?(p: PhotoPhase): void;
  onAnalyze?(front: File, brand: Brand): void;
  before?: ExtraTab[];
  after?: ExtraTab[];
}) {
  const { t } = useLang();
  const brand = useBrand();
  const [step, setStep] = useState<'input' | 'result'>('input');
  const { front, left, right, uv, setFront, setLeft, setRight, setUv } = usePhotos();
  const [hijab, setHijab] = usePersistentState<YesNo>('sim.photo.hijab', '');
  const [hair, setHair] = usePersistentState<YesNo>('sim.photo.hair', '');
  const [colour, setColour] = useState<TabState>(IDLE);
  const [face, setFace] = useState<TabState>(IDLE);
  const [skin, setSkin] = useState<TabState>(IDLE);
  const [uvState, setUvState] = useState<TabState>(IDLE);
  const [head, setHead] = useState<TabState>(IDLE);
  const [glbUrl, setGlbUrl] = useBlobUrl();
  const [selection, setSelection] = useState<Selection>({});
  const [tab, setTabState] = useState<string>('colour');
  // The trait whose measurements the photo is zoomed to; any tab change lets go of it.
  const [focusedTrait, setFocusedTrait] = useState<string | null>(null);
  // The skin metric or zone the photo shows; likewise let go of on a tab change.
  const [skinFocus, setSkinFocus] = useState<SkinFocus | null>(null);
  const setTab = (id: string) => { setTabState(id); setFocusedTrait(null); setSkinFocus(null); };
  const clearFocus = () => { setFocusedTrait(null); setSkinFocus(null); };
  const runId = useRef(0);
  const runAbort = useRef<AbortController | null>(null);
  const [analyzed, setAnalyzed] = useState<Brand | null>(null);
  const tryOn = useTryOn(front);

  const stopRun = () => { runId.current += 1; runAbort.current?.abort(); runAbort.current = null; };
  // Leaving the page aborts whatever is still in flight.
  useEffect(() => () => { runId.current += 1; runAbort.current?.abort(); }, []);

  const current: PhotoPhase = !front ? 'capture' : step === 'result' ? 'result' : 'questions';
  useEffect(() => { onPhase?.(current); }, [current, onPhase]);

  const analyze = async () => {
    if (!front) return;
    stopRun();
    const id = runId.current;
    const ac = new AbortController();
    runAbort.current = ac;
    const b = { brandId: brand.brandId, applicationId: brand.applicationId };
    const views = { front, left, right };
    setAnalyzed(b); setStep('result'); setTab(before[0]?.id ?? 'colour'); setSelection({}); tryOn.reset(); setGlbUrl(null);
    setColour(LOADING); setFace(LOADING); setSkin(LOADING); setHead(LOADING); setUvState(uv ? LOADING : IDLE);
    onAnalyze?.(front, b);

    // Each request sets only its own state; a later run or a retake makes it stale.
    const run = async (build: () => BuiltRequest, set: (s: TabState) => void, onOk?: (u?: string) => void) => {
      let st: TabState;
      try {
        const req = build();
        st = { loading: false, result: await call({ url: req.url, init: { ...req.init, signal: ac.signal } }) };
      } catch (e) {
        st = { loading: false, error: e instanceof Error ? e.message : String(e) };
      }
      if (id !== runId.current) { if (st.result?.blobUrl) URL.revokeObjectURL(st.result.blobUrl); return; }
      set(st);
      if (st.result?.ok) onOk?.(st.result.blobUrl);
    };
    await Promise.allSettled([
      run(() => analyzeColour(front, hijab === 'yes', hair === 'yes'), setColour),
      run(() => faceArchitecture(front, b), setFace),
      run(() => faceHead(views, b), setHead, (u) => { if (u) setGlbUrl(u); }),
      run(() => skinAnalyze(views, b), setSkin),
      // Only with a UV photo: the UV analysis reads fluorescence, not a normal photo.
      ...(uv ? [run(() => uvAnalyze(uv), setUvState)] : []),
    ]);
  };

  const retake = () => {
    stopRun(); tryOn.reset(); setGlbUrl(null); setSelection({});
    setColour(IDLE); setFace(IDLE); setSkin(IDLE); setHead(IDLE); setUvState(IDLE);
    setFront(null); setLeft(null); setRight(null); setUv(null); setHijab(''); setHair('');
    setAnalyzed(null); setStep('input');
  };

  const pick = (category: string, shadeId: string) => {
    const next = toggleShade(selection, category, shadeId);
    setSelection(next);
    tryOn.request(Object.values(next));
  };
  const clearShades = () => { setSelection({}); tryOn.request([]); };

  const brandReady = !!brand.brandId.trim() && !!brand.applicationId.trim();
  const brandChanged = !!analyzed && (analyzed.brandId !== brand.brandId || analyzed.applicationId !== brand.applicationId);
  const photoTabs: ExtraTab[] = [
    { id: 'colour', label: t('Colour', 'Warna'), state: stateOf(colour), render: () => <ColourTab state={colour} selection={selection} onToggle={pick} onClear={clearShades} tryOnState={{ loading: tryOn.loading, error: tryOn.error, startedAt: tryOn.startedAt }} /> },
    { id: 'face', label: t('Face', 'Wajah'), state: stateOf(face), render: () => <FaceTab state={face} focusedTrait={focusedTrait} onFocusTrait={setFocusedTrait} /> },
    { id: 'skin', label: t('Skin', 'Kulit'), state: stateOf(skin), render: () => <SkinTab state={skin} focus={skinFocus} onFocus={setSkinFocus} /> },
    // Shown once a UV photo was analysed with the rest.
    ...(uvState !== IDLE ? [{ id: 'uv', label: 'UV', state: stateOf(uvState), render: () => <UvTab state={uvState} /> }] : []),
  ];
  const tabs = [...before, ...photoTabs, ...after];
  const active = tabs.find((x) => x.id === tab) ?? tabs[0];
  const annotations = useMemo<Annotations | null>(() => {
    const json = (s: TabState) => (s.result?.ok ? s.result.json : undefined);
    if (active.id === 'face') {
      const r = json(face) as FaceArchitectureResult | undefined;
      const data = faceMarks(r);
      return data ? { kind: 'face', data, focus: traitFocus(r, focusedTrait) } : null;
    }
    if (active.id === 'skin') {
      const r = json(skin) as VisionAnalysisResult | undefined;
      const data = skinZoneBoxes(r, FRONT_ANGLE);
      const view = skinView(r, skinFocus, FRONT_ANGLE, (f) => (f.kind === 'metric' ? humanize(f.key) : f.kind === 'acne' ? t('Acne', 'Jerawat') : data.find((z) => z.code === f.code)?.name ?? f.code));
      const lesions = skinFocus?.kind === 'acne' ? { marks: acneMarks(r), mode: skinFocus.mode } : null;
      return data.length ? { kind: 'skin', data, view, lesions } : null;
    }
    return null;
  }, [active.id, face, skin, focusedTrait, skinFocus]);

  // Photo on the left; questions or results on the right (seagull-web's studio layout).
  return (
    <section className="flex w-full flex-col gap-5">
      <div>
        <h1 className={pageTitle}>{current === 'result' ? t('Results', 'Hasil') : t('Photo', 'Foto')}</h1>
        <p className={pageSub}>
          {current === 'result'
            ? <>{t('For', 'Untuk')} <span className="font-medium text-zinc-700">{analyzed?.brandId} / {analyzed?.applicationId}</span></>
            : t('Colour, face, skin and a 3D head from one photo.', 'Warna, wajah, kulit dan kepala 3D dari satu foto.')}
        </p>
      </div>
      {current === 'result' && brandChanged && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
          <span>{t('The brand changed', 'Brand berubah')} ({brand.brandId || '—'} / {brand.applicationId || '—'}); {t('the results below are still for', 'hasil di bawah masih untuk')} {analyzed?.brandId} / {analyzed?.applicationId}.</span>
          <button type="button" disabled={!brandReady} onClick={analyze} className={btnPrimarySm}>{t('Analyse again', 'Analisis ulang')}</button>
        </div>
      )}
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(320px,400px)_minmax(0,1fr)]">
        <div className={`${cardPad} flex flex-col gap-4 lg:sticky lg:top-20`}>
          {front
            ? <PhotoStage photo={front} tryOnUrl={tryOn.url} tryOnTiming={{ startedAt: tryOn.startedAt, lastMs: tryOn.lastMs }} head={head} glbUrl={glbUrl} onRetake={retake} canShow3d={current === 'result'} annotations={current === 'result' ? annotations : null} onClearFocus={clearFocus} />
            : <FrontPicker onChange={setFront} />}
          <SideShots left={left} right={right} setLeft={setLeft} setRight={setRight} disabled={current === 'result'} />
          <UvShot uv={uv} setUv={setUv} disabled={current === 'result'} />
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          {current === 'capture' && <PhotoTips />}
          {current === 'questions' && <Questions hijab={hijab} hair={hair} setHijab={setHijab} setHair={setHair} brandReady={brandReady} onAnalyze={analyze} />}
          {current === 'result' && (
            <div className={`${card} overflow-hidden`}>
              {/* Tabs wrap onto a second row when the card is narrow: every tab stays visible, no scrollbar. */}
              <div role="tablist" aria-label={t('Results', 'Hasil')} className="flex flex-wrap gap-1 border-b border-zinc-100 bg-zinc-50/60 p-1.5">
                {tabs.map((x) => (
                  <button key={x.id} type="button" role="tab" aria-selected={active.id === x.id} onClick={() => setTab(x.id)}
                    className={`flex min-w-[7.5rem] flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm transition-all ${active.id === x.id ? 'bg-white font-semibold text-zinc-900 shadow-sm ring-1 ring-zinc-900/5' : 'text-zinc-500 hover:bg-white/60 hover:text-zinc-900'}`}>
                    <span className={`h-2 w-2 rounded-full ${DOT[x.state]}`} />{x.label}
                  </button>
                ))}
              </div>
              <div className="p-5">{active.render()}</div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
