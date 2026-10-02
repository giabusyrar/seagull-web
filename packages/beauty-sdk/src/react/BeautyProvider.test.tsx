import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { BeautyProvider, useBeauty } from './BeautyProvider';
import { format } from './messages';

afterEach(cleanup); // vitest globals are off, so testing-library does not auto-clean

function Probe({ k, vars }: { k: string; vars?: Record<string, string | number> }) {
  const { t, client } = useBeauty();
  return <span data-testid="out" data-has-client={String(!!client)}>{t(k, vars)}</span>;
}

describe('BeautyProvider', () => {
  it('serves the locale dictionary', () => {
    render(<BeautyProvider baseUrl="/api/beauty" locale="en"><Probe k="photo.front" /></BeautyProvider>);
    expect(screen.getByTestId('out').textContent).toBe('Front');
  });

  it('lets the brand override a key', () => {
    render(<BeautyProvider baseUrl="/api/beauty" messages={{ 'photo.front': 'Wajahmu' }}><Probe k="photo.front" /></BeautyProvider>);
    expect(screen.getByTestId('out').textContent).toBe('Wajahmu');
  });

  it('shows an unknown key as itself, so a missing text is visible', () => {
    render(<BeautyProvider baseUrl="/api/beauty"><Probe k="nope.missing" /></BeautyProvider>);
    expect(screen.getByTestId('out').textContent).toBe('nope.missing');
  });

  it('provides a client', () => {
    render(<BeautyProvider baseUrl="/api/beauty"><Probe k="photo.front" /></BeautyProvider>);
    expect(screen.getByTestId('out').dataset.hasClient).toBe('true');
  });

  it('keeps the client stable when messages is a fresh object each render', () => {
    const seen: unknown[] = [];
    function Capture() {
      const { client, t } = useBeauty();
      seen.push(client);
      return <span data-testid="out">{t('photo.front')}</span>;
    }
    const { rerender } = render(<BeautyProvider baseUrl="/api/beauty" messages={{ 'photo.front': 'A' }}><Capture /></BeautyProvider>);
    rerender(<BeautyProvider baseUrl="/api/beauty" messages={{ 'photo.front': 'B' }}><Capture /></BeautyProvider>);
    expect(screen.getByTestId('out').textContent).toBe('B');
    expect(seen.length).toBeGreaterThan(1);
    expect(new Set(seen).size).toBe(1);
  });

  it('throws a clear error outside the provider', () => {
    expect(() => render(<Probe k="photo.front" />)).toThrow(/BeautyProvider/);
  });
});

describe('format', () => {
  it('fills {name} placeholders and leaves unknown ones', () => {
    expect(format('Hi {name}, {x}', { name: 'Ana' })).toBe('Hi Ana, {x}');
  });
});
