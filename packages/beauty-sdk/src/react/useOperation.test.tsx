import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useOperation } from './useOperation';

afterEach(cleanup);

describe('useOperation', () => {
  it('goes idle → loading → success', async () => {
    const { result } = renderHook(() => useOperation(async () => 42, 'k1'));
    expect(result.current.status).toBe('idle');
    await act(() => result.current.run());
    expect(result.current).toMatchObject({ status: 'success', data: 42, error: null });
  });

  it('reports an error', async () => {
    const boom = new Error('boom');
    const { result } = renderHook(() => useOperation(async () => { throw boom; }, 'k1'));
    await act(() => result.current.run());
    expect(result.current).toMatchObject({ status: 'error', data: null, error: boom });
  });

  it('hides a result once the input changes', async () => {
    const { result, rerender } = renderHook(({ k }) => useOperation(async () => k, k), { initialProps: { k: 'a' } });
    await act(() => result.current.run());
    expect(result.current.data).toBe('a');
    rerender({ k: 'b' });
    expect(result.current).toMatchObject({ status: 'idle', data: null });
  });

  it('aborts the previous run and never reports the abort', async () => {
    const signals: AbortSignal[] = [];
    const fn = vi.fn((signal: AbortSignal) => {
      signals.push(signal);
      return new Promise<number>((resolve, reject) => {
        signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
        if (signals.length === 2) resolve(2);
      });
    });
    const { result } = renderHook(() => useOperation(fn, 'k'));
    act(() => { void result.current.run(); });
    await act(() => result.current.run());
    expect(signals[0].aborted).toBe(true);
    await waitFor(() => expect(result.current).toMatchObject({ status: 'success', data: 2 }));
  });

  it('aborts on unmount', () => {
    let seen: AbortSignal | undefined;
    const { result, unmount } = renderHook(() => useOperation((s) => { seen = s; return new Promise<never>(() => {}); }, 'k'));
    act(() => { void result.current.run(); });
    unmount();
    expect(seen?.aborted).toBe(true);
  });
});
