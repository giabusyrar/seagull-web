'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Settings,
  Trash2,
  FilePlus,
  FolderPlus,
  GripVertical,
} from 'lucide-react';
import type { Collection, Route, RouteGroup } from '@/types/api-client';
import { METHOD_COLORS } from '@/lib/api-client-utils';
import { Badge } from '@gateway-experience/shared';
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import {
  attachInstruction,
  extractInstruction,
  type Instruction,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item';

function HealthDot({ status }: { status: Collection['status'] }) {
  const color =
    status === 'healthy'
      ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]'
      : status === 'unhealthy'
      ? 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]'
      : 'bg-zinc-500';
  const label =
    status === 'healthy'
      ? 'Upstream Target: Healthy (200 OK)'
      : status === 'unhealthy'
      ? 'Upstream Target: Down / Unreachable'
      : 'Upstream Target: Status Unchecked';
  return <span className={`inline-block h-2 w-2 rounded-full ${color} shrink-0 ml-1`} title={label} />;
}

export interface CollectionTreeProps {
  collections: Collection[];
  searchQuery: string;
  expandedCollectionId?: string | null;
  routesByCollection?: Record<string, Route[]>;
  groupsByCollection?: Record<string, RouteGroup[]>;
  activeRouteId?: string;
  onSelectRoute?: (route: Route) => void;
  onExpandCollection?: (collectionId: string) => void;
  onOpenCollectionSettings?: (collection: Collection) => void;
  onDeleteCollection?: (collection: Collection) => void;
  onDeleteRoute?: (route: Route) => void;
  onAddCollection?: () => void;
  onAddRoute?: (collectionId: string, groupId?: string | null) => void;
  onAddGroup?: (collectionId: string, parentId?: string | null) => void;
  onOpenGroupSettings?: (group: RouteGroup, collectionId: string) => void;
  onDeleteGroup?: (group: RouteGroup, collectionId: string) => void;
  onMoveRouteToGroup?: (routeId: string, groupId: string | null, collectionId: string) => void;
  onMoveGroupToCollection?: (
    groupId: string,
    targetCollectionId: string,
    sourceCollectionId: string,
    targetParentId?: string | null
  ) => void;
  onUpdateCollectionParent?: (collectionId: string, parentId?: string | null) => void;
  onConvertCollectionToFolder?: (collectionId: string, targetCollectionId: string, targetParentGroupId?: string | null) => void;
  onConvertFolderToCollection?: (collectionId: string, groupId: string) => void;
  onReorderCollections?: (collectionIds: string[]) => void;
  onReorderGroups?: (collectionId: string, groupIds: string[]) => void;
}

const isCollectionDescendant = (targetId: string, draggedId: string, collections: Collection[]) => {
  if (targetId === draggedId) return true;
  let current: string | undefined | null = targetId;
  const visited = new Set<string>();
  while (current && !visited.has(current)) {
    visited.add(current);
    const parent = collections.find((c) => c.id === current)?.parentId;
    if (parent === draggedId) return true;
    current = parent;
  }
  return false;
};

const isGroupDescendant = (targetGroupId: string, draggedGroupId: string, groups: RouteGroup[]) => {
  if (targetGroupId === draggedGroupId) return true;
  let current: string | undefined | null = targetGroupId;
  const visited = new Set<string>();
  while (current && !visited.has(current)) {
    visited.add(current);
    const parent = groups.find((g) => g.id === current);
    if (parent?.parentId === draggedGroupId) return true;
    current = parent?.parentId;
  }
  return false;
};

// --- Drop Indicator Component ---
function InstructionIndicator({ instruction }: { instruction: Instruction | null }) {
  if (!instruction) return null;
  if (instruction.type === 'reorder-above') {
    return (
      <div className="absolute -top-1 left-0 right-0 z-30 pointer-events-none flex items-center">
        <div className="w-2 h-2 rounded-full border-2 border-primary bg-primary shrink-0 -ml-1 shadow-xs" />
        <div className="h-0.5 bg-primary flex-1 rounded-full shadow-xs" />
      </div>
    );
  }
  if (instruction.type === 'reorder-below') {
    return (
      <div className="absolute -bottom-1 left-0 right-0 z-30 pointer-events-none flex items-center">
        <div className="w-2 h-2 rounded-full border-2 border-primary bg-primary shrink-0 -ml-1 shadow-xs" />
        <div className="h-0.5 bg-primary flex-1 rounded-full shadow-xs" />
      </div>
    );
  }
  if (instruction.type === 'make-child') {
    return (
      <div className="absolute -bottom-1 left-5 right-0 z-30 pointer-events-none flex items-center">
        <div className="w-2 h-2 rounded-full border-2 border-amber-500 bg-amber-500 shrink-0 -ml-1 shadow-xs" />
        <div className="h-0.5 bg-amber-500 flex-1 rounded-full shadow-xs" />
      </div>
    );
  }
  if (instruction.type === 'reparent') {
    const leftOffset = Math.max(0, instruction.desiredLevel * 14);
    return (
      <div
        style={{ left: `${leftOffset}px` }}
        className="absolute -bottom-1 right-0 z-30 pointer-events-none flex items-center"
      >
        <div className="w-2 h-2 rounded-full border-2 border-primary bg-primary shrink-0 -ml-1 shadow-xs" />
        <div className="h-0.5 bg-primary flex-1 rounded-full shadow-xs" />
      </div>
    );
  }
  return null;
}

