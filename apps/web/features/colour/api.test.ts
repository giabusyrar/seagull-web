import { describe, expect, it, vi } from 'vitest';
import { analyzeColour, fetchColourCatalog } from './api';

const endpoint = (key: string, route: string) => `/core/${key}-engine${route}`;
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

describe('analyzeColour', () => {
  it('posts the photo and answers as form data', async () => {
    const doFetch = vi.fn(async () => json({ ok: 1 }));
    const image = new File(['x'], 'face.jpg');
    const out = await analyzeColour(endpoint, { image, hijab: true, hairVisible: false }, doFetch);
    expect(out).toEqual({ ok: 1 });
    const [url, init] = doFetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('/core/colour-engine/analyze');
    expect(init.method).toBe('POST');
    const fd = init.body as FormData;
    expect(fd.get('hijab')).toBe('true');
    expect(fd.get('hairVisible')).toBe('false');
    expect((fd.get('image') as File).name).toBe('face.jpg');
  });

  it('throws the API error of a failed response', async () => {
    const doFetch = vi.fn(async () => json({ code: 'no_face', error: 'No face found' }, 422));
    await expect(analyzeColour(endpoint, { image: new File([], 'f'), hijab: false, hairVisible: true }, doFetch)).rejects.toEqual({
      status: 422,
      code: 'no_face',
      message: 'No face found',
    });
  });
});

describe('fetchColourCatalog', () => {
  it('gets the catalog route', async () => {
    const doFetch = vi.fn(async () => json({ catalog: {} }));
    expect(await fetchColourCatalog(endpoint, doFetch)).toEqual({ catalog: {} });
    expect(doFetch).toHaveBeenCalledWith('/core/colour-engine/catalog');
  });
});
