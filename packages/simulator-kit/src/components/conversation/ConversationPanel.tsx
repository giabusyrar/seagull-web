'use client';
import { useEffect, useRef } from 'react';
import { usePersistentState } from '@gateway-experience/shared';
import { photoRequested } from '../../lib/conversation';
import { useIntake } from '../../lib/intake';
import { useLang } from '../../lib/i18n';
import type { Brand } from '../../lib/photo';
import { accent, btnPrimary, btnPrimarySm, card, field } from '../ui';
import { Bubble, ProgressBar, ResumeDivider } from './parts';

/**
 * The live advisor beside the form: ▶ starts (or resumes) a session for the
 * chosen form, then the same button is the microphone; ⏸ pauses and keeps the
 * session. The advisor's photo request is answered on the Photo step.
 */
export function ConversationPanel({ brand, code, canStart, onGoPhoto }: {
  brand: Brand; code: string; canStart: boolean; onGoPhoto(): void;
}) {
  const { t } = useLang();
  const { conv: c, who } = useIntake();
  const { live, conn } = c;
  const [draft, setDraft] = usePersistentState<string>('sim.conv.draft', '');
  const scroller = useRef<HTMLDivElement>(null);
  const lastText = live.turns[live.turns.length - 1]?.text;
  useEffect(() => { scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' }); }, [live.turns.length, lastText]);

  const resumable = !!c.session && (!c.session.survey || c.session.survey === code);
  const canPlay = resumable || canStart;
  const play = () => (resumable && c.session ? c.connect(c.session) : c.start(brand, code, who));
  const send = () => { if (c.sendText(draft)) setDraft(''); };
  const wantsPhoto = conn === 'ready' && photoRequested(live);

  const hint = conn === 'connecting' ? t('Connecting to the advisor…', 'Menghubungkan ke advisor…')
    : conn === 'ready' ? (c.micOn ? t('Listening… click to stop', 'Mendengarkan… klik untuk berhenti') : c.speaking ? t('The advisor is speaking', 'Advisor sedang berbicara') : t('Click the mic to talk, or type below', 'Klik mikrofon untuk bicara, atau ketik di bawah'))
    : !code ? t('Choose a form first', 'Pilih form dulu')
    : resumable ? t('Paused — press play to resume the same session', 'Dijeda — putar untuk melanjutkan sesi yang sama')
    : c.session ? t('Form changed — press play to start a new session', 'Form berubah — putar untuk memulai sesi baru')
    : t('Press play to talk it through with the advisor', 'Putar untuk menjawab lewat obrolan dengan advisor');

  const callBase = 'relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-white shadow-md transition-all disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400 disabled:shadow-none';
  const callButton = conn === 'ready' ? (
    <button type="button" onClick={c.toggleMic} aria-pressed={c.micOn} aria-label={c.micOn ? t('Stop talking', 'Berhenti bicara') : t('Talk', 'Bicara')}
      className={`${callBase} ${c.micOn ? 'bg-red-500 hover:bg-red-600' : `${accent} shadow-slate-900/20 hover:bg-slate-800`}`}>
      {c.micOn && <span className="absolute inset-0 rounded-full bg-red-400" style={{ transform: `scale(${1 + Math.min(0.35, c.level * 1.5)})`, opacity: 0.35 }} />}
      <svg viewBox="0 0 24 24" className="relative h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
        <rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
      </svg>
    </button>
  ) : (
    <button type="button" onClick={play} disabled={!canPlay || conn === 'connecting'} aria-label={resumable ? t('Resume conversation', 'Lanjutkan percakapan') : t('Start conversation', 'Mulai percakapan')}
      className={`${callBase} bg-emerald-600 hover:scale-105 hover:bg-emerald-500`}>
      {conn === 'connecting'
        ? <span className="h-6 w-6 animate-spin rounded-full border-[3px] border-white/40 border-t-white" />
        : <svg viewBox="0 0 24 24" className="ml-0.5 h-7 w-7" fill="currentColor" aria-hidden><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5Z" /></svg>}
    </button>
  );

  return (
    <div className={`${card} flex h-[min(70vh,640px)] flex-col overflow-hidden`}>
      <div className="flex items-center gap-3 border-b border-zinc-100 p-3.5">
        {callButton}
        {conn === 'ready' && (
          <button type="button" onClick={c.pause} aria-label={t('Pause conversation', 'Jeda percakapan')} title={t('Pause (the session is kept)', 'Jeda (sesi tetap tersimpan)')}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-sm hover:bg-zinc-50">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
          </button>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className={`h-2 w-2 rounded-full ${conn === 'ready' ? 'bg-emerald-500' : conn === 'connecting' ? 'animate-pulse bg-amber-400' : 'bg-zinc-300'}`} />
            {t('Advisor', 'Advisor')}{live.persona ? ` · ${live.persona}` : ''}
          </div>
          <span className="truncate text-xs text-zinc-500">{hint}</span>
          <ProgressBar answered={live.progress.answered} total={live.progress.visibleTotal} />
        </div>
      </div>

      {wantsPhoto && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sky-100 bg-sky-50 px-4 py-2.5 text-xs text-sky-900">
          <span className="font-medium">{t('The advisor is asking for your photo.', 'Advisor meminta foto wajahmu.')}</span>
          <button type="button" className={btnPrimarySm} onClick={onGoPhoto}>{t('Go to photo', 'Ke langkah foto')} →</button>
        </div>
      )}

      <div ref={scroller} className="flex flex-1 flex-col gap-2.5 overflow-y-auto p-4">
        {live.turns.length === 0 ? (
          <div className="m-auto max-w-xs text-center text-sm text-zinc-500">
            {c.session ? t('Waiting for the advisor to greet you…', 'Menunggu advisor menyapa…') : t('Answer by talking with the advisor, or fill in the form — both stay in sync.', 'Jawab lewat obrolan dengan advisor, atau isi form — keduanya tersinkron.')}
          </div>
        ) : live.turns.map((turn, i) => (
          <div key={turn.id} className="contents">
            {c.resumeIndex === i && <ResumeDivider />}
            <Bubble t={turn} />
          </div>
        ))}
        {c.resumeIndex !== null && c.resumeIndex >= live.turns.length && live.turns.length > 0 && <ResumeDivider waiting={conn === 'ready'} />}
        {c.speaking && <div className="flex gap-1 pl-2">{[0, 1, 2].map((i) => <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400" style={{ animationDelay: `${i * 120}ms` }} />)}</div>}
      </div>

      {live.errors.length > 0 && (
        <div className="border-t border-red-100 bg-red-50 px-4 py-2 text-xs text-red-800">{live.errors[live.errors.length - 1]}{live.fatal ? ' (fatal)' : ''}</div>
      )}
      <form className="flex gap-2 border-t border-zinc-100 p-3" onSubmit={(e) => { e.preventDefault(); send(); }}>
        <input className={`${field} h-10 flex-1 rounded-full px-4 text-sm`} placeholder={conn === 'ready' ? t('Type your answer…', 'Ketik jawaban…') : t('Connect first to type', 'Tersambung dulu untuk mengetik')}
          value={draft} onChange={(e) => setDraft(e.target.value)} disabled={conn !== 'ready'} />
        <button type="submit" className={btnPrimary} disabled={conn !== 'ready' || !draft.trim()}>{t('Send', 'Kirim')}</button>
      </form>
    </div>
  );
}
