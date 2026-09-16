import crypto from 'crypto';

const KEY_PREFIX = 'wpk_';
const KEY_BYTES = 32;
const RATE_LIMIT_WINDOW_MS = 60_000;

export function hashApiKey(plaintext: string): string {
  return crypto.createHash('sha256').update(plaintext).digest('hex');
}

export function generateApiKey(): { plaintext: string; hash: string; lastFour: string } {
  const raw = crypto.randomBytes(KEY_BYTES).toString('base64url');
  const plaintext = `${KEY_PREFIX}${raw}`;
  return { plaintext, hash: hashApiKey(plaintext), lastFour: plaintext.slice(-4) };
}

interface WindowState {
  windowStart: number;
  count: number;
}

const rateLimitState = new Map<string, WindowState>();

/**
 * In-memory fixed-window rate limiter (no cumulative total, resets every
 * 60s) - per-process, matching this app's single-VPS-instance assumption.
 * `now` is injectable for deterministic tests; production callers omit it.
 */
export function checkRateLimit(apiKeyId: string, limitPerMinute: number | null, now: number = Date.now()): boolean {
  if (limitPerMinute === null) return true;

  const state = rateLimitState.get(apiKeyId);
  if (!state || now - state.windowStart >= RATE_LIMIT_WINDOW_MS) {
    rateLimitState.set(apiKeyId, { windowStart: now, count: 1 });
    return true;
  }
  if (state.count >= limitPerMinute) {
    return false;
  }
  state.count += 1;
  return true;
}

export function _resetRateLimitStateForTests(): void {
  rateLimitState.clear();
}