// --- Draggable & Droppable Collection Row ---
interface CollectionRowProps {
  col: Collection;
  collections: Collection[];
  routeCount?: number;
  isCore?: boolean;
  isExpanded: boolean;
  isSearching: boolean;
  level?: number;
  onExpand: () => void;
  onAddRoute?: (colId: string) => void;
  onAddGroup?: (colId: string, parentId?: string | null) => void;
  onOpenSettings?: (col: Collection) => void;
  onDelete?: (col: Collection) => void;
  onReorderCollections?: (collectionIds: string[]) => void;
  onMoveGroupToCollection?: (
    groupId: string,
    targetCollectionId: string,
    sourceCollectionId: string,
    targetParentId?: string | null
  ) => void;
  onUpdateCollectionParent?: (collectionId: string, parentId?: string | null) => void;
  onConvertCollectionToFolder?: (collectionId: string, targetCollectionId: string, targetParentGroupId?: string | null) => void;
  onMoveRouteToGroup?: (routeId: string, groupId: string | null, collectionId: string) => void;
}

const CollectionRow: React.FC<CollectionRowProps> = ({
  col,
  collections,
  routeCount = 0,
  isCore = false,
  isExpanded,
  isSearching,
  level = 0,
  onExpand,
  onAddRoute,
  onAddGroup,
  onOpenSettings,
  onDelete,
  onReorderCollections,
  onMoveGroupToCollection,
  onUpdateCollectionParent,
  onConvertCollectionToFolder,
  onMoveRouteToGroup,
}) => {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [instruction, setInstruction] = useState<Instruction | null>(null);
  const [isHoveredForChild, setIsHoveredForChild] = useState(false);

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;

    const cleanupDraggable = draggable({
      element: el,
      canDrag: () => !isSearching && !col.isCore,
      getInitialData: () => ({ type: 'collection', id: col.id }),
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });

    const cleanupDropTarget = dropTargetForElements({
      element: el,
      canDrop: ({ source }) => {
        if (col.isCore) return false;
        const data = source.data as any;
        if (data.type === 'collection') {
          if (data.id === col.id) return false;
          if (isCollectionDescendant(col.id, data.id, collections)) return false;
          return !isSearching;
        }
        if (data.type === 'group' || data.type === 'route') {
          return true;
        }
        return false;
      },
      getData: ({ input, element }) => {
        const data = { type: 'collection', id: col.id };
        const hasChildCollections = collections.some((c) => c.parentId === col.id);
        return attachInstruction(data, {
          input,
          element,
          currentLevel: level,
          indentPerLevel: 16,
          mode: isExpanded && hasChildCollections ? 'expanded' : 'standard',
        });
      },
      onDrag: ({ self, source }) => {
        const data = source.data as any;
        if (data.type === 'collection') {
          const inst = extractInstruction(self.data);
          setInstruction(inst);
          setIsHoveredForChild(false);
        } else if (data.type === 'group' || data.type === 'route') {
          setInstruction(null);
          setIsHoveredForChild(true);
        }
      },
      onDragLeave: () => {
        setInstruction(null);
        setIsHoveredForChild(false);
      },
      onDrop: ({ self, source }) => {
        setInstruction(null);
        setIsHoveredForChild(false);
        const data = source.data as any;

        if (data.type === 'collection') {
          const inst = extractInstruction(self.data);
          if (inst?.type === 'instruction-blocked') return;

          if (!inst || inst.type === 'make-child') {
            // Nest collection inside target collection -> convert to folder
            onExpand();
            if (onConvertCollectionToFolder) {
              onConvertCollectionToFolder(data.id, col.id, null);
            } else {
              onUpdateCollectionParent?.(data.id, col.id);
            }
            return;
          }

          const draggedCol = collections.find((c) => c.id === data.id);
          const targetParentId = col.parentId || null;

          if (draggedCol && (draggedCol.parentId || null) !== targetParentId) {
            onUpdateCollectionParent?.(data.id, targetParentId);
          }

          const siblingCols = collections.filter(
            (c) => (c.parentId || null) === targetParentId
          );
          const fromIndex = siblingCols.findIndex((c) => c.id === data.id);
          const newSiblingList = [...siblingCols];
          if (fromIndex !== -1) {
            newSiblingList.splice(fromIndex, 1);
          }
          const insertIndex = newSiblingList.findIndex((c) => c.id === col.id);
          const targetFinalIndex = inst.type === 'reorder-below' ? insertIndex + 1 : insertIndex;
          if (draggedCol) {
            newSiblingList.splice(targetFinalIndex, 0, draggedCol);
          }

          // Build full collection order with the newly ordered siblings
          const updatedAllColIds: string[] = [];
          const siblingIdSet = new Set(newSiblingList.map((c) => c.id));
          let siblingInserted = false;

          for (const c of collections) {
            if (siblingIdSet.has(c.id)) {
              if (!siblingInserted) {
                updatedAllColIds.push(...newSiblingList.map((s) => s.id));
                siblingInserted = true;
              }
            } else {
              updatedAllColIds.push(c.id);
            }
          }

          onReorderCollections?.(updatedAllColIds);
          return;
        }

        if (data.type === 'group') {
          onExpand();
          onMoveGroupToCollection?.(data.id, col.id, data.sourceCollectionId || col.id, null);
          return;
        }

        if (data.type === 'route') {
          onExpand();
          onMoveRouteToGroup?.(data.id, null, col.id);
        }
      },
    });

    return () => {
      cleanupDraggable();
      cleanupDropTarget();
    };
  }, [
    col.id,
    col.parentId,
    col.isCore,
    collections,
    isExpanded,
    isSearching,
    level,
    onExpand,
    onMoveGroupToCollection,
    onMoveRouteToGroup,
    onReorderCollections,
    onUpdateCollectionParent,
  ]);

  return (
    <div className="relative">
      <InstructionIndicator instruction={instruction} />
      <div
        ref={rowRef}
        onClick={onExpand}
        className={`group flex items-center justify-between px-2 py-1 hover:bg-sidebar-accent rounded-md cursor-pointer text-foreground transition relative select-none ${
          isHoveredForChild ? 'ring-2 ring-amber-400/80 bg-amber-500/10' : ''
        } ${isDragging ? 'opacity-40' : ''}`}
        title={col.name}
      >
        <div className="flex items-center gap-1.5 min-w-0 font-medium text-xs">
          {!isSearching && (
            <span
              className="p-0.5 -ml-1 rounded text-muted-foreground/30 group-hover:text-muted-foreground transition shrink-0 cursor-grab active:cursor-grabbing"
              title="Drag to reorder collection"
            >
              <GripVertical className="h-3 w-3" />
            </span>
          )}
          {isExpanded ? (
            <ChevronDown className="h-3 w-3 text-muted-foreground transition shrink-0" />
          ) : (
            <ChevronRight className="h-3 w-3 text-muted-foreground transition shrink-0" />
          )}
          {isExpanded ? (
            <FolderOpen
              className={`h-3.5 w-3.5 shrink-0 ${
                isCore || col.isCore ? 'text-emerald-600' : 'text-amber-600'
              }`}
            />
          ) : (
            <Folder
              className={`h-3.5 w-3.5 shrink-0 ${
                isCore || col.isCore
                  ? 'text-emerald-600 fill-emerald-50 dark:fill-emerald-950/30'
                  : 'text-amber-600 fill-amber-50 dark:fill-amber-950/30'
              }`}
            />
          )}
          <span className="truncate text-foreground font-medium" title={col.name}>{col.name}</span>
          {col.type === 'proxy' ? (
            <HealthDot status={col.status} />
          ) : null}
          {col.isCore && (
            <Badge variant="emerald" size="sm" title="System collection — cannot be moved or deleted">
              Core
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[10px] text-muted-foreground font-mono pointer-events-none">
            ({routeCount})
          </span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
            {onAddRoute && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddRoute(col.id);
                }}
                className="p-0.5 hover:bg-muted hover:text-emerald-700 rounded text-muted-foreground cursor-pointer"
                title="Add Route"
              >
                <FilePlus className="h-3 w-3" />
              </button>
            )}
            {onAddGroup && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddGroup(col.id, null);
                }}
                className="p-0.5 hover:bg-muted hover:text-amber-700 rounded text-muted-foreground cursor-pointer"
                title="Add Folder"
              >
                <FolderPlus className="h-3 w-3" />
              </button>
            )}
            {onOpenSettings && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenSettings(col);
                }}
                className="p-0.5 hover:bg-muted hover:text-foreground rounded text-muted-foreground cursor-pointer"
                title="Collection Settings"
              >
                <Settings className="h-3 w-3" />
              </button>
            )}
            {onDelete && !col.isCore && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(col);
                }}
                className="p-0.5 hover:bg-muted hover:text-rose-700 rounded text-muted-foreground cursor-pointer"
                title="Delete Collection"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Draggable & Droppable Group (Folder) Row ---
