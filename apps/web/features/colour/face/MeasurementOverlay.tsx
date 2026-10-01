'use client';

import React from 'react';
import { formatMeasurementValue, type Measurement, type MeasurementGeometry, type Point } from './faceTypes';

// Distinct from the guidance colours (blue / amber / red), so a measurement
// is never read as a makeup placement. Proxy measurements are dashed, the
// same distinction the card makes with its "proxy" badge.
const COLOUR = '#059669';
const HALO = '#ffffff';
const PROXY_DASH = '5 4';

// Layout-only estimate of a label's width per character, as a share of the
// font size, for the sans-serif labels below. It only sizes the label pill
// and decides spacing; nothing is measured with it.
const CHAR_WIDTH_EM = 0.6;

// Layout choice: an anchor within this share of the drawing's width from its
// centre counts as on the midline and may go to either side.
const MIDLINE_SHARE = 0.05;

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Callout {
  /** The point the leader line runs to. */
  anchor: Point;
  w: number;
  h: number;
}

export interface PlacedCallout {
  side: 'left' | 'right';
  /** Top-left of the label, image pixels. */
  x: number;
  y: number;
}

/**
 * Callout layout: labels sit in two columns at the left and right edges of
 * the visible photo, off the face, each joined to its measurement by a
 * leader line. A label takes the side its anchor is on (midline anchors go to
 * the side with fewer labels, then more room), and each column is stacked in
 * anchor order, so labels never touch and leaders run in order.
 */
export function layoutCallouts(callouts: Callout[], drawing: { x0: number; x1: number }, view: Box, gap: number): PlacedCallout[] {
  const mid = (drawing.x0 + drawing.x1) / 2;
  const midlineBand = (drawing.x1 - drawing.x0) * MIDLINE_SHARE;
  const room = { left: drawing.x0 - view.x, right: view.x + view.w - drawing.x1 };
  const sides: ('left' | 'right')[] = new Array(callouts.length);
  const count = { left: 0, right: 0 };

  // Off-centre anchors first, so the midline ones can balance the columns.
  const order = callouts.map((_, i) => i).sort((a, b) => Math.abs(callouts[b].anchor[0] - mid) - Math.abs(callouts[a].anchor[0] - mid));
  for (const i of order) {
    const dx = callouts[i].anchor[0] - mid;
    let side: 'left' | 'right';
    if (Math.abs(dx) > midlineBand) side = dx < 0 ? 'left' : 'right';
    else if (count.left !== count.right) side = count.left < count.right ? 'left' : 'right';
    else side = room.left >= room.right ? 'left' : 'right';
    sides[i] = side;
    count[side]++;
  }

  const placed: PlacedCallout[] = new Array(callouts.length);
  for (const side of ['left', 'right'] as const) {
    const column = callouts
      .map((c, i) => ({ c, i }))
      .filter(({ i }) => sides[i] === side)
      .sort((a, b) => a.c.anchor[1] - b.c.anchor[1]);
    const top = view.y + gap;
    const bottom = view.y + view.h - gap;
    // Down: each at its anchor's height, or just below the one above it.
    const ys: number[] = [];
    column.forEach(({ c }, k) => {
      const want = Math.max(top, c.anchor[1] - c.h / 2);
      ys.push(k === 0 ? want : Math.max(want, ys[k - 1] + column[k - 1].c.h + gap));
    });
    // Up: pull back inside the bottom edge without overlapping.
    for (let k = column.length - 1; k >= 0; k--) {
      const limit = k === column.length - 1 ? bottom - column[k].c.h : ys[k + 1] - gap - column[k].c.h;
      ys[k] = Math.max(top, Math.min(ys[k], limit));
    }
    // Columns at the photo's edges (hair and background), clear of the face.
    column.forEach(({ c, i }, k) => {
      const x = side === 'left' ? view.x + gap : view.x + view.w - gap - c.w;
      placed[i] = { side, x, y: ys[k] };
    });
  }
  return placed;
}

export interface DrawnMeasurement {
  m: Measurement;
  geometry: MeasurementGeometry;
}

