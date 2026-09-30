'use client';

import React, { useEffect, useState } from 'react';
import { REGION_CONFIDENCE_LABEL, regionConfidence, type GuidanceRegion, type RegionConfidence } from './faceTypes';

// Drawn distinctly per confidence, so a placement the engine could not
// confirm never looks like one it did. Dash patterns carry the same
// information as the colours, for viewers who cannot tell them apart.
const STROKE: Record<RegionConfidence, { colour: string; dash?: string; fill: number }> = {
  verified: { colour: '#2563eb', fill: 0.18 },
  unverified: { colour: '#d97706', dash: '6 4', fill: 0.1 },
  unsourced: { colour: '#dc2626', dash: '2 5', fill: 0.06 },
};

interface Props {
  photoUrl: string;
  regions: GuidanceRegion[];
  /** Hide the placements the engine could not verify. */
  verifiedOnly: boolean;
}

/**
 * The guidance polygons over the photo. The polygons are in image pixels, so
 * the SVG uses the image's natural size as its viewBox and scales with it.
 */
export function GuidanceOverlay({ photoUrl, regions, verifiedOnly }: Props) {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelled) setSize({ w: img.naturalWidth, h: img.naturalHeight });
    };
    img.src = photoUrl;
    return () => {
      cancelled = true;
    };
  }, [photoUrl]);

  const shown = verifiedOnly ? regions.filter((r) => regionConfidence(r) === 'verified') : regions;

  return (
    <div className="relative inline-block max-w-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photoUrl} alt="Foto yang dianalisis" className="block max-w-full rounded border border-border" />
      {size && (
        <svg
          viewBox={`0 0 ${size.w} ${size.h}`}
          className="absolute inset-0 h-full w-full"
          role="img"
          aria-label={`${shown.length} area panduan makeup`}
        >
          {shown.map((r, i) => {
            const conf = regionConfidence(r);
            const s = STROKE[conf];
            return (
              <polygon
                key={`${r.template}-${r.ruleId}-${i}`}
                points={r.polygon.map(([x, y]) => `${x},${y}`).join(' ')}
                fill={s.colour}
                fillOpacity={s.fill * r.intensity}
                stroke={s.colour}
                strokeWidth={Math.max(size.w, size.h) / 400}
                strokeDasharray={s.dash}
              >
                <title>{`${r.role} · ${r.template} · ${REGION_CONFIDENCE_LABEL[conf]}`}</title>
              </polygon>
            );
          })}
        </svg>
      )}
    </div>
  );
}

/** Legend for the overlay, so the dash patterns are readable without hover. */
export function GuidanceLegend({ regions }: { regions: GuidanceRegion[] }) {
  const counts = regions.reduce<Record<string, number>>((acc, r) => {
    const c = regionConfidence(r);
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});

  return (
    <ul className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
      {(Object.keys(STROKE) as RegionConfidence[]).map((c) => (
        <li key={c} className="flex items-center gap-1.5">
          <span
            className="inline-block h-0 w-5 border-t-2"
            style={{ borderColor: STROKE[c].colour, borderStyle: STROKE[c].dash ? 'dashed' : 'solid' }}
          />
          {REGION_CONFIDENCE_LABEL[c]}
          <span className="tabular-nums">({counts[c] || 0})</span>
        </li>
      ))}
    </ul>
  );
}
