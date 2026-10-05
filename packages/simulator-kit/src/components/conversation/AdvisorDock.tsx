'use client';
import { useEffect, useState } from 'react';
import { usePersistentState } from '@gateway-experience/shared';
import { useBrand } from '@/lib/brand';
import { useIntake } from '@/lib/intake';
import { useLang } from '@/lib/i18n';
import { photoRequested, transcriptJson, transcriptText, type TranscriptMeta } from '@/lib/conversation';
import { btnGhost } from '@/components/ui';
import { useFlowSurveys } from './useFlowSurveys';
import { ConversationPanel } from './ConversationPanel';

function download(name: string, body: string, type: string) {
  const url = URL.createObjectURL(new Blob([body], { type }));
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * The advisor as an assistant on every step: a floating button that opens a
 * docked panel. The session lives above the steps (lib/intake), so it keeps
 * running while the customer moves between them. `onOpenChange` lets the
 * page make room for the dock on wide screens.
 */
export function AdvisorDock({ onGoPhoto, onOpenChange }: { onGoPhoto(): void; onOpenChange?(open: boolean): void }) {
  const { t } = useLang();
  const brand = useBrand();
  const { code, who, conv } = useIntake();
  const flows = useFlowSurveys(brand);
  const [open, setOpen] = usePersistentState<boolean>('sim.advisor.open', true);
  const [menu, setMenu] = useState(false);
  const { live, conn } = conv;
  const advisorTurns = live.turns.filter((x) => x.speaker === 'Advisor' && x.final).length;
  // Advisor replies seen with the panel open; kept across reloads so restored turns are not "new".
  const [seen, setSeen] = usePersistentState<number>('sim.advisor.seen', 0);
  const unread = open ? 0 : Math.max(0, advisorTurns - Math.min(seen, advisorTurns));
  useEffect(() => { if (open && seen !== advisorTurns) setSeen(advisorTurns); }, [open, advisorTurns, seen, setSeen]);
  useEffect(() => { onOpenChange?.(open); }, [open, onOpenChange]);

  const hasFlow = !!code && (flows.codes ? flows.codes.has(code) : true);
  const wantsPhoto = conn === 'ready' && photoRequested(live);
  const meta: TranscriptMeta = { sessionId: conv.session?.id, survey: code || undefined, brandId: brand.brandId, applicationId: brand.applicationId, customer: who.fullName || undefined, persona: live.persona };
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  const hasTranscript = live.turns.some((x) => x.final && x.text);

  return (
    <>
      {open && (
        <div role="dialog" aria-label={t('Advisor', 'Advisor')}
          className="fixed inset-x-3 bottom-24 z-30 flex flex-col gap-2 sm:inset-x-auto sm:right-5 sm:w-[400px] lg:bottom-5 lg:right-5 lg:top-20">
          <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white/95 px-3 py-1.5 shadow-sm backdrop-blur">
            <span className="flex items-center gap-2 text-xs font-semibold text-zinc-600">
              {t('Advisor assistant', 'Asisten advisor')}
              {conv.session && Object.keys(live.progress).length > 0 && (live.progress.dryRun
                ? <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">{t('Dry run · not saved', 'Dry run · tidak disimpan')}</span>
                : <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700" title={t('The engine did not confirm a dry run for this session.', 'Engine tidak mengonfirmasi dry-run untuk sesi ini.')}>{t('Not confirmed as dry run', 'Dry-run belum terkonfirmasi')}</span>)}
            </span>
            <div className="relative flex items-center gap-1">
              <button type="button" className={btnGhost} disabled={!hasTranscript} onClick={() => setMenu((v) => !v)} aria-expanded={menu}>
                {t('Download transcript', 'Unduh transkrip')}
              </button>
              {menu && (
                <div className="absolute right-0 top-8 z-10 flex w-40 flex-col rounded-lg border border-zinc-200 bg-white p-1 shadow-lg">
                  <button type="button" className={`${btnGhost} justify-start`} onClick={() => { download(`conversation-${stamp}.txt`, transcriptText(live, meta), 'text/plain'); setMenu(false); }}>{t('Text (.txt)', 'Teks (.txt)')}</button>
                  <button type="button" className={`${btnGhost} justify-start`} onClick={() => { download(`conversation-${stamp}.json`, transcriptJson(live, meta), 'application/json'); setMenu(false); }}>JSON (.json)</button>
                </div>
              )}
              <button type="button" className={btnGhost} onClick={() => setOpen(false)} aria-label={t('Close advisor', 'Tutup advisor')}>✕</button>
            </div>
          </div>
          {hasFlow ? (
            <div className="min-h-0 flex-1 [&>div]:h-full">
              <ConversationPanel brand={brand} code={code} canStart={!!code} onGoPhoto={onGoPhoto} />
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center text-sm text-zinc-500 shadow-sm">
              {!code
                ? t('Choose a form in the Questionnaire step to talk with the advisor.', 'Pilih form di langkah Kuesioner untuk ngobrol dengan advisor.')
                : t('This form has no advisor conversation; fill in the form instead.', 'Form ini tidak punya percakapan advisor; isi form saja.')}
            </div>
          )}
        </div>
      )}

      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label={open ? t('Hide advisor', 'Sembunyikan advisor') : t('Open advisor', 'Buka advisor')}
        className={`fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105 ${open ? 'bg-zinc-700 lg:hidden' : 'bg-zinc-900'}`}>
        {conv.speaking && !open && <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/40" />}
        <svg viewBox="0 0 24 24" className="relative h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />}
        </svg>
        <span className={`absolute right-0.5 top-0.5 h-3 w-3 rounded-full border-2 border-white ${conn === 'ready' ? 'bg-emerald-500' : conn === 'connecting' ? 'bg-amber-400' : 'bg-zinc-400'}`} />
        {(unread > 0 || (wantsPhoto && !open)) && (
          <span className="absolute -left-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold">{wantsPhoto && !open ? '!' : unread}</span>
        )}
      </button>
    </>
  );
}
