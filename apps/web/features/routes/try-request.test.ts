import { describe, expect, it } from 'vitest';
import type { ApiClientRequest, KeyValuePair } from '@/types/api-client';
import { buildTryRequest } from './try-request';

const kv = (key: string, value: string, enabled = true): KeyValuePair => ({ id: key, key, value, enabled }) as KeyValuePair;
const req = (over: Partial<ApiClientRequest> = {}): ApiClientRequest => ({
  id: 'r',
  name: 'r',
  method: 'GET',
  url: 'http://gw/items/:id',
  params: [],
  headers: [],
  body: '',
  bodyType: 'json',
  ...over,
});

describe('buildTryRequest', () => {
  it('fills path placeholders and appends the rest as query', () => {
    const { url } = buildTryRequest(
      req({ url: 'http://gw/a/:id/b/{slot}/[x]?keep=1', params: [kv('id', 'a b'), kv('slot', '2'), kv('x', '3'), kv('q', 'v&w'), kv('off', '1', false), kv('empty', ' ')] }),
      [],
    );
    expect(url).toBe('http://gw/a/a%20b/b/2/3?keep=1&q=v%26w');
  });

  it('sends a JSON body with a default Content-Type', () => {
    const { init } = buildTryRequest(req({ method: 'POST', body: '{"a":1}', headers: [kv('X-A', '1')] }), []);
    expect(init).toEqual({ method: 'POST', headers: { 'X-A': '1', 'Content-Type': 'application/json; charset=UTF-8' }, body: '{"a":1}' });
  });

  it('keeps a Content-Type the user set', () => {
    const { init } = buildTryRequest(req({ method: 'PUT', body: 'x', headers: [kv('content-type', 'text/plain')] }), []);
    expect(init.headers).toEqual({ 'content-type': 'text/plain' });
  });

  it('sends no body for GET', () => {
    expect(buildTryRequest(req({ body: 'ignored' }), []).init.body).toBeUndefined();
  });

  it('builds multipart from body variables and drops any Content-Type', () => {
    const file = new File(['img'], 'face.jpg');
    const { init } = buildTryRequest(
      req({
        method: 'POST',
        body: '{"note":"from body"}',
        headers: [kv('Content-Type', 'application/json')],
        multipartFields: [{ key: 'image', file }] as ApiClientRequest['multipartFields'],
      }),
      [
        { key: 'image', fieldType: 'file' },
        { key: 'note', fieldType: 'text', value: 'default' },
        { key: 'other', fieldType: 'text', value: 'fallback' },
        { key: '', fieldType: 'text', value: 'skipped' },
      ],
    );
    expect(init.headers).toEqual({});
    const fd = init.body as FormData;
    expect((fd.get('image') as File).name).toBe('face.jpg');
    expect(fd.get('note')).toBe('from body');
    expect(fd.get('other')).toBe('fallback');
    expect([...fd.keys()]).toEqual(['image', 'note', 'other']);
  });

  it('names the collection environment unless already set', () => {
    expect(buildTryRequest(req(), [], 'staging').init.headers).toEqual({ 'X-Environment': 'staging', 'X-Collection-Environment': 'staging' });
    expect(buildTryRequest(req({ headers: [kv('X-Environment', 'prod')] }), [], 'staging').init.headers).toEqual({
      'X-Environment': 'prod',
      'X-Collection-Environment': 'staging',
    });
    expect(buildTryRequest(req(), []).init.headers).toEqual({});
  });
});