interface GroupRowProps {
  group: RouteGroup;
  colId: string;
  allGroups: RouteGroup[];
  routeCount: number;
  isCore?: boolean;
  isCollapsed: boolean;
  isSearching: boolean;
  level: number;
  onToggleCollapse: (e: React.MouseEvent) => void;
  onAddRoute?: (colId: string, groupId?: string | null) => void;
  onAddSubgroup?: (colId: string, parentId?: string | null) => void;
  onOpenGroupSettings?: (group: RouteGroup, colId: string) => void;
  onDeleteGroup?: (group: RouteGroup, colId: string) => void;
  onMoveGroupToCollection?: (
    groupId: string,
    targetCollectionId: string,
    sourceCollectionId: string,
    targetParentId?: string | null
  ) => void;
  onMoveRouteToGroup?: (routeId: string, groupId: string | null, collectionId: string) => void;
  onConvertCollectionToFolder?: (collectionId: string, targetCollectionId: string, targetParentGroupId?: string | null) => void;
  onReorderGroups?: (collectionId: string, groupIds: string[]) => void;
  onExpandGroup: () => void;
}

const GroupRow: React.FC<GroupRowProps> = ({
  group,
  colId,
  allGroups,
  routeCount,
  isCore = false,
  isCollapsed,
  isSearching,
  level,
  onToggleCollapse,
  onAddRoute,
  onAddSubgroup,
  onOpenGroupSettings,
  onDeleteGroup,
  onMoveGroupToCollection,
  onConvertCollectionToFolder,
  onMoveRouteToGroup,
  onReorderGroups,
  onExpandGroup,
}) => {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [instruction, setInstruction] = useState<Instruction | null>(null);

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;

    const cleanupDraggable = draggable({
      element: el,
      canDrag: () => !isSearching,
      getInitialData: () => ({
        type: 'group',
        id: group.id,
        sourceCollectionId: colId,
        parentId: group.parentId,
      }),
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });

    const cleanupDropTarget = dropTargetForElements({
      element: el,
      canDrop: ({ source }) => {
        const data = source.data as any;
        if (data.type === 'collection') return true;
        if (data.type === 'group') {
          if (data.id === group.id) return false;
          if (isGroupDescendant(group.id, data.id, allGroups)) return false;
          return true;
        }
        if (data.type === 'route') return true;
        return false;
      },
      getData: ({ input, element }) => {
        const data = { type: 'group', id: group.id, colId };
        const hasChildGroups = allGroups.some((g) => g.parentId === group.id);
        return attachInstruction(data, {
          input,
          element,
          currentLevel: level,
          indentPerLevel: 16,
          mode: isCollapsed || !hasChildGroups ? 'standard' : 'expanded',
        });
      },
      onDrag: ({ self, source }) => {
        const data = source.data as any;
        if (data.type === 'route' || data.type === 'collection') {
          setInstruction({ type: 'make-child', currentLevel: level, indentPerLevel: 16 });
        } else {
          const inst = extractInstruction(self.data);
          setInstruction(inst);
        }
      },
      onDragLeave: () => {
        setInstruction(null);
      },
      onDrop: ({ self, source }) => {
        setInstruction(null);
        const data = source.data as any;

        if (data.type === 'collection') {
          onExpandGroup();
          onConvertCollectionToFolder?.(data.id, colId, group.id);
          return;
        }

        if (data.type === 'group') {
          const inst = extractInstruction(self.data);
          if (inst?.type === 'instruction-blocked') return;

          if (!inst || inst.type === 'make-child') {
            // Nest group inside target group
            onExpandGroup();
            onMoveGroupToCollection?.(data.id, colId, data.sourceCollectionId || colId, group.id);
            return;
          }

          // Reorder above or below sibling group
          if (data.sourceCollectionId === colId && !isSearching) {
            const siblingGroups = allGroups.filter((g) => (g.parentId || null) === (group.parentId || null));
            const fromIndex = siblingGroups.findIndex((g) => g.id === data.id);
            const newSiblingList = [...siblingGroups];
            if (fromIndex !== -1) {
              newSiblingList.splice(fromIndex, 1);
            }
            const insertIndex = newSiblingList.findIndex((g) => g.id === group.id);
            const targetFinalIndex = inst.type === 'reorder-below' ? insertIndex + 1 : insertIndex;
            const draggedGroupObj = allGroups.find((g) => g.id === data.id);
            if (draggedGroupObj) {
              newSiblingList.splice(targetFinalIndex, 0, draggedGroupObj);
            }

            if (draggedGroupObj && (draggedGroupObj.parentId || null) !== (group.parentId || null)) {
              onMoveGroupToCollection?.(data.id, colId, colId, group.parentId || null);
            }

            // Build full collection groups order with the newly ordered siblings
            const updatedAllGroupIds: string[] = [];
            const siblingIdSet = new Set(newSiblingList.map((g) => g.id));
            let siblingInserted = false;

            for (const g of allGroups) {
              if (siblingIdSet.has(g.id)) {
                if (!siblingInserted) {
                  updatedAllGroupIds.push(...newSiblingList.map((s) => s.id));
                  siblingInserted = true;
                }
              } else {
                updatedAllGroupIds.push(g.id);
              }
            }

            onReorderGroups?.(colId, updatedAllGroupIds);
          } else if (data.sourceCollectionId !== colId) {
            onMoveGroupToCollection?.(data.id, colId, data.sourceCollectionId || '', group.parentId || null);
          }
          return;
        }

        if (data.type === 'route') {
          onExpandGroup();
          onMoveRouteToGroup?.(data.id, group.id, colId);
        }
      },
    });

    return () => {
      cleanupDraggable();
      cleanupDropTarget();
    };
  }, [
    allGroups,
    colId,
    group.id,
    group.parentId,
    isCollapsed,
    isSearching,
    level,
    onConvertCollectionToFolder,
    onExpandGroup,
    onMoveGroupToCollection,
    onMoveRouteToGroup,
    onReorderGroups,
  ]);

  const isNesting = instruction?.type === 'make-child';

  return (
    <div className="relative">
      <InstructionIndicator instruction={instruction} />
      <div
        ref={rowRef}
        onClick={onToggleCollapse}
        className={`flex items-center justify-between px-2 py-1 text-foreground hover:bg-sidebar-accent rounded-md cursor-grab active:cursor-grabbing transition select-none group/folder relative ${
          isNesting ? 'bg-amber-500/10 ring-2 ring-amber-400/80 shadow-xs' : ''
        } ${isDragging ? 'opacity-40' : ''}`}
        title={group.name}
      >
        <div className="flex items-center gap-1.5 min-w-0 font-medium text-xs">
          <span
            className="p-0.5 -ml-1 rounded text-muted-foreground/30 group-hover/folder:text-muted-foreground transition shrink-0 cursor-grab active:cursor-grabbing"
            title="Drag to reorder or nest folder"
          >
            <GripVertical className="h-3 w-3" />
          </span>
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3 text-muted-foreground group-hover/folder:text-foreground transition shrink-0" />
          ) : (
            <ChevronDown className="h-3 w-3 text-muted-foreground group-hover/folder:text-foreground transition shrink-0" />
          )}
          {isCollapsed && !isNesting ? (
            <Folder
              className={`h-3.5 w-3.5 shrink-0 ${
                isCore
                  ? 'text-emerald-600 fill-emerald-50 dark:fill-emerald-950/30'
                  : 'text-amber-600 fill-amber-50 dark:fill-amber-950/30'
              }`}
            />
          ) : (
            <FolderOpen
              className={`h-3.5 w-3.5 shrink-0 ${
                isCore ? 'text-emerald-600' : 'text-amber-600'
              }`}
            />
          )}
          <span className="truncate text-foreground font-medium" title={group.name}>{group.name}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[10px] text-muted-foreground font-mono pointer-events-none">
            ({routeCount})
          </span>
          <div className="flex items-center gap-1 opacity-0 group-hover/folder:opacity-100 transition shrink-0">
            {onAddRoute && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddRoute(colId, group.id);
                }}
                className="p-0.5 hover:bg-muted hover:text-emerald-700 rounded text-muted-foreground cursor-pointer"
                title="Add Route"
              >
                <FilePlus className="h-3 w-3" />
              </button>
            )}
            {onAddSubgroup && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddSubgroup(colId, group.id);
                }}
                className="p-0.5 hover:bg-muted hover:text-amber-700 rounded text-muted-foreground cursor-pointer"
                title="Add Subfolder"
              >
                <FolderPlus className="h-3 w-3" />
              </button>
            )}
            {onOpenGroupSettings && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenGroupSettings(group, colId);
                }}
                className="p-0.5 hover:bg-muted hover:text-foreground rounded text-muted-foreground cursor-pointer"
                title="Folder Settings"
              >
                <Settings className="h-3 w-3" />
              </button>
            )}
            {onDeleteGroup && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteGroup(group, colId);
                }}
                className="p-0.5 hover:bg-muted hover:text-rose-700 rounded text-muted-foreground cursor-pointer"
                title="Delete Folder"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Draggable Route Item ---
