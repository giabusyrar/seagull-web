import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';

const root = path.resolve(import.meta.dirname, '..');
let css = '';

beforeAll(() => {
  execSync('npm run build:css', { cwd: root, stdio: 'pipe' });
  css = readFileSync(path.join(root, 'dist/styles.css'), 'utf8');
}, 60_000);

describe('dist/styles.css', () => {
  it('puts every rule inside the bsdk layer', () => {
    expect(css).toMatch(/@layer bsdk/);
  });

  it('emits prefixed utilities used by components', () => {
    expect(css).toContain('.bsdk\\:bg-primary');
  });

  it('reads colours from the brand-overridable variables', () => {
    expect(css).toContain('var(--bsdk-primary)');
    expect(css).toMatch(/--bsdk-primary:/);
  });

  it('ships no global reset', () => {
    expect(css).not.toMatch(/(^|[},])\s*html\s*[,{]/);
    expect(css).not.toMatch(/\*,\s*:after,\s*:before|\*,::after,::before/);
  });
});
