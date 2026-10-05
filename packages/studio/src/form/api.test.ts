import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  MissingTenantError,
  deleteQuestionnaire,
  getQuestionnaireModel,
  listQuestionnaires,
  saveQuestionnaire,
} from './api';

afterEach(() => vi.unstubAllGlobals());

const stubFetch = (body: unknown = []) => {
  const f = vi.fn(async (_url: string, _init?: RequestInit) => new Response(JSON.stringify(body), { status: 200 }));
  vi.stubGlobal('fetch', f);
  return f;
};

describe('form api tenant', () => {
  it('refuses to list without a brand or application, and makes no request', async () => {
    const f = stubFetch();
    await expect(listQuestionnaires('', 'app')).rejects.toBeInstanceOf(MissingTenantError);
    await expect(listQuestionnaires('brand', '')).rejects.toBeInstanceOf(MissingTenantError);
    await expect(getQuestionnaireModel('code', '', '')).rejects.toBeInstanceOf(MissingTenantError);
    await expect(deleteQuestionnaire('code', ' ', 'app')).rejects.toBeInstanceOf(MissingTenantError);
    expect(f).not.toHaveBeenCalled();
  });

  it('scopes a list to the given tenant', async () => {
    const f = stubFetch([]);
    await listQuestionnaires('b 1', 'a1');
    expect(f.mock.calls[0][0]).toBe('/core/form-engine/survey?brand_id=b%201&application_id=a1');
  });

  it('saves under the questionnaire tenant, then the argument, and never a default', async () => {
    const f = stubFetch({});
    await saveQuestionnaire({ code: 'q', name: 'Q', brandId: 'own_b', applicationId: 'own_a' } as never, 'sel_b', 'sel_a');
    expect(JSON.parse(f.mock.calls[0][1]?.body as string)).toMatchObject({
      brand_id: 'own_b',
      application_id: 'own_a',
    });

    await saveQuestionnaire({ code: 'q', name: 'Q' } as never, 'sel_b', 'sel_a');
    expect(JSON.parse(f.mock.calls[1][1]?.body as string)).toMatchObject({
      brand_id: 'sel_b',
      application_id: 'sel_a',
    });

    await expect(saveQuestionnaire({ code: 'q', name: 'Q' } as never)).rejects.toBeInstanceOf(MissingTenantError);
    expect(f).toHaveBeenCalledTimes(2);
  });
});
