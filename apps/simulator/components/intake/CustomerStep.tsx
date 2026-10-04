'use client';
import { useIntake } from '@/lib/intake';
import { useLang } from '@/lib/i18n';
import { btnPrimary, cardPad } from '@/components/ui';
import { CustomerCard } from './CustomerCard';

/** Step 1: who the simulated customer is. A name is enough to continue. */
export function CustomerStep({ onContinue }: { onContinue(): void }) {
  const { t } = useLang();
  const { who, setWho } = useIntake();
  const named = !!who.fullName?.trim();
  return (
    <section className="flex w-full flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{t('Customer', 'Pelanggan')}</h1>
        <p className="mt-0.5 text-sm text-zinc-500">{t('Who is this run for? The advisor uses the name; the date of birth feeds the ageing score.', 'Untuk siapa run ini? Advisor memakai namanya; tanggal lahir dipakai untuk skor penuaan.')}</p>
      </div>
      <CustomerCard who={who} setWho={setWho} />
      <div className={`${cardPad} flex flex-wrap items-center justify-end gap-3`}>
        {!named && <span className="text-xs text-zinc-500">{t('Enter a name to continue', 'Isi nama untuk lanjut')}</span>}
        <button type="button" className={`${btnPrimary} rounded-full`} disabled={!named} onClick={onContinue}>{t('Continue', 'Lanjut')} →</button>
      </div>
    </section>
  );
}
