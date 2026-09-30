'use client';

import React from 'react';
import { formatMeasurementValue, type Measurement, type MeasurementGeometry, type Point } from './faceTypes';

// Distinct from the guidance colours (blue / amber / red), so a measurement
// is never read as a makeup placement. Proxy measurements are dashed, the
// same distinction the card makes with its "proxy" badge.
const COLOUR = '#059669';
const HALO = '#ffffff';
const PROXY_DASH = '5 4';

export interface LabelBox {
  /** Centre x and baseline y, image pixels. */
  x: number;
  y: number;
  w: number;
  h: number;
}

// Layout-only estimate of a label's width per character, as a share of the
// font size, for the sans-serif labels below. It only decides when two
// labels would touch; nothing is measured with it.
const CHAR_WIDTH_EM = 0.6;

export function estimateLabelBox(text: string, x: number, y: number, fontSize: number): LabelBox {
  return { x, y, w: text.length * fontSize * CHAR_WIDTH_EM, h: fontSize * 1.2 };
}

function overlaps(a: LabelBox, b: LabelBox): boolean {
  return Math.abs(a.x - b.x) * 2 < a.w + b.w && Math.abs(a.y - b.y) * 2 < a.h + b.h;
}

/**
 * Greedy de-overlap: labels are placed in the given order (most important
 * first), each moved up in steps of its own height until it touches neither
 * an earlier label nor an obstacle. Returns the final baseline per label.
 */
export function layoutLabels(labels: LabelBox[], obstacles: LabelBox[], maxSteps = labels.length + obstacles.length): number[] {
  const placed: LabelBox[] = [...obstacles];
  return labels.map((box) => {
    let candidate = box;
    for (let step = 0; step < maxSteps && placed.some((p) => overlaps(candidate, p)); step++) {
      candidate = { ...candidate, y: candidate.y - candidate.h };
    }
    placed.push(candidate);
    return candidate.y;
  });
}

export interface DrawnMeasurement {
  m: Measurement;
  geometry: MeasurementGeometry;
}

interface Props {
  items: DrawnMeasurement[];
  /** The one picked in the card: drawn on top, bolder, with its name. */
  selectedKey: string | null;
  /** The image's natural size, i.e. the SVG viewBox. */
  size: { w: number; h: number };
  /** Name every label, not only the selected one. */
  showNames: boolean;
  onSelect: (key: string) => void;
  /** Where information marks hang (below these points); labels keep clear. */
  pinAnchors?: Point[];
}

/**
 * Measurements drawn over the photo, in the SVG of GuidanceOverlay (image
 * pixel space). Every item is labelled with its value, above its anchor
 * (information marks sit below it); the selected one, or all of them with
 * showNames, also with its key. Clicking a measurement selects it.
 */
export function MeasurementLayer({ items, selectedKey, size, showNames, onSelect, pinAnchors = [] }: Props) {
  // Scale strokes and text with the photo, so they read the same on a
  // small upload and a full-resolution camera frame.
  const unit = Math.max(size.w, size.h) / 400;
  // Drawn last = on top; laid out first = keeps its natural position.
  const ordered = [...items].sort((a, b) => Number(a.m.key === selectedKey) - Number(b.m.key === selectedKey));
  const style = (m: Measurement) => {
    const selected = m.key === selectedKey;
    const r = unit * (selected ? 3 : 2);
    const fontSize = unit * (selected ? 10 : 8);
    const label = selected || showNames ? `${m.key}: ${formatMeasurementValue(m)}` : formatMeasurementValue(m);
    return { selected, r, fontSize, label };
  };
  const byPriority = [...ordered].reverse();
  // A pin is about two label-heights tall, hanging just below its anchor.
  const pinSize = unit * 8 * 2.4;
  const baselines = layoutLabels(
    byPriority.map(({ m, geometry }) => {
      const s = style(m);
      return estimateLabelBox(s.label, geometry.anchor[0], geometry.anchor[1] - s.r * 2, s.fontSize);
    }),
    pinAnchors.map(([x, y]) => ({ x, y: y + pinSize / 2, w: pinSize, h: pinSize })),
  );
  const baselineOf = new Map(byPriority.map((d, i) => [d.m.key, baselines[i]]));

  return (
    <g aria-label={`${items.length} pengukuran`}>
      {ordered.map(({ m, geometry }) => {
        const { selected, r, fontSize, label } = style(m);
        const stroke = unit * (selected ? 2.5 : 1.2);
        const dash = m.proxy ? PROXY_DASH.split(' ').map((n) => Number(n) * unit).join(' ') : undefined;
        return (
          <g
            key={m.key}
            opacity={selectedKey && !selected ? 0.55 : 1}
            onClick={() => onSelect(m.key)}
            className="cursor-pointer"
            style={{ pointerEvents: 'visiblePainted' }}
          >
            <title>{`${m.key}: ${formatMeasurementValue(m)}${m.proxy ? ' (proxy)' : ''}`}</title>
            {geometry.kind !== 'points' && (
              <polyline
                points={geometry.points.map(([x, y]) => `${x},${y}`).join(' ')}
                fill="none"
                stroke={COLOUR}
                strokeWidth={stroke}
                strokeDasharray={dash}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {geometry.points.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={r} fill={COLOUR} stroke={HALO} strokeWidth={unit * 0.6} />
            ))}
            <text
              x={geometry.anchor[0]}
              y={baselineOf.get(m.key)}
              fontSize={fontSize}
              textAnchor="middle"
              fill={COLOUR}
              stroke={HALO}
              strokeWidth={fontSize / 4}
              paintOrder="stroke"
              fontWeight={selected ? 700 : 600}
            >
              {label}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/** Legend entries for the measurement layer. */
export function MeasurementLegend() {
  return (
    <>
      <li className="flex items-center gap-1.5">
        <span className="inline-block h-0 w-5 border-t-2" style={{ borderColor: COLOUR }} />
        Pengukuran
      </li>
      <li className="flex items-center gap-1.5">
        <span className="inline-block h-0 w-5 border-t-2" style={{ borderColor: COLOUR, borderStyle: 'dashed' }} />
        Pengukuran proxy
      </li>
    </>
  );
}
