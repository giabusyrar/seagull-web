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

  const abortable = (signal: AbortSignal) =>
    new Promise<number>((_, reject) => {
      signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
    });

  it('never reports an aborted rejection (reset)', async () => {
    const { result } = renderHook(() => useOperation(abortable, 'k'));
    let pending!: Promise<void>;
    act(() => { pending = result.current.run(); });
    expect(result.current.status).toBe('loading');
    await act(async () => {
      result.current.reset();
      await pending;
    });
    expect(result.current).toMatchObject({ status: 'idle', error: null });
  });

  it('never reports an aborted rejection (unmount) and logs no warning', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result, unmount } = renderHook(() => useOperation(abortable, 'k'));
    let pending!: Promise<void>;
    act(() => { pending = result.current.run(); });
    unmount();
    await pending;
    expect(errSpy).not.toHaveBeenCalled();
    errSpy.mockRestore();
  });

  it('never shows a slow result under a new key, but keeps it for the old one', async () => {
    let resolve!: (v: string) => void;
    const fn = () => new Promise<string>((r) => { resolve = r; });
    const { result, rerender } = renderHook(({ k }) => useOperation(fn, k), { initialProps: { k: 'a' } });
    let pending!: Promise<void>;
    act(() => { pending = result.current.run(); });
    rerender({ k: 'b' });
    await act(async () => {
      resolve('slow-a');
      await pending;
    });
    expect(result.current).toMatchObject({ status: 'idle', data: null });
    rerender({ k: 'a' });
    expect(result.current).toMatchObject({ status: 'success', data: 'slow-a' });
  });

  it('reset aborts the in-flight run and returns to idle', async () => {
    let seen: AbortSignal | undefined;
    const { result } = renderHook(() => useOperation((s) => { seen = s; return abortable(s); }, 'k'));
    let pending!: Promise<void>;
    act(() => { pending = result.current.run(); });
    expect(seen?.aborted).toBe(false);
    await act(async () => {
      result.current.reset();
      await pending;
    });
    expect(seen?.aborted).toBe(true);
    expect(result.current).toMatchObject({ status: 'idle', data: null, error: null });
  });
});
