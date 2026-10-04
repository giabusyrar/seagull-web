'use client';
import { useEffect, useRef, useState } from 'react';
import { useBrand } from '@/lib/brand';
import { useBlobUrl } from '@/lib/blob';
import { call } from '@/lib/http';
import { analyzeColour, faceArchitecture, faceHead, skinAnalyze, toggleShade, type Brand, type BuiltRequest, type Selection } from '@/lib/photo';
import { FrontPicker, HowItWorks, Questions, SideShots, type YesNo } from './PhotoInput';
import { PhotoStage } from './PhotoStage';
import { ColourTab } from './ColourTab';
import { FaceTab } from './FaceTab';
import { SkinTab } from './SkinTab';
import { IDLE, type TabState } from './TabShell';
import { useTryOn } from './useTryOn';

type TabId = 'warna' | 'wajah' | 'kulit';
const TABS: { id: TabId; label: string }[] = [{ id: 'warna', label: 'Warna' }, { id: 'wajah', label: 'Wajah' }, { id: 'kulit', label: 'Kulit' }];
const LOADING: TabState = { loading: true };

const dot = (s: TabState) => (s.loading ? 'bg-zinc-400 animate-pulse' : s.error || (s.result && !s.result.ok) ? 'bg-red-500' : s.result ? 'bg-emerald-500' : 'bg-zinc-200');

export function PhotoSimulator() {
  const brand = useBrand();
  const [step, setStep] = useState<'input' | 'result'>('input');
  const [front, setFront] = useState<File | null>(null);
  const [left, setLeft] = useState<File | null>(null);
  const [right, setRight] = useState<File | null>(null);
  const [hijab, setHijab] = useState<YesNo>('');
  const [hair, setHair] = useState<YesNo>('');
  const [colour, setColour] = useState<TabState>(IDLE);
  const [face, setFace] = useState<TabState>(IDLE);
  const [skin, setSkin] = useState<TabState>(IDLE);
  const [head, setHead] = useState<TabState>(IDLE);
  const [glbUrl, setGlbUrl] = useBlobUrl();
  const [selection, setSelection] = useState<Selection>({});
  const [tab, setTab] = useState<TabId>('warna');
  const runId = useRef(0);
  const runAbort = useRef<AbortController | null>(null);
  const [analyzed, setAnalyzed] = useState<Brand | null>(null);
  const tryOn = useTryOn(front);

  const stopRun = () => { runId.current += 1; runAbort.current?.abort(); runAbort.current = null; };
  // Leaving the page aborts whatever is still in flight.
  useEffect(() => () => { runId.current += 1; runAbort.current?.abort(); }, []);

  const analyze = async () => {
    if (!front) return;
    stopRun();
    const id = runId.current;
    const ac = new AbortController();
    runAbort.current = ac;
    const b = { brandId: brand.brandId, applicationId: brand.applicationId };
    const views = { front, left, right };
    setAnalyzed(b); setStep('result'); setTab('warna'); setSelection({}); tryOn.reset(); setGlbUrl(null);
    setColour(LOADING); setFace(LOADING); setSkin(LOADING); setHead(LOADING);

    // Each request sets only its own state; a later run or "Foto ulang" makes it stale.
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
    ]);
  };

  const retake = () => {
    stopRun(); tryOn.reset(); setGlbUrl(null); setSelection({});
    setColour(IDLE); setFace(IDLE); setSkin(IDLE); setHead(IDLE);
    setFront(null); setLeft(null); setRight(null); setHijab(''); setHair('');
    setAnalyzed(null); setStep('input');
  };

  const pick = (category: string, shadeId: string) => {
    const next = toggleShade(selection, category, shadeId);
    setSelection(next);
    tryOn.request(Object.values(next));
  };
  const clearShades = () => { setSelection({}); tryOn.request([]); };

  const brandReady = !!brand.brandId.trim() && !!brand.applicationId.trim();
  const states: Record<TabId, TabState> = { warna: colour, wajah: face, kulit: skin };
  const brandChanged = !!analyzed && (analyzed.brandId !== brand.brandId || analyzed.applicationId !== brand.applicationId);
  const current: Step = !front ? 'capture' : step === 'result' ? 'result' : 'questions';

  // Same left/right layout as seagull-web's studio: photo on the left, questions or results on the right.
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold">Foto{current === 'result' && <span className="ml-2 text-xs font-normal text-zinc-500">{analyzed?.brandId} / {analyzed?.applicationId}</span>}</h1>
        <Stepper step={current} />
      </div>
      {current === 'result' && brandChanged && (
        <div className="flex flex-wrap items-center gap-2 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          <span>Brand berubah ({brand.brandId || '—'} / {brand.applicationId || '—'}); hasil di bawah masih untuk {analyzed?.brandId} / {analyzed?.applicationId}. Klik Foto ulang atau Analisis ulang.</span>
          <button type="button" disabled={!brandReady} onClick={analyze} className="rounded bg-zinc-900 px-2 py-0.5 font-semibold text-white disabled:bg-zinc-300">Analisis ulang</button>
        </div>
      )}
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="flex flex-col gap-3 rounded border border-zinc-200 p-3 lg:sticky lg:top-4">
          {front ? (
            <>
              <PhotoStage photo={front} tryOnUrl={tryOn.url} head={head} glbUrl={glbUrl} onRetake={retake} canShow3d={current === 'result'} />
              <SideShots left={left} right={right} setLeft={setLeft} setRight={setRight} disabled={current === 'result'} />
            </>
          ) : <FrontPicker onChange={setFront} />}
        </div>
        <div className="flex min-w-0 flex-col gap-3">
          {current === 'capture' && <HowItWorks />}
          {current === 'questions' && <Questions hijab={hijab} hair={hair} setHijab={setHijab} setHair={setHair} brandReady={brandReady} onAnalyze={analyze} />}
          {current === 'result' && (
            <>
              <div className="flex gap-1 border-b border-zinc-200">
                {TABS.map((t) => (
                  <button key={t.id} type="button" onClick={() => setTab(t.id)}
                    className={`-mb-px flex items-center gap-1.5 border-b-2 px-3 py-1.5 text-sm ${tab === t.id ? 'border-zinc-900 font-semibold' : 'border-transparent text-zinc-500 hover:text-zinc-900'}`}>
                    <span className={`h-2 w-2 rounded-full ${dot(states[t.id])}`} />{t.label}
                  </button>
                ))}
              </div>
              {tab === 'warna' && <ColourTab state={colour} selection={selection} onToggle={pick} onClear={clearShades} tryOnState={{ loading: tryOn.loading, error: tryOn.error }} />}
              {tab === 'wajah' && <FaceTab state={face} />}
              {tab === 'kulit' && <SkinTab state={skin} />}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

type Step = 'capture' | 'questions' | 'result';
const STEPS: [Step, string][] = [['capture', 'Foto'], ['questions', 'Analisis'], ['result', 'Hasil']];

function Stepper({ step }: { step: Step }) {
  const at = STEPS.findIndex(([s]) => s === step);
  return (
    <ol className="flex items-center gap-2 text-[11px] font-semibold">
      {STEPS.map(([s, label], i) => (
        <li key={s} className="flex items-center gap-2">
          <span className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${i <= at ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 text-zinc-500'}`}>{i + 1}</span>
          <span className={i === at ? '' : 'text-zinc-500'}>{label}</span>
          {i < STEPS.length - 1 && <span className="h-px w-4 bg-zinc-200" />}
        </li>
      ))}
    </ol>
  );
}
