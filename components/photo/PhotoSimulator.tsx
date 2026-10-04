'use client';
import { useRef, useState } from 'react';
import { useBrand } from '@/lib/brand';
import { useBlobUrl } from '@/lib/blob';
import { call } from '@/lib/http';
import { analyzeColour, faceArchitecture, faceHead, skinAnalyze, toggleShade, type BuiltRequest, type Selection } from '@/lib/photo';
import { PhotoInput, type YesNo } from './PhotoInput';
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
  const tryOn = useTryOn(front);

  const stopRun = () => { runId.current += 1; runAbort.current?.abort(); runAbort.current = null; };

  const analyze = async () => {
    if (!front) return;
    stopRun();
    const id = runId.current;
    const ac = new AbortController();
    runAbort.current = ac;
    const b = { brandId: brand.brandId, applicationId: brand.applicationId };
    const views = { front, left, right };
    setStep('result'); setTab('warna'); setSelection({}); tryOn.reset(); setGlbUrl(null);
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
    setStep('input');
  };

  const pick = (category: string, shadeId: string) => {
    const next = toggleShade(selection, category, shadeId);
    setSelection(next);
    tryOn.request(Object.values(next));
  };
  const clearShades = () => { setSelection({}); tryOn.request([]); };

  if (step === 'input' || !front) {
    return (
      <PhotoInput front={front} left={left} right={right} setFront={setFront} setLeft={setLeft} setRight={setRight}
        hijab={hijab} hair={hair} setHijab={setHijab} setHair={setHair}
        brandReady={!!brand.brandId.trim() && !!brand.applicationId.trim()} onAnalyze={analyze} />
    );
  }

  const states: Record<TabId, TabState> = { warna: colour, wajah: face, kulit: skin };
  return (
    <section className="flex flex-col gap-3">
      <h1 className="text-lg font-semibold">2. Hasil <span className="text-xs font-normal text-zinc-500">{brand.brandId} / {brand.applicationId}</span></h1>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <PhotoStage photo={front} tryOnUrl={tryOn.url} head={head} glbUrl={glbUrl} onRetake={retake} />
        <div className="flex min-w-0 flex-col gap-3">
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
        </div>
      </div>
    </section>
  );
}
