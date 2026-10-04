// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useSkinAssessment } from './useSkinAssessment';

const config = { gatewayUrl: 'https://gw.test', brandId: 'b', applicationId: 'a' };
afterEach(() => vi.unstubAllGlobals());

describe('useSkinAssessment', () => {
  it('evaluates through the gateway by default', async () => {
    const f = vi.fn<typeof fetch>(async () => new Response('{"id":"as1"}'));
    vi.stubGlobal('fetch', f);
    const { result } = renderHook(() => useSkinAssessment(config));
    await act(() => result.current.evaluate('s', {} as never));
    expect(f.mock.calls[0][0]).toBe('https://gw.test/core/form-engine/survey/s/evaluate');
    expect(result.current.result).toEqual({ id: 'as1' });
    expect(result.current.isLoading).toBe(false);
  });

  it('uses an injected evaluator and surfaces its error', async () => {
    const evaluator = { evaluateAssessment: vi.fn(async () => Promise.reject(new Error('down'))) };
    const { result } = renderHook(() => useSkinAssessment({ ...config, evaluator }));
    await act(async () => {
      await expect(result.current.evaluate('s', {} as never)).rejects.toThrow('down');
    });
    expect(evaluator.evaluateAssessment).toHaveBeenCalledWith('s', {});
    expect(result.current.error?.message).toBe('down');
  });
});