interface RouteRowProps {
  route: Route;
  colId: string;
  isActive: boolean;
  onSelect?: (route: Route) => void;
  onDelete?: (route: Route) => void;
}

const RouteRow: React.FC<RouteRowProps> = ({
  route,
  colId,
  isActive,
  onSelect,
  onDelete,
}) => {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;

    return draggable({
      element: el,
      getInitialData: () => ({
        type: 'route',
        id: route.id,
        sourceCollectionId: colId,
        groupId: route.groupId,
      }),
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });
  }, [colId, route.groupId, route.id]);

  const colorClass = METHOD_COLORS[route.method as keyof typeof METHOD_COLORS]?.text || 'text-amber-800';

  return (
    <div
      ref={rowRef}
      onClick={() => onSelect?.(route)}
      className={`group/route flex items-center justify-between px-2 py-1 rounded-md cursor-pointer select-none transition ${
        isActive ? 'bg-sidebar-accent text-foreground font-semibold shadow-2xs border-l-2 border-primary' : 'hover:bg-sidebar-accent/60 text-foreground'
      } ${isDragging ? 'opacity-40' : ''}`}
    >
      <div className="flex items-center gap-1.5 min-w-0 truncate">
        <span className="p-0.5 rounded text-muted-foreground/30 group-hover/route:text-muted-foreground transition shrink-0 cursor-grab active:cursor-grabbing">
          <GripVertical className="h-3 w-3 pointer-events-none" />
        </span>
        <span className={`text-[9px] font-bold font-mono w-10 shrink-0 ${colorClass}`}>{route.method}</span>
        <span className="truncate text-xs text-foreground" title={route.name}>{route.name}</span>
      </div>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(route);
          }}
          className="opacity-0 group-hover/route:opacity-100 p-0.5 hover:text-rose-700 text-muted-foreground transition shrink-0 cursor-pointer"
          title="Delete Route"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};

