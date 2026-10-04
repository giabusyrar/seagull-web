'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/auth-client';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setLoading(true);
    setError('');

    try {
      const data = await login(username, password);

      if (data.ok && data.success) {
        if (data.token) {
          localStorage.setItem('falcon_session_token', data.token);
        }
        router.push('/');
        router.refresh();
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40 px-4 font-sans text-foreground">
      <div className="relative w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-xs">
        <div className="flex flex-col items-center space-y-1.5 text-center">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm tracking-wide shadow-2xs">
            <span>SG</span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-beak border-2 border-card" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Seagull<span className="text-beak ml-0.5">.</span>
          </h1>
          <p className="text-xs text-muted-foreground text-center max-w-xs leading-relaxed">
            Secure Enterprise API Gateway for Unified Layer Linking
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">
              Username
            </label>
            <input
              type="text"
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
              disabled={loading}
              required
            />
          </div>

          {error && (
            <div className="rounded-md border border-destructive/20 bg-destructive/10 p-2.5 text-xs text-destructive">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-md bg-primary py-2 text-xs font-medium text-primary-foreground transition hover:opacity-90 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50 mt-1 cursor-pointer"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
