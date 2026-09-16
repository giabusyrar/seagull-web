// In-memory login lockout. Safe as module-scope state here (unlike
// per-request secrets) because this app runs as a single long-running
// process — see the "no module-level mutable state" rule in the design
// spec's §9, which is specifically about per-request data, not intentional
// shared state like this.
//
// Keyed by the *submitted* username string, checked before any DB lookup —
// this means lockout behavior is identical whether or not the username is
// real, so a lockout response can't be used to enumerate valid accounts.
//
// Known trade-off: an attacker who knows (or guesses) a real username can
// deliberately lock out that account by repeatedly failing on purpose. This
// is the standard trade-off of any account-based lockout scheme; mitigating
// it further (e.g. CAPTCHA, IP-based throttling) is out of scope for this
// pass.

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_MS = 15 * 60 * 1000;

// Bounds memory under a flood of distinct fake usernames. Once at capacity,
// new usernames aren't tracked (fail-open on tracking, auth check still
// runs) rather than growing unbounded.
const MAX_TRACKED_ENTRIES = 5000;

interface AttemptRecord {
  count: number;
  windowStartedAt: number;
  lockedUntil: number | null;
}

const attempts = new Map<string, AttemptRecord>();

function pruneExpired(now: number): void {
  for (const [key, record] of attempts) {
    const windowExpired = now - record.windowStartedAt > WINDOW_MS;
    const lockExpired = record.lockedUntil === null || now >= record.lockedUntil;
    if (windowExpired && lockExpired) {
      attempts.delete(key);
    }
  }
}

export interface RateLimitCheck {
  allowed: boolean;
  retryAfterSeconds?: number;
}

export function checkLoginRateLimit(username: string): RateLimitCheck {
  const now = Date.now();
  const record = attempts.get(username);

  if (!record) {
    return { allowed: true };
  }

  if (record.lockedUntil !== null) {
    if (now < record.lockedUntil) {
      return { allowed: false, retryAfterSeconds: Math.ceil((record.lockedUntil - now) / 1000) };
    }
    // Lockout expired — reset.
    attempts.delete(username);
    return { allowed: true };
  }

  return { allowed: true };
}

export function recordFailedLoginAttempt(username: string): void {
  const now = Date.now();
  pruneExpired(now);

  let record = attempts.get(username);
  if (!record || now - record.windowStartedAt > WINDOW_MS) {
    record = { count: 0, windowStartedAt: now, lockedUntil: null };
  }

  record.count += 1;
  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_MS;
  }

  if (attempts.size < MAX_TRACKED_ENTRIES || attempts.has(username)) {
    attempts.set(username, record);
  }
}

export function clearLoginAttempts(username: string): void {
  attempts.delete(username);
}
