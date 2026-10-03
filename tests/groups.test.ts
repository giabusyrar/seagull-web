import { describe, it, expect } from 'vitest';
import { GROUPS, getGroup } from '@/lib/groups';
import { buildRequest } from '@/lib/endpoint';

describe('groups', () => {
  it('has unique group and endpoint ids', () => {
    expect(new Set(GROUPS.map((g) => g.id)).size).toBe(GROUPS.length);
    const ids = GROUPS.flatMap((g) => g.endpoints.map((e) => e.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('covers every spec group', () => {
    for (const id of ['form', 'score', 'match', 'vision', 'colour', 'face-arch', 'assessments', 'flows', 'reference', 'w-colour', 'w-face', 'w-skin', 'w-tryon']) {
      expect(getGroup(id), id).toBeDefined();
    }
  });
  it('every endpoint builds with defaults (files and path params supplied)', () => {
    const f = new File(['x'], 'x.jpg', { type: 'image/jpeg' });
    for (const g of GROUPS) for (const e of g.endpoints) {
      const values: Record<string, unknown> = {};
      for (const fl of e.fields) values[fl.name] = fl.kind === 'file' ? f : fl.kind === 'files' ? [f] : fl.default ?? (e.path.includes(`:${fl.name}`) ? 'x' : undefined);
      expect(() => buildRequest(e, values as never, { brandId: 'wardah', applicationId: 'skinverse' }), e.id).not.toThrow();
    }
  });
});
