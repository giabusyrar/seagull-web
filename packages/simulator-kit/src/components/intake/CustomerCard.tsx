'use client';
import type { ReactNode } from 'react';
import type { Respondent } from '../../lib/form';
import { useLang } from '../../lib/i18n';
import { card, eyebrow, field } from '../ui';
import { LocationPicker } from './LocationPicker';

type Pii = 'fullName' | 'email' | 'phoneNumber' | 'dateOfBirth';

/**
 * The simulated customer: personal details only, no customer id. Every
 * engine call is a dry run, so they are used for this run and stored nowhere
 * but this browser, which keeps them between reloads. `footer` is the step's
 * action row, shown inside the card.
 */
export function CustomerCard({ who, setWho, footer }: { who: Respondent; setWho(r: Respondent): void; footer?: ReactNode }) {
  const { t } = useLang();
  const input = (k: Pii, label: string, type: string, auto: string, hint?: string) => (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-xs font-medium text-zinc-600">{label}</span>
      <input type={type} autoComplete={auto} className={`${field} w-full`} value={who[k] ?? ''} onChange={(e) => setWho({ ...who, [k]: e.target.value })} />
      {hint && <span className="text-[11px] text-zinc-400">{hint}</span>}
    </label>
  );
  return (
    <div className={`${card} overflow-hidden`}>
      <div className="flex flex-col gap-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className={eyebrow}>{t('Customer details', 'Data pelanggan')}</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200/70">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {t('Dry run — nothing is saved', 'Dry run — tidak ada yang disimpan')}
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {input('fullName', `${t('Name', 'Nama')} *`, 'text', 'name', t('The advisor greets the customer by name.', 'Advisor menyapa pelanggan dengan nama ini.'))}
          {input('dateOfBirth', t('Date of birth', 'Tanggal lahir'), 'date', 'bday', t('Feeds the ageing score.', 'Dipakai untuk skor penuaan.'))}
          {input('email', 'Email', 'email', 'email')}
          {input('phoneNumber', t('Phone', 'Telepon'), 'tel', 'tel')}
        </div>
        <div className="flex flex-col gap-3 border-t border-zinc-100 pt-5">
          <span className={eyebrow}>{t('Location', 'Lokasi')}</span>
          <LocationPicker who={who} setWho={setWho} />
        </div>
      </div>
      {footer && <div className="border-t border-zinc-100 bg-zinc-50/60 px-5 py-4 sm:px-6">{footer}</div>}
    </div>
  );
}
