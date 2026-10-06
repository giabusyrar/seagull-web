import React, { useId } from 'react';

export interface SeagullMarkProps {
  /** Rendered width and height in px. */
  size?: number;
  className?: string;
  title?: string;
}

/**
 * Brand palette for the mark, taken from the app theme in `app/globals.css`:
 * slate for the night sky, sea and feathers (`--primary`, `--chart-*`), the
 * `--accent-beak` amber for the sun and beak, and `--destructive` red for the
 * gull's beak spot. The blush is the one colour outside the theme.
 * The tile is self-contained artwork, so it keeps these colours in both themes.
 * `app/icon.svg` is the same drawing with these values inlined — change both.
 */
const BRAND = {
  sky: '#0f172a',
  sun: '#f59e0b',
  sea: '#1e293b',
  foam: '#94a3b8',
  body: '#ffffff',
  feather: '#cbd5e1',
  wingtip: '#64748b',
  eye: '#0f172a',
  sparkle: '#ffffff',
  blush: '#fb7185',
  beak: '#f59e0b',
  beakLine: '#b45309',
  beakSpot: '#ef4444',
} as const;

const WAVE = 'M0 52 C6 49 10 49 16 52 S26 55 32 52 S42 49 48 52 S58 55 64 52';

/** The Seagull brand mark: a chubby gull bobbing on the sea at night. */
export function SeagullMark({ size = 20, className, title = 'Seagull' }: SeagullMarkProps) {
  // Clip ids must be unique per instance; useId's punctuation breaks url(#…).
  const tile = `seagull${useId().replace(/[^a-zA-Z0-9_-]/g, '')}-tile`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label={title}
      className={className}
    >
      <defs>
        <clipPath id={tile}>
          <rect width="64" height="64" rx="15" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${tile})`}>
        <rect width="64" height="64" fill={BRAND.sky} />
        <circle cx="52" cy="12.5" r="5" fill={BRAND.sun} />
        <g transform="translate(30 34) scale(1.2) translate(-30 -37)">
          {/* tail */}
          <path d="M14.5 40 L7 36.5 L8.8 42 L6 45.5 L15 45.3 Z" fill={BRAND.feather} />
          {/* body + head tuft */}
          <ellipse cx="29" cy="39" rx="17" ry="15.5" fill={BRAND.body} />
          <path d="M27 23.8 C26 20 27.5 18 30 17.5 C29 19.5 29.6 21.5 31 23.6 Z" fill={BRAND.body} />
          {/* wing */}
          <path d="M16.5 38.5 C19 35 25 35.3 26.8 39 C28 42.3 25 45.4 21 45 C17.6 44.7 15.6 41.5 16.5 38.5 Z" fill={BRAND.feather} />
          <path d="M16.6 40.6 C16.5 43 18.3 44.8 21 45 C19.4 44 18.3 42.4 17.8 40.4 Z" fill={BRAND.wingtip} />
          {/* face */}
          <ellipse cx="38.3" cy="40.6" rx="3.2" ry="2" fill={BRAND.blush} opacity="0.5" />
          <circle cx="36" cy="32.5" r="3.7" fill={BRAND.eye} />
          <circle cx="37.3" cy="31.1" r="1.35" fill={BRAND.sparkle} />
          <circle cx="34.9" cy="34" r="0.55" fill={BRAND.sparkle} />
          {/* beak */}
          <path d="M41.5 32.6 C47.5 31.8 52.6 33 54.3 35.4 C55.1 36.7 54 37.6 52.6 37.8 C49.4 40.2 44.4 40.4 41.3 39 C40.2 37.2 40.2 34.2 41.5 32.6 Z" fill={BRAND.beak} />
          <path d="M41.9 36.2 C45.4 37.1 49.8 37 53.9 36.1" stroke={BRAND.beakLine} strokeWidth="1" fill="none" strokeLinecap="round" />
          <circle cx="50.4" cy="38.2" r="0.8" fill={BRAND.beakSpot} />
        </g>
        <path d={`${WAVE} V64 H0Z`} fill={BRAND.sea} />
        <path d={WAVE} stroke={BRAND.foam} strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.7" />
      </g>
    </svg>
  );
}