interface Props {
  items: DrawnMeasurement[];
  /** The one picked: drawn on top, bolder, its label filled. */
  selectedKey: string | null;
  /** The image's natural size, i.e. the SVG viewBox. */
  size: { w: number; h: number };
  /** Label every measurement, not only the selected one. */
  showAll: boolean;
  onSelect: (key: string) => void;
  /** The label text; by default the key and the raw value. */
  labelOf?: (m: Measurement, selected: boolean) => string;
  /** How far the photo is zoomed in, so strokes and text keep their on-screen size. */
  zoom?: number;
  /** The part of the photo on screen (image pixels); labels stay inside it. */
  view?: Box;
}

const defaultLabel = (m: Measurement) => `${m.key}: ${formatMeasurementValue(m)}`;

/**
 * Measurements drawn over the photo, in the SVG of GuidanceOverlay (image
 * pixel space). Labels are callouts (layoutCallouts): a pill beside the
 * drawing with a leader line to its measurement. Only the selected item is
 * labelled, or every item with showAll. Clicking a line or a label selects it.
 */
export function MeasurementLayer({
  items,
  selectedKey,
  size,
  showAll,
  onSelect,
  labelOf = defaultLabel,
  zoom = 1,
  view = { x: 0, y: 0, w: size.w, h: size.h },
}: Props) {
  // Scale strokes and text with the photo, so they read the same on a
  // small upload and a full-resolution camera frame, and against the zoom.
  const unit = Math.max(size.w, size.h) / 400 / zoom;
  // Drawn last = on top.
  const ordered = [...items].sort((a, b) => Number(a.m.key === selectedKey) - Number(b.m.key === selectedKey));

  const labelled = ordered.filter(({ m }) => showAll || m.key === selectedKey);
  const pills = labelled.map(({ m, geometry }) => {
    const selected = m.key === selectedKey;
    const text = labelOf(m, selected);
    const fontSize = unit * (selected ? 8.5 : 7.5);
    return {
      key: m.key,
      selected,
      text,
      fontSize,
      anchor: geometry.anchor,
      w: text.length * fontSize * CHAR_WIDTH_EM + fontSize * 1.4,
      h: fontSize * 1.7,
    };
  });
  const xs = items.flatMap(({ geometry }) => geometry.points.map((p) => p[0]));
  const placed = layoutCallouts(pills, { x0: Math.min(...xs), x1: Math.max(...xs) }, view, unit * 4);

  return (
    <g aria-label={`${items.length} pengukuran`}>
      {ordered.map(({ m, geometry }) => {
        const selected = m.key === selectedKey;
        const r = unit * (selected ? 3 : 2);
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
          </g>
        );
      })}

      {pills.map((p, i) => {
        const { side, x, y } = placed[i];
        const edgeX = side === 'left' ? x + p.w : x;
        const midY = y + p.h / 2;
        return (
          <g
            key={`label-${p.key}`}
            onClick={() => onSelect(p.key)}
            className="cursor-pointer"
            style={{ pointerEvents: 'visiblePainted' }}
            opacity={selectedKey && !p.selected ? 0.85 : 1}
          >
            <polyline
              points={`${p.anchor[0]},${p.anchor[1]} ${edgeX + (side === 'left' ? unit * 3 : -unit * 3)},${midY} ${edgeX},${midY}`}
              fill="none"
              stroke={HALO}
              strokeWidth={unit * 2}
              strokeOpacity={0.7}
            />
            <polyline
              points={`${p.anchor[0]},${p.anchor[1]} ${edgeX + (side === 'left' ? unit * 3 : -unit * 3)},${midY} ${edgeX},${midY}`}
              fill="none"
              stroke={COLOUR}
              strokeWidth={unit * 0.9}
            />
            <circle cx={p.anchor[0]} cy={p.anchor[1]} r={unit * 1.6} fill={HALO} stroke={COLOUR} strokeWidth={unit * 0.9} />
            <rect
              x={x}
              y={y}
              width={p.w}
              height={p.h}
              rx={p.h / 2}
              fill={p.selected ? COLOUR : HALO}
              fillOpacity={p.selected ? 1 : 0.94}
              stroke={COLOUR}
              strokeWidth={unit * 0.8}
            />
            <text
              x={x + p.w / 2}
              y={midY}
              fontSize={p.fontSize}
              textAnchor="middle"
              dominantBaseline="central"
              fill={p.selected ? HALO : COLOUR}
              fontWeight={p.selected ? 700 : 600}
            >
              {p.text}
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
