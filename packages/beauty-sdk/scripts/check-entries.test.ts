import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';

const root = path.resolve(import.meta.dirname, '..');
const read = (p: string) => readFileSync(path.join(root, 'dist', p), 'utf8');

beforeAll(() => {
  execSync('npm run build', { cwd: root, stdio: 'pipe' });
}, 180_000);

describe('entry boundaries', () => {
  it.each(['client/index.mjs', 'server/index.mjs'])('%s imports no React or Next', (f) => {
    expect(read(f)).not.toMatch(/from\s*["'](react|react-dom|next)(\/[^"']*)?["']/);
  });

  it.each(['react/index.mjs', 'photo/index.mjs'])('%s starts with "use client"', (f) => {
    expect(read(f).trimStart().startsWith('"use client"')).toBe(true);
  });

  it.each(['client/index.mjs', 'server/index.mjs'])('%s is not a client module', (f) => {
    expect(read(f).trimStart().startsWith('"use client"')).toBe(false);
  });

  it('ships the stylesheet', () => {
    expect(read('styles.css').length).toBeGreaterThan(0);
  });

  it('pulls in no three.js anywhere yet', () => {
    for (const f of ['client/index.mjs', 'server/index.mjs', 'react/index.mjs', 'photo/index.mjs']) expect(read(f)).not.toMatch(/["']three["']/);
  });
});
