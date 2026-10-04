import { afterEach, describe, expect, it, vi } from 'vitest';
import { deleteApplication, getPipelineConfig, listApplications, saveApplication } from './api';

const stub = (body: unknown, status = 200) => {
  const f = vi.fn<typeof fetch>(async () => new Response(JSON.stringify(body), { status }));
  vi.stubGlobal('fetch', f);
  return f;
};
afterEach(() => vi.unstubAllGlobals());

describe('applications api', () => {
  it('lists applications only on success', async () => {
    stub({ success: true, data: [{ key: 'kiosk' }] });
    expect(await listApplications()).toEqual([{ key: 'kiosk' }]);
    stub({ success: false, data: [] });
    expect(await listApplications()).toBeNull();
  });

  it('saves with POST or PUT and reports acceptance', async () => {
    const f = stub({}, 200);
    const input = { key: 'k', name: 'K', description: '', channelType: 'Kiosk' };
    expect(await saveApplication(input, false)).toBe(true);
    expect(f.mock.calls[0][1]?.method).toBe('POST');
    stub({}, 400);
    expect(await saveApplication(input, true)).toBe(false);
  });

  it('deletes by encoded key', async () => {
    const f = stub({});
    await deleteApplication('a/b');
    expect(f.mock.calls[0][0]).toBe('/api/reference/applications/a%2Fb');
  });

  it('reads pipeline config by brand and application', async () => {
    const f = stub({ success: true, config: { formEnabled: false } });
    expect(await getPipelineConfig('b 1', 'a')).toEqual({ formEnabled: false });
    expect(f.mock.calls[0][0]).toBe('/api/pipeline-config?brandId=b%201&applicationId=a');
  });
});
