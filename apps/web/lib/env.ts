// Required secrets the gateway must never silently run without.
// Fail loudly at boot instead of falling back to a known/guessable default.
const REQUIRED_ENV_VARS = ['ENCRYPTION_KEY', 'DATABASE_URL'] as const;

export function requireEnv(name: (typeof REQUIRED_ENV_VARS)[number]): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} environment variable is not set. Refusing to start.`);
  }
  return value;
}

export function assertRequiredEnv(): void {
  const missing = REQUIRED_ENV_VARS.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(', ')}. Refusing to start.`
    );
  }
}
