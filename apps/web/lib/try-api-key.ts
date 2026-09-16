// API keys are only readable at creation. To keep Try & Send usable right after
// creating a key, the new key is remembered for the current browser tab only
// (sessionStorage is cleared when the tab closes and never leaves the browser).

const STORAGE_KEY = 'seagull.tryApiKey';

export function rememberTryApiKey(key: string): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, key);
  } catch {
    // Storage unavailable (private mode, blocked site data): Try & Send falls
    // back to a manually entered header.
  }
}

export function recallTryApiKey(): string {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}
