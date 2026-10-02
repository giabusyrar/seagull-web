import React, { useState, useMemo } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Edit2,
  Trash2,
  FolderTree,
  ChevronsDownUp,
  ChevronsUpDown,
} from 'lucide-react';
import {
  buildDimensionTree,
  flattenVisibleTree,
  type DimensionTreeNode,
} from '../utils/dimension-tree-utils';

interface DimensionTreeTableProps {
  dimensions: any[];
  searchQuery?: string;
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
  onAddSub: (parentItem: any) => void;
}

export const DimensionTreeTable: React.FC<DimensionTreeTableProps> = ({
  dimensions,
  searchQuery = '',
  onEdit,
  onDelete,
  onAddSub,
}) => {
  const tree = useMemo(() => buildDimensionTree(dimensions), [dimensions]);
  const [expandedCodes, setExpandedCodes] = useState<Set<string>>(() => {
    // By default, expand all root nodes with children
    const initial = new Set<string>();
    tree.forEach((node) => {
      if (node.hasChildren) initial.add(node.code);
    });
    return initial;
  });

  const toggleExpand = (code: string) => {
    setExpandedCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const handleExpandAll = () => {
    const all = new Set<string>();
    dimensions.forEach((d) => {
      if (d.code) all.add(d.code);
    });
    setExpandedCodes(all);
  };

  const handleCollapseAll = () => {
    setExpandedCodes(new Set());
  };

  const visibleRows = useMemo(() => {
    return flattenVisibleTree(tree, expandedCodes, searchQuery);
  }, [tree, expandedCodes, searchQuery]);

  return (
    <div className="space-y-3">
      {/* Tree Toolbar Controls */}
      <div className="flex items-center justify-between px-1 text-xs">
        <div className="text-muted-foreground flex items-center gap-2">
          <FolderTree className="h-4 w-4 text-sky-400" />
          <span>
            Hierarchical View: <strong className="text-foreground">{tree.length}</strong> Root Domains,{' '}
            <strong className="text-foreground">{dimensions.length}</strong> Total Metrics
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExpandAll}
            className="px-2.5 py-1 bg-muted hover:bg-muted border border-border hover:border-ring rounded text-foreground hover:text-foreground flex items-center gap-1.5 transition cursor-pointer"
          >
            <ChevronsUpDown className="h-3.5 w-3.5 text-sky-400" />
            <span>Expand All</span>
          </button>
          <button
            type="button"
            onClick={handleCollapseAll}
            className="px-2.5 py-1 bg-muted hover:bg-muted border border-border hover:border-ring rounded text-foreground hover:text-foreground flex items-center gap-1.5 transition cursor-pointer"
          >
            <ChevronsDownUp className="h-3.5 w-3.5 text-amber-400" />
            <span>Collapse All</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="w-full overflow-x-auto border border-border rounded-xl bg-muted/40/90 shadow-2xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-card/80 text-muted-foreground uppercase tracking-wider font-semibold">
              <th className="py-3 px-3 w-28 whitespace-nowrap">Actions</th>
              <th className="py-3 px-3 min-w-[200px]">Dimension Name & Hierarchy</th>
              <th className="py-3 px-3 w-28 whitespace-nowrap">Code</th>
              <th className="py-3 px-3 w-32 whitespace-nowrap">Score Range</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visibleRows.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-muted-foreground italic">
                  No scoring dimensions matching current criteria
                </td>
              </tr>
            ) : (
              visibleRows.map(({ node, depth }) => {
                const isRoot = depth === 0;
                const isExpanded = expandedCodes.has(node.code);

                return (
                  <tr
                    key={node.id || node.code}
                    className={`hover:bg-secondary/70 transition group ${
                      isRoot ? 'bg-card/50 font-medium' : 'bg-muted/40/30'
                    }`}
                  >
                    {/* Actions */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onAddSub(node)}
                          className="px-1.5 py-1 bg-sky-950/60 hover:bg-sky-900 border border-sky-800/60 hover:border-sky-500 text-sky-200 text-[10px] font-bold rounded flex items-center gap-0.5 transition cursor-pointer"
                          title={`Add sub-dimension under ${node.name}`}
                        >
                          <Plus className="h-3 w-3 text-sky-400" />
                          <span>Sub</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onEdit(node)}
                          className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded transition cursor-pointer"
                          title="Edit Dimension"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(node)}
                          className="p-1 hover:bg-rose-950/60 text-muted-foreground hover:text-rose-400 rounded transition cursor-pointer"
                          title="Delete Dimension"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Dimension Name & Hierarchy with indents */}
                    <td className="py-2.5 px-3">
                      <div
                        className="flex items-center gap-1.5"
                        style={{ paddingLeft: `${depth * 24}px` }}
                      >
                        {/* Tree Branch Connector */}
                        {depth > 0 && (
                          <span className="text-muted-foreground font-mono select-none -ml-4 mr-1">
                            └─
                          </span>
                        )}

                        {/* Expand/Collapse Toggle or Leaf spacer */}
                        {node.hasChildren ? (
                          <button
                            type="button"
                            onClick={() => toggleExpand(node.code)}
                            className="p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded transition cursor-pointer shrink-0"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-sky-400" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>
                        ) : (
                          <span className="w-5 h-5 shrink-0" />
                        )}

                        {/* Name and Child Count Pill */}
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`${
                                isRoot
                                  ? 'font-bold text-foreground text-[13px]'
                                  : 'text-foreground text-xs'
                              }`}
                            >
                              {node.name}
                            </span>
                            {node.hasChildren && (
                              <span className="px-1.5 py-0.2 text-[9px] font-mono bg-sky-950/80 border border-sky-800/80 text-sky-300 rounded-full">
                                {node.children.length} {node.children.length === 1 ? 'sub' : 'subs'}
                              </span>
                            )}
                          </div>
                          {node.description && (
                            <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5" title={node.description}>
                              {node.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Code */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[11px] rounded">
                        {node.code}
                      </span>
                    </td>

                    {/* Score Range */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {(() => {
                        const min = node.minScore ?? 0;
                        const max = node.maxScore ?? 100;
                        const isRange = min !== 0;

                        return (
                          <span className="text-foreground font-mono font-semibold">
                            {isRange ? `${min > 0 ? `+${min}` : min} ~ ${max > 0 ? `+${max}` : max} pts` : `${max} pts`}
                          </span>
                        );
                      })()}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