// --- Droppable Folder Children Area ---
interface FolderDropZoneProps {
  groupId: string;
  colId: string;
  allGroups: RouteGroup[];
  onMoveGroupToCollection?: (
    groupId: string,
    targetCollectionId: string,
    sourceCollectionId: string,
    targetParentId?: string | null
  ) => void;
  onMoveRouteToGroup?: (routeId: string, groupId: string | null, collectionId: string) => void;
  children: React.ReactNode;
}

const FolderDropZone: React.FC<FolderDropZoneProps> = ({
  groupId,
  colId,
  allGroups,
  onMoveGroupToCollection,
  onMoveRouteToGroup,
  children,
}) => {
  const zoneRef = useRef<HTMLDivElement | null>(null);
  const [isOver, setIsOver] = useState(false);

  useEffect(() => {
    const el = zoneRef.current;
    if (!el) return;

    return dropTargetForElements({
      element: el,
      canDrop: ({ source }) => {
        const data = source.data as any;
        if (data.type === 'group') {
          if (data.id === groupId) return false;
          if (isGroupDescendant(groupId, data.id, allGroups)) return false;
          return true;
        }
        return data.type === 'route';
      },
      onDragEnter: () => setIsOver(true),
      onDragLeave: () => setIsOver(false),
      onDrop: ({ source }) => {
        setIsOver(false);
        const data = source.data as any;
        if (data.type === 'group') {
          onMoveGroupToCollection?.(data.id, colId, data.sourceCollectionId || colId, groupId);
        } else if (data.type === 'route') {
          onMoveRouteToGroup?.(data.id, groupId, colId);
        }
      },
    });
  }, [allGroups, colId, groupId, onMoveGroupToCollection, onMoveRouteToGroup]);

  return (
    <div
      ref={zoneRef}
      className={`pl-3 space-y-0.5 border-l-2 ml-2.5 my-0.5 relative transition ${
        isOver
          ? 'border-amber-500 bg-amber-500/5'
          : 'border-sidebar-border'
      }`}
    >
      {children}
      {isOver && (
        <div className="pt-1 pointer-events-none">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full border-2 border-amber-500 bg-amber-500 shrink-0 -ml-1 shadow-xs" />
            <div className="h-0.5 bg-amber-500 flex-1 rounded-full shadow-xs" />
          </div>
        </div>
      )}
    </div>
  );
};

