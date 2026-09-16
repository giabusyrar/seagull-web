export interface DimensionTreeNode {
  id?: string;
  code: string;
  name: string;
  parentCode?: string;
  weight?: number;
  driverLabel?: string; // Fallback alias
  minScore?: number;
  maxScore?: number;
  calculationMethod?: string;
  resolver?: string; // Fallback alias
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  children: DimensionTreeNode[];
  level: number;
  hasChildren: boolean;
  totalWeight: number;
  [key: string]: any;
}

/**
 * Builds a multi-level tree from flat dimension items.
 * Any dimension without a valid parentCode is treated as a root node.
 */
export function buildDimensionTree(dimensions: any[]): DimensionTreeNode[] {
  if (!Array.isArray(dimensions) || dimensions.length === 0) return [];

  const nodeMap = new Map<string, DimensionTreeNode>();
  const rootNodes: DimensionTreeNode[] = [];

  // 1. Initialize all nodes
  dimensions.forEach((dim) => {
    if (!dim || !dim.code) return;
    nodeMap.set(dim.code, {
      ...dim,
      minScore: typeof dim.minScore === 'number' && !isNaN(dim.minScore) ? dim.minScore : (dim.minScore !== undefined && !isNaN(Number(dim.minScore)) ? Number(dim.minScore) : 0),
      maxScore: typeof dim.maxScore === 'number' && !isNaN(dim.maxScore) ? dim.maxScore : (dim.maxScore !== undefined && !isNaN(Number(dim.maxScore)) ? Number(dim.maxScore) : 100),
      children: [],
      level: 1,
      hasChildren: false,
      totalWeight: Number(dim.weight || 0),
    });
  });

  // 2. Build parent-child relationships
  dimensions.forEach((dim) => {
    if (!dim || !dim.code) return;
    const node = nodeMap.get(dim.code);
    if (!node) return;

    const parentCode = dim.parentCode?.trim();
    if (parentCode && nodeMap.has(parentCode) && parentCode !== dim.code) {
      const parent = nodeMap.get(parentCode)!;
      parent.children.push(node);
      parent.hasChildren = true;
    } else {
      rootNodes.push(node);
    }
  });

  // 3. Compute level depths recursively and rollup minScore, maxScore & totalWeight from children
  function processNode(node: DimensionTreeNode, level: number): void {
    node.level = level;
    node.children.forEach((child) => {
      processNode(child, level + 1);
    });

    if (node.children.length > 0) {
      const childrenMinScoreSum = node.children.reduce((sum, child) => {
        const childMin = typeof child.minScore === 'number' && !isNaN(child.minScore) ? child.minScore : 0;
        return sum + childMin;
      }, 0);
      node.minScore = childrenMinScoreSum;

      const childrenMaxScoreSum = node.children.reduce((sum, child) => {
        const childMax = typeof child.maxScore === 'number' && !isNaN(child.maxScore) ? child.maxScore : 100;
        return sum + childMax;
      }, 0);
      node.maxScore = childrenMaxScoreSum;

      const childrenWeightSum = node.children.reduce((sum, child) => {
        return sum + (child.totalWeight || Number(child.weight) || 0);
      }, Number(node.weight || 0));
      node.totalWeight = childrenWeightSum;
    } else {
      node.minScore = typeof node.minScore === 'number' && !isNaN(node.minScore) ? node.minScore : 0;
      node.maxScore = typeof node.maxScore === 'number' && !isNaN(node.maxScore) ? node.maxScore : 100;
    }
  }

  rootNodes.forEach((root) => processNode(root, 1));

  return rootNodes;
}

/**
 * Collects all descendant codes (children, grandchildren, etc.) for a given dimension code.
 * Used for preventing circular references in parent selection dropdowns.
 */
export function getDescendantCodes(code: string, dimensions: any[]): Set<string> {
  const descendants = new Set<string>();
  if (!code || !Array.isArray(dimensions)) return descendants;

  const childrenMap = new Map<string, string[]>();
  dimensions.forEach((d) => {
    if (!d || !d.code) return;
    const p = d.parentCode?.trim();
    if (p) {
      if (!childrenMap.has(p)) childrenMap.set(p, []);
      childrenMap.get(p)!.push(d.code);
    }
  });

  const queue = [code];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);

    const children = childrenMap.get(current) || [];
    children.forEach((childCode) => {
      descendants.add(childCode);
      queue.push(childCode);
    });
  }

  return descendants;
}

/**
 * Flattens the visible tree nodes for table rendering based on expanded state and search queries.
 * When search query is active, auto-expands all ancestor branches containing matches.
 */
export function flattenVisibleTree(
  nodes: DimensionTreeNode[],
  expandedCodes: Set<string>,
  searchQuery: string = ''
): { node: DimensionTreeNode; depth: number }[] {
  const result: { node: DimensionTreeNode; depth: number }[] = [];
  const q = searchQuery.trim().toLowerCase();

  // If search query is present, check which nodes match or have matching descendants
  function matchesSearch(n: DimensionTreeNode): boolean {
    if (!q) return true;
    const selfMatch =
      n.name?.toLowerCase().includes(q) ||
      n.code?.toLowerCase().includes(q) ||
      n.driverLabel?.toLowerCase().includes(q) ||
      n.description?.toLowerCase().includes(q);
    if (selfMatch) return true;
    return n.children.some((c) => matchesSearch(c));
  }

  function traverse(list: DimensionTreeNode[], depth: number) {
    list.forEach((n) => {
      if (q && !matchesSearch(n)) return;

      result.push({ node: n, depth });

      const isExpanded = q ? true : expandedCodes.has(n.code);
      if (n.hasChildren && isExpanded) {
        traverse(n.children, depth + 1);
      }
    });
  }

  traverse(nodes, 0);
  return result;
}
