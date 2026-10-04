'use client';
import type { Respondent } from '@/lib/form';
import { useLang } from '@/lib/i18n';
import { cardPad, eyebrow, field } from '@/components/ui';

type Pii = 'fullName' | 'email' | 'phoneNumber' | 'dateOfBirth';

/**
 * The simulated customer: personal details only, no customer id. Advisor
 * sessions carry them in a dry run; form and photo scoring still submit under
 * the fixed test id until core has dry-run. Kept in this browser between reloads.
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
        <span className="text-[11px] text-amber-700">
          {t('Advisor sessions run as dry-run (nothing saved); form and photo scoring are still saved until core supports dry-run.', 'Sesi advisor berjalan dry-run (tidak disimpan); penilaian form dan foto masih tersimpan sampai core mendukung dry-run.')}
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