// --- Droppable Root Area ---
interface RootDropZoneProps {
  colId: string;
  onMoveGroupToCollection?: (
    groupId: string,
    targetCollectionId: string,
    sourceCollectionId: string,
    targetParentId?: string | null
  ) => void;
  onMoveRouteToGroup?: (routeId: string, groupId: string | null, collectionId: string) => void;
  children: React.ReactNode;
}

const RootDropZone: React.FC<RootDropZoneProps> = ({
  colId,
  onMoveGroupToCollection,
  onMoveRouteToGroup,
  children,
}) => {
  const zoneRef = useRef<HTMLDivElement | null>(null);
  const [isOver, setIsOver] = useState(false);

  useEffect(() => {
    const el = zoneRef.current;
    if (!el) return;

    return dropTargetForElements({
      element: el,
      canDrop: ({ source }) => {
        const data = source.data as any;
        return data.type === 'route' || data.type === 'group';
      },
      onDragEnter: () => setIsOver(true),
      onDragLeave: () => setIsOver(false),
      onDrop: ({ source }) => {
        setIsOver(false);
        const data = source.data as any;
        if (data.type === 'group') {
          onMoveGroupToCollection?.(data.id, colId, data.sourceCollectionId || colId, null);
        } else if (data.type === 'route') {
          onMoveRouteToGroup?.(data.id, null, colId);
        }
      },
    });
  }, [colId, onMoveGroupToCollection, onMoveRouteToGroup]);

  return (
    <div
      ref={zoneRef}
      className={`space-y-0.5 rounded min-h-[8px] transition ${
        isOver ? 'bg-beak/5 ring-1 ring-beak/30 p-1' : ''
      }`}
    >
      {children}
    </div>
  );
};

// --- Droppable Tree Root Area for Collections (to unnest to root) ---
interface TreeRootDropZoneProps {
  collections: Collection[];
  onUpdateCollectionParent?: (collectionId: string, parentId: string | null) => void;
  onConvertFolderToCollection?: (collectionId: string, groupId: string) => void;
  onReorderCollections?: (collectionIds: string[]) => void;
}

const TreeRootDropZone: React.FC<TreeRootDropZoneProps> = ({
  collections,
  onUpdateCollectionParent,
  onConvertFolderToCollection,
  onReorderCollections,
}) => {
  const zoneRef = useRef<HTMLDivElement | null>(null);
  const [isOver, setIsOver] = useState(false);

  useEffect(() => {
    const el = zoneRef.current;
    if (!el) return;

    return dropTargetForElements({
      element: el,
      canDrop: ({ source }) => {
        const data = source.data as any;
        return data.type === 'collection' || data.type === 'group';
      },
      onDragEnter: () => setIsOver(true),
      onDragLeave: () => setIsOver(false),
      onDrop: ({ source }) => {
        setIsOver(false);
        const data = source.data as any;
        if (data.type === 'group') {
          onConvertFolderToCollection?.(data.sourceCollectionId, data.id);
          return;
        }
        if (data.type === 'collection') {
          const draggedCol = collections.find((c) => c.id === data.id);
          if (draggedCol?.parentId) {
            onUpdateCollectionParent?.(data.id, null);
          }
          const rootCols = collections.filter((c) => !c.parentId);
          const filtered = rootCols.filter((c) => c.id !== data.id).map((c) => c.id);
          onReorderCollections?.([...filtered, data.id]);
        }
      },
    });
  }, [collections, onConvertFolderToCollection, onReorderCollections, onUpdateCollectionParent]);

  return (
    <div
      ref={zoneRef}
      className={`min-h-[16px] my-1 rounded border border-dashed transition flex items-center justify-center text-[10px] text-muted-foreground/60 select-none ${
        isOver
          ? 'border-primary bg-beak/10 text-primary py-2 font-medium'
          : 'border-transparent hover:border-sidebar-border py-0.5 opacity-0 hover:opacity-100'
      }`}
    >
      {isOver ? 'Drop here to convert to Root Collection' : ''}
    </div>
  );
};

