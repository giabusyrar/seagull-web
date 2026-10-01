import { afterEach, describe, expect, it, vi } from 'vitest';
import { assetRequests, groupByName, type ModelAsset } from './useModelAssets';

const asset = (over: Partial<ModelAsset> = {}): ModelAsset => ({
  id: 'a1',
  name: 'face_landmarker',
  s3_key: 'model-mirror/assets/face_landmarker/face_landmarker.task',
  original_filename: 'face_landmarker.task',
  size_bytes: 3758596,
  sha256: '64184e229b263107bc2b804c6625db1341ff2bb731874b0bcc2fe6544e0bc9ff',
  label: 'float16 v1',
  uploaded_at: '2026-10-01T08:02:22Z',
  active: true,
  ...over,
});

afterEach(() => vi.unstubAllGlobals());

describe('groupByName', () => {
  it('gathers every version of a name, newest first', () => {
    const groups = groupByName([
      asset({ id: 'old', active: false, uploaded_at: '2026-09-01T00:00:00Z' }),
      asset({ id: 'new', active: true, uploaded_at: '2026-10-01T00:00:00Z' }),
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0].name).toBe('face_landmarker');
    expect(groups[0].versions.map((v) => v.id)).toEqual(['new', 'old']);
  });

  it('reports the active version, and reports when there is none', () => {
    expect(groupByName([asset()])[0].activeId).toBe('a1');
    expect(groupByName([asset({ active: false })])[0].activeId).toBeNull();
  });

  it('keeps names apart', () => {
    const groups = groupByName([asset(), asset({ id: 'b', name: 'other_model' })]);
    expect(groups.map((g) => g.name).sort()).toEqual(['face_landmarker', 'other_model']);
  });
});

describe('the requests the panel makes', () => {
  function captureFetch(status = 200, body: unknown = {}) {
    const fn = vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
    });
    vi.stubGlobal('fetch', fn);
    return fn;
  }

  it('lists from the proxy path, which attaches the key server-side', async () => {
    const fn = captureFetch(200, { assets: [asset()] });
    await assetRequests.list();
    expect(fn.mock.calls[0][0]).toBe('/api/vision-worker/assets');
  });

  it('uploads as multipart, under the name the workers fetch', async () => {
    const fn = captureFetch(200, {});
    const file = new File(['x'], 'face_landmarker.task');
    await assetRequests.upload('face_landmarker', file, { label: 'float16 v2', activate: true });
    const [url, init] = fn.mock.calls[0];
    expect(url).toBe('/api/vision-worker/assets/face_landmarker');
    expect(init.method).toBe('POST');
    const body = init.body as FormData;
    expect(body.get('file')).toBe(file);
    expect(body.get('label')).toBe('float16 v2');
    expect(body.get('activate')).toBe('true');
  });

  it('omits activate when the uploader did not ask for it', async () => {
    const fn = captureFetch(200, {});
    await assetRequests.upload('x', new File(['x'], 'x'), {});
    expect((fn.mock.calls[0][1].body as FormData).get('activate')).toBeNull();
  });

  it('activates a version by id', async () => {
    const fn = captureFetch(200, {});
    await assetRequests.activate('face_landmarker', 'a1');
    const [url, init] = fn.mock.calls[0];
    expect(url).toBe('/api/vision-worker/assets/face_landmarker/active');
    expect(init.method).toBe('PUT');
    expect(JSON.parse(init.body)).toEqual({ assetId: 'a1' });
  });

  it('deactivates without a body', async () => {
    const fn = captureFetch(200, {});
    await assetRequests.deactivate('face_landmarker');
    expect(fn.mock.calls[0][1].method).toBe('DELETE');
  });

  it('reads history per name', async () => {
    const fn = captureFetch(200, { history: [] });
    await assetRequests.history('face_landmarker');
    expect(fn.mock.calls[0][0]).toBe('/api/vision-worker/assets/face_landmarker/history');
  });

  it("passes the backend's own reason through, rather than a generic failure", async () => {
    captureFetch(400, { detail: '0000 is not a version of face_landmarker' });
    await expect(assetRequests.activate('face_landmarker', '0000')).rejects.toThrow(
      '0000 is not a version of face_landmarker',
    );
  });

  it('escapes a name that would otherwise change the path', async () => {
    const fn = captureFetch(200, { history: [] });
    await assetRequests.history('a/b');
    expect(fn.mock.calls[0][0]).toBe('/api/vision-worker/assets/a%2Fb/history');
  });
});
