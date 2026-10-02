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
