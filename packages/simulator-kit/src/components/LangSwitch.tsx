'use client';
import { useEffect } from 'react';
import { useLang, type Lang } from '../lib/i18n';
import { segItem, segTrack } from './ui';

/** EN / ID switch; also keeps <html lang> in step for screen readers. */
export function LangSwitch() {
  const { lang, setLang } = useLang();
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  return (
    <div className={segTrack} role="radiogroup" aria-label="Language">
      {(['en', 'id'] as Lang[]).map((l) => (
        <button key={l} type="button" role="radio" aria-checked={lang === l} onClick={() => setLang(l)} className={`${segItem(lang === l)} px-2 uppercase`}>
          {l}
        </button>
      ))}
    </div>
  );
}
