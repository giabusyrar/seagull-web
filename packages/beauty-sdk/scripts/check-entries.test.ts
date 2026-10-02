import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
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

  describe('one copy of each module across entries', () => {
    const entries = ['client/index.mjs', 'server/index.mjs', 'react/index.mjs', 'photo/index.mjs'];
    const count = (needle: RegExp) => entries.filter((f) => needle.test(read(f)));

    it('only /react creates the React context', () => {
      expect(count(/createContext\(/)).toEqual(['react/index.mjs']);
    });

    it('only /client defines BeautyApiError', () => {
      expect(count(/BeautyApiError = class|class BeautyApiError/)).toEqual(['client/index.mjs']);
    });

    it('/photo imports /react through the package subpath', () => {
      expect(read('photo/index.mjs')).toMatch(/from\s*["']@gateway-experience\/beauty-sdk\/react["']/);
    });

    it('/react imports /client through the package subpath', () => {
      expect(read('react/index.mjs')).toMatch(/from\s*["']@gateway-experience\/beauty-sdk\/client["']/);
    });
  });

  it('every file named in package.json exports exists', () => {
    const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
    const files = Object.values(pkg.exports).flatMap((v) => (typeof v === 'string' ? [v] : Object.values(v as Record<string, string>)));
    for (const f of files) expect(existsSync(path.join(root, f)), f).toBe(true);
  });

  it('ships the stylesheet', () => {
    expect(read('styles.css').length).toBeGreaterThan(0);
  });

  it('pulls in no three.js anywhere yet', () => {
    for (const f of ['client/index.mjs', 'server/index.mjs', 'react/index.mjs', 'photo/index.mjs']) expect(read(f)).not.toMatch(/["']three["']/);
  });
});
