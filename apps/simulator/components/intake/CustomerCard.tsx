'use client';
import type { Respondent } from '@/lib/form';
import { useLang } from '@/lib/i18n';
import { cardPad, eyebrow, field } from '@/components/ui';

type Pii = 'fullName' | 'email' | 'phoneNumber' | 'dateOfBirth';

/**
 * The simulated customer: personal details only, no customer id. Every
 * engine call is a dry run, so they are used for this run and stored nowhere
 * but this browser, which keeps them between reloads.
 */
export function CustomerCard({ who, setWho }: { who: Respondent; setWho(r: Respondent): void }) {
  const { t } = useLang();
  const input = (k: Pii, label: string, type: string, auto: string) => (
    <label className="flex min-w-0 flex-col gap-1">
      <span className="text-[11px] text-zinc-500">{label}</span>
      <input type={type} autoComplete={auto} className={`${field} h-9 w-full`} value={who[k] ?? ''} onChange={(e) => setWho({ ...who, [k]: e.target.value })} />
    </label>
  );
  return (
    <div className={`${cardPad} flex flex-col gap-3`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className={eyebrow}>{t('Customer', 'Pelanggan')}</span>
        <span className="text-[11px] text-emerald-700">
          {t('Every run is a dry run: nothing is saved to the database.', 'Setiap run adalah dry run: tidak ada yang disimpan ke database.')}
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {input('fullName', `${t('Name', 'Nama')} *`, 'text', 'name')}
        {input('email', 'Email', 'email', 'email')}
        {input('phoneNumber', t('Phone', 'Telepon'), 'tel', 'tel')}
        {input('dateOfBirth', t('Date of birth', 'Tanggal lahir'), 'date', 'bday')}
      </div>
    </div>
  );
}
