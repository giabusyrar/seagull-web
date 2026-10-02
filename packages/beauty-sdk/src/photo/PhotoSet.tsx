'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useBeauty } from '../react/BeautyProvider';
import type { PhotoView, Photos } from '../react/usePhotoSet';
import { cn } from './cn';

export type PhotoSetPart = 'root' | 'header' | 'grid' | 'item' | 'title' | 'why' | 'label' | 'slot' | 'image' | 'badge' | 'remove' | 'hint';

export interface PhotoSetProps {
  photos: Photos;
  onChange(view: PhotoView, file: File | null): void;
  /** Which slots to show; by default the two optional side views. */
  views?: PhotoView[];
  disabled?: boolean;
  className?: string;
  classNames?: Partial<Record<PhotoSetPart, string>>;
  renderSlot?: (slot: { view: PhotoView; file?: File }, Default: React.ReactNode) => React.ReactNode;
}

const LABEL_KEY: Record<PhotoView, string> = { front: 'photo.front', left: 'photo.left', right: 'photo.right' };

export function PhotoSet({ photos, onChange, views = ['left', 'right'], disabled, className, classNames = {}, renderSlot }: PhotoSetProps) {
  const { t } = useBeauty();
  const sides = views.some((v) => v !== 'front');
  return (
    <div data-bsdk-part="root" className={cn('bsdk:space-y-1.5 bsdk:font-bsdk', className, classNames.root)}>
      {sides && (
        <div data-bsdk-part="header" className={cn('bsdk:flex bsdk:items-baseline bsdk:justify-between bsdk:gap-2', classNames.header)}>
          <span data-bsdk-part="title" className={cn('bsdk:text-[10px] bsdk:font-bold bsdk:uppercase bsdk:tracking-wider bsdk:text-muted-foreground', classNames.title)}>{t('photo.sides.title')}</span>
          <span data-bsdk-part="why" className={cn('bsdk:text-[11px] bsdk:text-muted-foreground', classNames.why)}>{t('photo.sides.why')}</span>
        </div>
      )}
      <div data-bsdk-part="grid" className={cn('bsdk:grid bsdk:grid-cols-2 bsdk:gap-2', classNames.grid)}>
        {views.map((view) => {
          const slot = <Slot key={view} view={view} file={photos[view]} onChange={(f) => onChange(view, f)} disabled={disabled} classNames={classNames} />;
          return renderSlot ? <React.Fragment key={view}>{renderSlot({ view, file: photos[view] }, slot)}</React.Fragment> : slot;
        })}
      </div>
      {sides && <p data-bsdk-part="hint" className={cn('bsdk:text-[11px] bsdk:text-muted-foreground', classNames.hint)}>{t('photo.sides.guide')}</p>}
    </div>
  );
}

function Slot({
  view,
  file,
  onChange,
  disabled,
  classNames,
}: {
  view: PhotoView;
  file?: File;
  onChange: (f: File | null) => void;
  disabled?: boolean;
  classNames: Partial<Record<PhotoSetPart, string>>;
}) {
  const { t } = useBeauty();
  const input = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string | null>(null);
  // Created and revoked in the same effect so StrictMode's mount/cleanup/mount
  // cycle never leaves the image pointing at a revoked URL.
  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }
    const created = URL.createObjectURL(file);
    setUrl(created);
    return () => URL.revokeObjectURL(created);
  }, [file]);
  const label = t(LABEL_KEY[view]);

  return (
    <div data-bsdk-part="item" className={cn('bsdk:relative', classNames.item)}>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png"
        className="bsdk:hidden"
        onChange={(e) => {
          onChange(e.target.files?.[0] ?? null);
          e.target.value = '';
        }}
      />
      <button
        type="button"
        data-bsdk-part="slot"
        disabled={disabled}
        onClick={() => input.current?.click()}
        aria-label={t(file ? 'photo.change' : 'photo.add', { view: label })}
        className={cn(
          'bsdk:flex bsdk:aspect-[3/4] bsdk:w-full bsdk:flex-col bsdk:items-center bsdk:justify-center bsdk:gap-1 bsdk:overflow-hidden bsdk:rounded-bsdk bsdk:border bsdk:border-border bsdk:bg-card bsdk:text-center',
          !file && 'bsdk:border-dashed bsdk:bg-muted',
          disabled && 'bsdk:opacity-50',
          classNames.slot,
        )}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img data-bsdk-part="image" src={url} alt={label} className={cn('bsdk:h-full bsdk:w-full bsdk:object-cover', classNames.image)} />
        ) : (
          <>
            <span data-bsdk-part="label" className={cn('bsdk:text-xs bsdk:font-semibold bsdk:text-foreground', classNames.label)}>{label}</span>
            {view !== 'front' && <span data-bsdk-part="hint" className={cn('bsdk:text-[11px] bsdk:text-muted-foreground', classNames.hint)}>{t(`photo.${view}.hint`)}</span>}
            <span data-bsdk-part="hint" className={cn('bsdk:text-[11px] bsdk:text-muted-foreground', classNames.hint)}>{t('photo.optional')}</span>
          </>
        )}
      </button>
      {file && (
        <>
          <span data-bsdk-part="badge" className={cn('bsdk:pointer-events-none bsdk:absolute bsdk:left-1.5 bsdk:top-1.5 bsdk:rounded-full bsdk:bg-primary bsdk:text-primary-foreground bsdk:px-2 bsdk:py-0.5 bsdk:text-[10px] bsdk:font-bold', classNames.badge)}>
            {label}
          </span>
          <button
            type="button"
            data-bsdk-part="remove"
            disabled={disabled}
            onClick={() => onChange(null)}
            aria-label={t('photo.remove', { view: label })}
            className={cn('bsdk:absolute bsdk:right-1.5 bsdk:top-1.5 bsdk:rounded-full bsdk:bg-card bsdk:px-2 bsdk:text-xs bsdk:text-foreground', disabled && 'bsdk:opacity-50', classNames.remove)}
          >
            ×
          </button>
        </>
      )}
    </div>
  );
}
