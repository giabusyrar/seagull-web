import { describe, expect, it } from 'vitest';
import { layoutCallouts, type Callout } from './MeasurementOverlay';

const view = { x: 0, y: 0, w: 1000, h: 1000 };
const drawing = { x0: 300, x1: 700 };
const gap = 10;
const c = (x: number, y: number, w = 100, h = 20): Callout => ({ anchor: [x, y], w, h });

const overlaps = (a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

describe('layoutCallouts', () => {
  it('puts each label beside the drawing on its anchor side, never over it', () => {
    const [l, r] = layoutCallouts([c(350, 500), c(650, 500)], drawing, view, gap);
    expect(l.side).toBe('left');
    expect(l.x + 100).toBeLessThanOrEqual(drawing.x0);
    expect(r.side).toBe('right');
    expect(r.x).toBeGreaterThanOrEqual(drawing.x1);
  });

  it('keeps a label at its anchor height when it has room', () => {
    const [p] = layoutCallouts([c(350, 500)], drawing, view, gap);
    expect(p.y).toBe(490);
  });

  it('stacks labels on one side without touching, in anchor order', () => {
    const items = [c(400, 500), c(400, 505), c(400, 495)];
    const placed = layoutCallouts(items, drawing, view, gap);
    const boxes = placed.map((p, i) => ({ x: p.x, y: p.y, w: items[i].w, h: items[i].h }));
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) expect(overlaps(boxes[i], boxes[j])).toBe(false);
    // Anchor order top to bottom: 495, 500, 505.
    expect(placed[2].y).toBeLessThan(placed[0].y);
    expect(placed[0].y).toBeLessThan(placed[1].y);
  });

  it('splits midline labels between the two sides', () => {
    const placed = layoutCallouts([c(500, 300), c(500, 400), c(500, 500), c(500, 600)], drawing, view, gap);
    expect(placed.filter((p) => p.side === 'left')).toHaveLength(2);
    expect(placed.filter((p) => p.side === 'right')).toHaveLength(2);
  });

  it('keeps labels inside the visible part of the photo', () => {
    const zoomed = { x: 250, y: 400, w: 500, h: 200 };
    const items = [c(400, 590), c(400, 595), c(400, 599)];
    for (const p of layoutCallouts(items, drawing, zoomed, gap)) {
      expect(p.x).toBeGreaterThanOrEqual(zoomed.x);
      expect(p.y + 20).toBeLessThanOrEqual(zoomed.y + zoomed.h);
    }
  });
});
