// Folder (route group) arithmetic for the collection tree.

interface GroupLike {
  id: string;
  parentId?: string | null;
}

interface RouteLike {
  groupId?: string | null;
}

/** A folder and every folder nested under it, at any depth. Safe against parent loops. */
export function groupSubtreeIds(groupId: string, groups: readonly GroupLike[]): Set<string> {
  const ids = new Set<string>([groupId]);
  const queue = [groupId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const g of groups) {
      if (g.parentId === current && !ids.has(g.id)) {
        ids.add(g.id);
        queue.push(g.id);
      }
    }
  }
  return ids;
}

/** How many routes a folder holds, its subfolders' included (a folder of folders is not empty). */
export function subtreeRouteCount(groupId: string, groups: readonly GroupLike[], routes: readonly RouteLike[]): number {
  const ids = groupSubtreeIds(groupId, groups);
  return routes.filter((r) => !!r.groupId && ids.has(r.groupId)).length;
}
