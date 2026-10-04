import { describe, expect, it } from 'vitest';
import { groupSubtreeIds, subtreeRouteCount } from './group-tree';

// Core Engine's Vision Engine folder: no routes of its own, two subfolders.
const groups = [
  { id: 'vision', parentId: null },
  { id: 'colour', parentId: 'vision' },
  { id: 'face', parentId: 'vision' },
  { id: 'score', parentId: null },
];
const routes = [
  ...Array.from({ length: 5 }, () => ({ groupId: 'colour' })),
  { groupId: 'face' },
  { groupId: 'face' },
  { groupId: 'score' },
  { groupId: null },
];

describe('subtreeRouteCount', () => {
  it('counts a folder’s subfolders, so a folder of folders is not shown as empty', () => {
    expect(subtreeRouteCount('vision', groups, routes)).toBe(7);
    expect(subtreeRouteCount('colour', groups, routes)).toBe(5);
    expect(subtreeRouteCount('score', groups, routes)).toBe(1);
  });

  it('stops at a parent loop instead of running forever', () => {
    const loop = [{ id: 'a', parentId: 'b' }, { id: 'b', parentId: 'a' }];
    expect([...groupSubtreeIds('a', loop)].sort()).toEqual(['a', 'b']);
    expect(subtreeRouteCount('a', loop, [{ groupId: 'a' }, { groupId: 'b' }])).toBe(2);
  });
});
