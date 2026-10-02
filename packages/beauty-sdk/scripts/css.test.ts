import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';

/** One top-level statement (`body === null`) or block of a stylesheet. */
interface CssItem {
  prelude: string;
  body: string | null;
}

/**
 * Brace-depth scanner, not a full parser: splits CSS into the statements and
 * blocks at one nesting level (comments stripped). Strings/urls containing
 * braces or semicolons are not handled; Tailwind's output has none that matter.
 */
function walk(source: string): CssItem[] {
  const css = source.replace(/\/\*[\s\S]*?\*\//g, '');
  const items: CssItem[] = [];
  let depth = 0;
  let start = 0;
  let bodyStart = -1;
  for (let i = 0; i < css.length; i++) {
    const ch = css[i];
    if (ch === '{') {
      if (depth === 0) bodyStart = i + 1;
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0) {
        items.push({
          prelude: css.slice(start, bodyStart - 1).trim(),
          body: css.slice(bodyStart, i),
        });
        start = i + 1;
      }
    } else if (ch === ';' && depth === 0) {
      items.push({ prelude: css.slice(start, i).trim(), body: null });
      start = i + 1;
    }
  }
  const tail = css.slice(start).trim();
  if (tail) items.push({ prelude: tail, body: null });
  return items;
}

/** Every property name declared anywhere inside a block (nested at-rules too). */
function declaredProperties(body: string): string[] {
  const names: string[] = [];
  for (const item of walk(body)) {
    if (item.body !== null) names.push(...declaredProperties(item.body));
    else if (item.prelude.includes(':')) names.push(item.prelude.split(':')[0].trim());
  }
  return names;
}

/**
 * Top-level items that break the "everything lives in @layer bsdk" rule.
 * The only allowed exceptions are the two Tailwind v4 internals that cannot be
 * layered: `@property --tw-*` registrations and the `@layer properties`
 * fallback block holding only `--tw-*` custom properties.
 */
function layeringViolations(source: string): string[] {
  const bad: string[] = [];
  for (const { prelude, body } of walk(source)) {
    const label = `${prelude}${body === null ? ';' : ' {…}'}`;
    if (body === null) {
      const m = /^@layer\s+(.+)$/.exec(prelude);
      const names = m ? m[1].split(',').map((n) => n.trim()) : [];
      if (!(names.length > 0 && names.every((n) => /^bsdk(\.[\w-]+)*$/.test(n)))) bad.push(label);
    } else if (/^@layer\s+bsdk(\.[\w-]+)*$/.test(prelude)) {
      // inside the bsdk layer: fine
    } else if (/^@property\s+--tw-[\w-]+$/.test(prelude)) {
      // Tailwind internal registration
    } else if (prelude === '@layer properties') {
      const props = declaredProperties(body);
      if (!props.every((p) => p.startsWith('--tw-'))) bad.push(label);
    } else {
      bad.push(label);
    }
  }
  return bad;
}

/** Rules that would act as a global reset: html/body/:host, or `*` with real declarations. */
function resetViolations(source: string): string[] {
  const bad: string[] = [];
  const visit = (items: CssItem[]) => {
    for (const { prelude, body } of items) {
      if (body === null) continue;
      if (prelude.startsWith('@')) {
        visit(walk(body));
        continue;
      }
      const selectors = prelude.split(',').map((s) => s.trim());
      const props = declaredProperties(body);
      // Tailwind scopes its theme tokens on `:root,:host{--bsdk-*:…}` (inside
      // @layer bsdk.theme). That is token scoping, not a reset, so html/body/:host
      // are only a violation when the rule sets something other than custom
      // properties named --bsdk-* / --tw-*.
      const onlyOwnVariables = props.every((p) => p.startsWith('--bsdk-') || p.startsWith('--tw-'));
      if (selectors.some((s) => s === 'html' || s === 'body' || s === ':host')) {
        if (!onlyOwnVariables) bad.push(prelude);
      } else if (selectors.includes('*') && props.some((p) => !p.startsWith('--tw-'))) {
        bad.push(prelude);
      }
    }
  };
  visit(walk(source));
  return bad;
}

describe('css walker', () => {
  const compliant =
    '/* c */@layer bsdk.base, bsdk.theme, bsdk.utilities;' +
    '@layer bsdk.utilities{.bsdk\\:x{color:red}}' +
    '@property --tw-a{syntax:"*";inherits:false}' +
    '@layer properties{@supports (a:b){*,:before,:after,::backdrop{--tw-a:0}}}';
  const offending = '@layer bsdk.base{.a{color:red}}html{margin:0}*,:before,:after{box-sizing:border-box}';

  it('accepts a compliant stylesheet', () => {
    expect(layeringViolations(compliant)).toEqual([]);
    expect(resetViolations(compliant)).toEqual([]);
  });

  it('reports an unlayered html rule and a * reset by name', () => {
    expect(layeringViolations(offending)).toEqual(['html {…}', '*,:before,:after {…}']);
    expect(resetViolations(offending)).toEqual(['html', '*,:before,:after']);
  });

  it('accepts Tailwind\'s :root,:host token scope but not a :host/body reset', () => {
    const tokens = '@layer bsdk.theme{:root,:host{--bsdk-spacing:.25rem}}';
    expect(resetViolations(tokens)).toEqual([]);
    expect(resetViolations('@layer bsdk.base{:host{display:block}body{margin:0}}')).toEqual([':host', 'body']);
  });

  it('rejects an @layer properties block with non-tw declarations', () => {
    expect(layeringViolations('@layer properties{*{margin:0}}')).toEqual(['@layer properties {…}']);
  });
});

const root = path.resolve(import.meta.dirname, '..');
let css = '';

describe('dist/styles.css', () => {
  beforeAll(() => {
    execSync('npm run build:css', { cwd: root, stdio: 'pipe' });
    css = readFileSync(path.join(root, 'dist/styles.css'), 'utf8');
  }, 60_000);

  it('puts every rule inside the bsdk layer', () => {
    expect(css).toMatch(/@layer bsdk/);
    expect(layeringViolations(css)).toEqual([]);
  });

  it('emits prefixed utilities used by components', () => {
    expect(css).toContain('.bsdk\\:bg-primary');
  });

  it('reads colours from the brand-overridable variables', () => {
    expect(css).toContain('var(--bsdk-primary)');
    expect(css).toMatch(/--bsdk-primary:/);
  });

  it('ships no global reset', () => {
    expect(resetViolations(css)).toEqual([]);
  });
});
