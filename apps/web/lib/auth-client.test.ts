import { afterEach, describe, expect, it, vi } from 'vitest';
import { checkSession, login, logout } from './auth-client';

const stub = (body: unknown, status = 200) => {
  const f = vi.fn<typeof fetch>(async () => new Response(JSON.stringify(body), { status }));
  vi.stubGlobal('fetch', f);
  return f;
};
afterEach(() => vi.unstubAllGlobals());

describe('auth client', () => {
  it('reports the session', async () => {
    stub({ authenticated: true });
    expect(await checkSession()).toBe(true);
    stub({});
    expect(await checkSession()).toBe(false);
  });

  it('posts credentials and returns the answer with the HTTP outcome', async () => {
    const f = stub({ success: false, message: 'bad' }, 401);
    expect(await login('u', 'p')).toEqual({ ok: false, success: false, message: 'bad' });
    expect(f.mock.calls[0][1]).toMatchObject({ method: 'POST', body: '{"username":"u","password":"p"}' });
  });

  it('logs out with DELETE', async () => {
    const f = stub({});
    await logout();
    expect(f).toHaveBeenCalledWith('/api/auth/login', { method: 'DELETE' });
  });
});
