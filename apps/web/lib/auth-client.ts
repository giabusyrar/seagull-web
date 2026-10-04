/**
 * Browser calls to the dashboard's own session route (/api/auth/login).
 */

/** Whether the current browser session is signed in. Rejects when the route cannot be read. */
export async function checkSession(): Promise<boolean> {
  const data = await (await fetch('/api/auth/login')).json();
  return Boolean(data.authenticated);
}

export interface LoginResult {
  ok: boolean;
  success?: boolean;
  token?: string;
  message?: string;
}

/** Signs in. `ok` is the HTTP outcome; the rest is the route's answer. */
export async function login(username: string, password: string): Promise<LoginResult> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  return { ...data, ok: res.ok };
}

export async function logout(): Promise<void> {
  await fetch('/api/auth/login', { method: 'DELETE' });
}
