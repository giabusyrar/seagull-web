import { describe, it, expect } from 'vitest';
import { interpolateGlobalVariables } from './interpolate';

describe('interpolateGlobalVariables', () => {
  it('replaces a single known variable', () => {
    const result = interpolateGlobalVariables('Bearer {{token}}', { token: 'abc123' });
    expect(result).toBe('Bearer abc123');
  });

  it('replaces multiple occurrences of the same variable', () => {
    const result = interpolateGlobalVariables('{{host}}/a and {{host}}/b', { host: 'https://x.com' });
    expect(result).toBe('https://x.com/a and https://x.com/b');
  });

  it('replaces multiple different variables', () => {
    const result = interpolateGlobalVariables('{{a}}-{{b}}', { a: '1', b: '2' });
    expect(result).toBe('1-2');
  });

  it('leaves an unknown variable placeholder untouched', () => {
    const result = interpolateGlobalVariables('Bearer {{missing}}', {});
    expect(result).toBe('Bearer {{missing}}');
  });

  it('tolerates whitespace inside the braces', () => {
    const result = interpolateGlobalVariables('{{ token }}', { token: 'abc123' });
    expect(result).toBe('abc123');
  });

  it('returns the template unchanged when it has no placeholders', () => {
    const result = interpolateGlobalVariables('plain text', { token: 'abc123' });
    expect(result).toBe('plain text');
  });
});
