/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup } from '@testing-library/react';
import { photosKey, usePhotoSet } from './usePhotoSet';

afterEach(cleanup);

const file = (name: string, size = 3) => new File([new Uint8Array(size)], name, { type: 'image/jpeg', lastModified: 1 });

describe('usePhotoSet', () => {
  it('sets and removes views', () => {
    const { result } = renderHook(() => usePhotoSet());
    act(() => result.current.set('front', file('f.jpg')));
    act(() => result.current.set('left', file('l.jpg')));
    expect(Object.keys(result.current.photos).sort()).toEqual(['front', 'left']);
    act(() => result.current.set('left', null));
    expect(Object.keys(result.current.photos)).toEqual(['front']);
  });

  it('changes key when a photo changes, and only then', () => {
    const { result } = renderHook(() => usePhotoSet({ front: file('f.jpg') }));
    const k1 = result.current.key;
    act(() => result.current.set('front', file('f.jpg')));
    expect(result.current.key).toBe(k1);
    act(() => result.current.set('front', file('g.jpg')));
    expect(result.current.key).not.toBe(k1);
  });

  it('clears everything', () => {
    const { result } = renderHook(() => usePhotoSet({ front: file('f.jpg') }));
    act(() => result.current.clear());
    expect(result.current.photos).toEqual({});
  });
});

describe('photosKey', () => {
  it('tells views apart', () => {
    expect(photosKey({ front: file('a.jpg') })).not.toBe(photosKey({ left: file('a.jpg') }));
  });
});
