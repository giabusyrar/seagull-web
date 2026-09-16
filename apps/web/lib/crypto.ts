import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

function getRawSecret(): string {
  let secret = process.env.ENCRYPTION_KEY || process.env.SECRET_KEY || process.env.APP_ENCRYPTION_KEY;
  if (!secret) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = require('fs');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const path = require('path');
      const candidates = [
        path.resolve(process.cwd(), '.env.local'),
        path.resolve(process.cwd(), '.env'),
        path.resolve(process.cwd(), 'frontend', '.env.local'),
        path.resolve(process.cwd(), 'frontend', '.env'),
        path.resolve(process.cwd(), '../.env.local'),
        path.resolve(process.cwd(), '../.env'),
        path.resolve(process.cwd(), '../../.env.local'),
        path.resolve(process.cwd(), '../../.env'),
      ];
      for (const filepath of candidates) {
        if (fs.existsSync(filepath)) {
          const content = fs.readFileSync(filepath, 'utf8');
          for (const line of content.split('\n')) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
              const parts = trimmed.split('=');
              if (parts.length >= 2) {
                const key = parts[0].trim();
                const val = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
                if ((key === 'ENCRYPTION_KEY' || key === 'SECRET_KEY' || key === 'APP_ENCRYPTION_KEY') && val) {
                  secret = val;
                  process.env[key] = val;
                  break;
                }
              }
            }
          }
          if (secret) break;
        }
      }
    } catch {
      // fs reading optional
    }
  }

  if (!secret) {
    throw new Error('ENCRYPTION_KEY environment variable is required. Please set ENCRYPTION_KEY in your environment / .env file.');
  }

  return secret;
}

// Helper to get 32-byte key from ENCRYPTION_KEY env var
function getKey(): Buffer {
  const secret = getRawSecret();
  // Hash the secret to ensure it is exactly 32 bytes (256 bits)
  return crypto.createHash('sha256').update(secret).digest();
}

function base64UrlEncode(str: string | Buffer): string {
  return (typeof str === 'string' ? Buffer.from(str) : str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

/**
 * Generates an HS256 JWT string compatible with Go Admin JWT parser.
 */
export function generateJwt(payload: { username: string; role: string }): string {
  const secret = getRawSecret();
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = base64UrlEncode(
    JSON.stringify({
      username: payload.username,
      role: payload.role,
      iat: now,
      exp: now + 72 * 60 * 60, // 72 hours
    })
  );

  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${fullPayload}`)
    .digest();

  return `${header}.${fullPayload}.${base64UrlEncode(signature)}`;
}

/**
 * Verifies an HS256 JWT string compatible with Go Admin JWT parser.
 */
export function verifyJwt(token: string): { username: string; role: string } | null {
  try {
    const secret = getRawSecret();
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;
    const expectedSig = base64UrlEncode(
      crypto.createHmac('sha256', secret).update(`${header}.${payload}`).digest()
    );
    if (signature !== expectedSig) return null;

    const decodedPayload = JSON.parse(base64UrlDecode(payload));
    if (decodedPayload.exp && Math.floor(Date.now() / 1000) > decodedPayload.exp) {
      return null;
    }
    return { username: decodedPayload.username, role: decodedPayload.role };
  } catch {
    return null;
  }
}

/**
 * Encrypts a string using AES-256-GCM.
 * Returns a colon-separated string: iv:authTag:encryptedContent
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(12);
  const key = getKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts a colon-separated string: iv:authTag:encryptedContent using AES-256-GCM.
 */
export function decrypt(encryptedText: string): string {
  const parts = encryptedText.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted text format. Expected iv:authTag:ciphertext');
  }
  
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = Buffer.from(parts[2], 'hex');
  
  const key = getKey();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, undefined, 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// OWASP-recommended minimum for PBKDF2-HMAC-SHA512 (2023 cheat sheet).
const PBKDF2_ITERATIONS = 210_000;

/**
 * Hashes a password using PBKDF2 with a random salt.
 * Returns iterations:salt:hash — the iteration count travels with the hash
 * so a future increase doesn't invalidate hashes created under the old count.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, 64, 'sha512').toString('hex');
  return `${PBKDF2_ITERATIONS}:${salt}:${hash}`;
}

/**
 * Verifies a password against a stored PBKDF2 hash, using the iteration
 * count embedded in the hash rather than assuming the current default.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 3) {
    return false;
  }
  const [iterationsStr, salt, hash] = parts;
  const iterations = Number.parseInt(iterationsStr, 10);
  if (!Number.isFinite(iterations) || iterations <= 0) {
    return false;
  }
  const verifyHash = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512');
  const storedHashBuffer = Buffer.from(hash, 'hex');
  if (verifyHash.length !== storedHashBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(verifyHash, storedHashBuffer);
}

/**
 * Constant-time string comparison for secrets (bearer tokens, etc.).
 * Returns false (not a throw) on length mismatch — a length-only timing
 * signal is an accepted, much smaller leak than the alternative.
 */
export function timingSafeEqualStrings(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}
