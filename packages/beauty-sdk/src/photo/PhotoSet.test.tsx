import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BeautyProvider } from '../react/BeautyProvider';
import { PhotoSet } from './PhotoSet';

// jsdom does not implement object URLs.
beforeEach(() => {
  URL.createObjectURL = vi.fn(() => 'blob:test');
  URL.revokeObjectURL = vi.fn();
});
afterEach(cleanup);

const file = new File([new Uint8Array(3)], 'l.jpg', { type: 'image/jpeg' });
const wrap = (ui: React.ReactNode) => render(<BeautyProvider baseUrl="/x" locale="en">{ui}</BeautyProvider>);

describe('PhotoSet', () => {
  it('renders one slot per view with stable parts', () => {
    const { container } = wrap(<PhotoSet photos={{}} onChange={() => {}} views={['left', 'right']} />);
    expect(container.querySelectorAll('[data-bsdk-part="slot"]')).toHaveLength(2);
    expect(container.querySelector('[data-bsdk-part="root"]')).not.toBeNull();
  });

  it('applies brand classNames per part on top of its own', () => {
    const { container } = wrap(<PhotoSet photos={{}} onChange={() => {}} views={['left']} className="brand-root" classNames={{ slot: 'brand-slot' }} />);
    expect(container.querySelector('[data-bsdk-part="root"]')!.className).toContain('brand-root');
    expect(container.querySelector('[data-bsdk-part="slot"]')!.className).toMatch(/brand-slot/);
    expect(container.querySelector('[data-bsdk-part="slot"]')!.className).toMatch(/bsdk:/);
  });

  it('reports a chosen file for its view', () => {
    const onChange = vi.fn();
    const { container } = wrap(<PhotoSet photos={{}} onChange={onChange} views={['left']} />);
    fireEvent.change(container.querySelector('input[type=file]')!, { target: { files: [file] } });
    expect(onChange).toHaveBeenCalledWith('left', file);
  });

  it('removes a photo', () => {
    const onChange = vi.fn();
    wrap(<PhotoSet photos={{ left: file }} onChange={onChange} views={['left']} />);
    fireEvent.click(screen.getByRole('button', { name: 'Remove Left ¾ photo' }));
    expect(onChange).toHaveBeenCalledWith('left', null);
  });

  it('lets the brand replace a slot and keep the default', () => {
    wrap(<PhotoSet photos={{}} onChange={() => {}} views={['left']} renderSlot={(s, Default) => <div data-testid="custom">{s.view}{Default}</div>} />);
    expect(screen.getByTestId('custom').textContent).toContain('left');
  });

  it('uses the message dictionary', () => {
    wrap(<PhotoSet photos={{}} onChange={() => {}} views={['left']} />);
    expect(screen.getByText('Turn to your left')).toBeTruthy();
  });
});

describe('PhotoSet fixes', () => {
  it('keeps a live preview URL under StrictMode', () => {
    let n = 0;
    const revoked: string[] = [];
    URL.createObjectURL = vi.fn(() => `blob:${++n}`);
    URL.revokeObjectURL = vi.fn((u: string) => {
      revoked.push(u);
    });
    const { container } = render(
      <React.StrictMode>
        <BeautyProvider baseUrl="/x" locale="en">
          <PhotoSet photos={{ left: file }} onChange={() => {}} views={['left']} />
        </BeautyProvider>
      </React.StrictMode>,
    );
    const src = container.querySelector('img')!.getAttribute('src')!;
    expect(src).toMatch(/^blob:/);
    expect(revoked).not.toContain(src);
  });

  it('does not force the camera on phones', () => {
    const { container } = wrap(<PhotoSet photos={{}} onChange={() => {}} views={['left']} />);
    expect(container.querySelector('input[type=file]')!.hasAttribute('capture')).toBe(false);
  });

  it('exposes every rendered part and applies classNames.root', () => {
    const { container } = wrap(<PhotoSet photos={{}} onChange={() => {}} views={['left']} classNames={{ root: 'brand-r' }} />);
    for (const part of ['root', 'header', 'title', 'why', 'grid', 'item', 'slot', 'label', 'hint']) {
      expect(container.querySelector(`[data-bsdk-part="${part}"]`), part).not.toBeNull();
    }
    expect(container.querySelector('[data-bsdk-part="root"]')!.className).toContain('brand-r');
  });

  it('disables both buttons and dims remove', () => {
    wrap(<PhotoSet photos={{ left: file }} onChange={() => {}} views={['left']} disabled />);
    const remove = screen.getByRole('button', { name: 'Remove Left ¾ photo' }) as HTMLButtonElement;
    const slot = screen.getByRole('button', { name: 'Replace Left ¾ photo' }) as HTMLButtonElement;
    expect(remove.disabled).toBe(true);
    expect(slot.disabled).toBe(true);
    expect(remove.className).toContain('bsdk:opacity-50');
  });
});