// --- Main Collection Tree Component ---
export const CollectionTree: React.FC<CollectionTreeProps> = ({
  collections,
  searchQuery,
  expandedCollectionId,
  routesByCollection,
  groupsByCollection,
  activeRouteId,
  onSelectRoute,
  onExpandCollection,
  onOpenCollectionSettings,
  onDeleteCollection,
  onDeleteRoute,
  onAddCollection,
  onAddRoute,
  onAddGroup,
  onOpenGroupSettings,
  onDeleteGroup,
  onMoveRouteToGroup,
  onMoveGroupToCollection,
  onUpdateCollectionParent,
  onConvertCollectionToFolder,
  onConvertFolderToCollection,
  onReorderCollections,
  onReorderGroups,
}) => {
  const [collapsedGroupIds, setCollapsedGroupIds] = useState<Record<string, boolean>>({});
  const [expandedColIds, setExpandedColIds] = useState<Record<string, boolean>>({});

  const toggleCollection = (colId: string) => {
    setExpandedColIds((prev) => {
      const isCurrentlyExpanded = prev[colId] !== undefined ? prev[colId] : colId === expandedCollectionId;
      const willBeExpanded = !isCurrentlyExpanded;
      const updated = {
        ...prev,
        [colId]: willBeExpanded,
      };

      // If expanding a child collection, ensure all its ancestor collections are expanded
      if (willBeExpanded) {
        let current: string | null | undefined = colId;
        while (current) {
          const colObj = collections.find((c) => c.id === current);
          if (colObj?.parentId) {
            updated[colObj.parentId] = true;
            current = colObj.parentId;
          } else {
            break;
          }
        }
      }

      return updated;
    });
    onExpandCollection?.(colId);
  };

  const isCollectionExpanded = (colId: string) => {
    if (query.length > 0) return true;
    if (expandedColIds[colId] !== undefined) {
      return expandedColIds[colId];
    }
    return colId === expandedCollectionId;
  };

  const toggleGroupCollapse = (groupId: string, allGroups?: RouteGroup[], e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCollapsedGroupIds((prev) => {
      const isCurrentlyCollapsed = prev[groupId] !== false;
      const willBeCollapsed = !isCurrentlyCollapsed;
      const updated = {
        ...prev,
        [groupId]: willBeCollapsed,
      };

      // If expanding, ensure all parent folders of this group are also expanded
      if (!willBeCollapsed && allGroups) {
        let currentId: string | null | undefined = groupId;
        while (currentId) {
          const currentGroup = allGroups.find((g) => g.id === currentId);
          if (currentGroup?.parentId) {
            updated[currentGroup.parentId] = false;
            currentId = currentGroup.parentId;
          } else {
            break;
          }
        }
      }

      return updated;
    });
  };

  const expandGroup = (groupId: string, allGroups?: RouteGroup[]) => {
    setCollapsedGroupIds((prev) => {
      const updated = {
        ...prev,
        [groupId]: false,
      };

      if (allGroups) {
        let currentId: string | null | undefined = groupId;
        while (currentId) {
          const currentGroup = allGroups.find((g) => g.id === currentId);
          if (currentGroup?.parentId) {
            updated[currentGroup.parentId] = false;
            currentId = currentGroup.parentId;
          } else {
            break;
          }
        }
      }

      return updated;
    });
  };

  // Auto-expand parent collections and parent groups when an active route is selected or changes
  useEffect(() => {
    if (!activeRouteId) return;

    let foundRoute: Route | undefined;
    let foundColId: string | undefined;

    if (routesByCollection) {
      for (const [cId, rList] of Object.entries(routesByCollection)) {
        const r = rList.find((item) => item.id === activeRouteId);
        if (r) {
          foundRoute = r;
          foundColId = cId;
          break;
        }
      }
    }

    if (foundRoute && foundColId) {
      // Expand collection and all its ancestor collections
      setExpandedColIds((prev) => {
        const updated = { ...prev, [foundColId!]: true };
        let current: string | null | undefined = foundColId;
        while (current) {
          const colObj = collections.find((c) => c.id === current);
          if (colObj?.parentId) {
            updated[colObj.parentId] = true;
            current = colObj.parentId;
          } else {
            break;
          }
        }
        return updated;
      });

      // Expand group and all its ancestor groups
      if (foundRoute.groupId && groupsByCollection?.[foundColId]) {
        const colGroups = groupsByCollection[foundColId];
        setCollapsedGroupIds((prev) => {
          const updated = { ...prev };
          let currGroupId: string | null | undefined = foundRoute!.groupId;
          while (currGroupId) {
            updated[currGroupId] = false;
            const g = colGroups.find((item) => item.id === currGroupId);
            currGroupId = g?.parentId;
          }
          return updated;
        });
      }
    }
  }, [activeRouteId, routesByCollection, groupsByCollection, collections]);

  const query = searchQuery.trim().toLowerCase();

  if (collections.length === 0) {
    return (
      <div className="px-4 py-8 text-center space-y-3">
        <div className="text-muted-foreground italic text-xs">No collections yet.</div>
        {onAddCollection && (
          <button
            onClick={onAddCollection}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded font-medium text-xs transition shadow"
          >
            <Folder className="h-3.5 w-3.5" />
            <span>Create Collection</span>
          </button>
        )}
      </div>
    );
  }

  const filteredCollections = collections.filter((col) => {
    if (!query) return true;
    const matchColName = col.name.toLowerCase().includes(query);
    const matchColType = col.type.toLowerCase().includes(query);
    const colRoutes = routesByCollection?.[col.id] || [];
    const matchRoute = colRoutes.some(
      (r) =>
        r.name.toLowerCase().includes(query) ||
        r.originalPattern.toLowerCase().includes(query) ||
        r.method.toLowerCase().includes(query)
    );
    return matchColName || matchColType || matchRoute;
  });

  if (filteredCollections.length === 0) {
    return (
      <div className="px-4 py-6 text-center text-muted-foreground italic text-xs">
        No collection or endpoint matching &quot;{searchQuery}&quot;
      </div>
    );
  }

  // Recursive Group Node Renderer
  const renderGroupNode = (
    group: RouteGroup,
    col: Collection,
    allGroups: RouteGroup[],
    allRoutes: Route[],
    level: number = 0,
    isParentCore: boolean = false
  ) => {
    const isCore = isParentCore || !!col.isCore;
    const groupRoutes = allRoutes.filter((r) => r.groupId === group.id);
    const childGroups = allGroups.filter((g) => g.parentId === group.id);
    const isGroupCollapsed = !query && (collapsedGroupIds[group.id] !== false);

    return (
      <div key={group.id} className="space-y-0.5">
        <GroupRow
          group={group}
          colId={col.id}
          allGroups={allGroups}
          routeCount={groupRoutes.length}
          isCore={isCore}
          isCollapsed={isGroupCollapsed}
          isSearching={query.length > 0}
          level={level}
          onToggleCollapse={(e) => toggleGroupCollapse(group.id, allGroups, e)}
          onAddRoute={onAddRoute}
          onAddSubgroup={onAddGroup}
          onOpenGroupSettings={onOpenGroupSettings}
          onDeleteGroup={onDeleteGroup}
          onMoveGroupToCollection={onMoveGroupToCollection}
          onConvertCollectionToFolder={onConvertCollectionToFolder}
          onMoveRouteToGroup={onMoveRouteToGroup}
          onReorderGroups={onReorderGroups}
          onExpandGroup={() => expandGroup(group.id, allGroups)}
        />

        {!isGroupCollapsed && (
          <FolderDropZone
            groupId={group.id}
            colId={col.id}
            allGroups={allGroups}
            onMoveGroupToCollection={onMoveGroupToCollection}
            onMoveRouteToGroup={onMoveRouteToGroup}
          >
            {/* Child Subfolders */}
            {childGroups.map((childGroup) =>
              renderGroupNode(childGroup, col, allGroups, allRoutes, level + 1, isCore)
            )}

            {/* Direct Routes in this folder */}
            {groupRoutes.map((route) => (
              <RouteRow
                key={route.id}
                route={route}
                colId={col.id}
                isActive={route.id === activeRouteId}
                onSelect={onSelectRoute}
                onDelete={onDeleteRoute}
              />
            ))}

            {childGroups.length === 0 && groupRoutes.length === 0 && (
              <div className="px-2 py-1.5 text-[11px] text-muted-foreground/70 italic border border-dashed border-sidebar-border rounded my-1 text-center select-none">
                Drop routes or subfolders here
              </div>
            )}
          </FolderDropZone>
        )}
      </div>
    );
  };

  // Recursive Collection Node Renderer
  const renderCollectionNode = (col: Collection, level: number = 0, isParentCore: boolean = false) => {
    const isCore = isParentCore || !!col.isCore;
    const routes = routesByCollection?.[col.id] || [];
    const groups = groupsByCollection?.[col.id] || [];
    const isSearching = query.length > 0;
    const isExpanded = isCollectionExpanded(col.id);

    const filteredRoutes = routes.filter((r) => {
      if (!query) return true;
      const colMatch = col.name.toLowerCase().includes(query) || col.type.toLowerCase().includes(query);
      if (colMatch) return true;
      return (
        r.name.toLowerCase().includes(query) ||
        r.originalPattern.toLowerCase().includes(query) ||
        r.method.toLowerCase().includes(query)
      );
    });

    const childCollections = collections.filter((c) => c.parentId === col.id);
    const rootGroups = groups.filter((g) => !g.parentId);
    const ungrouped = filteredRoutes.filter((r) => !r.groupId);

    return (
      <div key={col.id} className="space-y-0.5">
        <CollectionRow
          col={col}
          collections={collections}
          routeCount={routes.length}
          isCore={isCore}
          isExpanded={isExpanded}
          isSearching={isSearching}
          level={level}
          onExpand={() => toggleCollection(col.id)}
          onAddRoute={onAddRoute}
          onAddGroup={onAddGroup}
          onOpenSettings={onOpenCollectionSettings}
          onDelete={onDeleteCollection}
          onReorderCollections={onReorderCollections}
          onMoveGroupToCollection={onMoveGroupToCollection}
          onUpdateCollectionParent={onUpdateCollectionParent}
          onConvertCollectionToFolder={onConvertCollectionToFolder}
          onMoveRouteToGroup={onMoveRouteToGroup}
        />

        {isExpanded && (
          <div className="pl-3 space-y-0.5 border-l-2 border-sidebar-border ml-2.5 my-0.5">
            {/* Nested Child Collections */}
            {childCollections.map((childCol) => renderCollectionNode(childCol, level + 1, isCore))}

            {/* Root Folders and their recursive subfolders */}
            {rootGroups.map((group) => renderGroupNode(group, col, groups, routes, 0, isCore))}

            {/* Ungrouped Root Endpoints with drop zone */}
            <RootDropZone
              colId={col.id}
              onMoveGroupToCollection={onMoveGroupToCollection}
              onMoveRouteToGroup={onMoveRouteToGroup}
            >
              {ungrouped.map((route) => (
                <RouteRow
                  key={route.id}
                  route={route}
                  colId={col.id}
                  isActive={route.id === activeRouteId}
                  onSelect={onSelectRoute}
                  onDelete={onDeleteRoute}
                />
              ))}
            </RootDropZone>
          </div>
        )}
      </div>
    );
  };

  const rootCollections = query.length > 0
    ? filteredCollections
    : filteredCollections.filter((col) => !col.parentId || !collections.some((c) => c.id === col.parentId));

  return (
    <>
      {rootCollections.map((col) => renderCollectionNode(col, 0))}
      <TreeRootDropZone
        collections={collections}
        onUpdateCollectionParent={onUpdateCollectionParent}
        onConvertFolderToCollection={onConvertFolderToCollection}
        onReorderCollections={onReorderCollections}
      />
    </>
  );
};
