'use client';

import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Settings,
  Search,
  X,
  Tag,
  Package,
  LayoutGrid,
  Droplet,
  Sparkles,
  Layers,
  FileText,
  Target,
  Puzzle,
  ExternalLink,
  PanelLeftOpen,
  Award,
  Smartphone,
  ShieldAlert,
  Palette,
} from 'lucide-react';

import type { ApiClientRequest, ResponseData, Collection, Route, RouteGroup, Environment } from '@/types/api-client';
import { SidebarHeader } from './SidebarHeader';
import { CollectionTree } from '@/features/collections';

type ReferenceItem = { entity: string; label: string; icon: React.ComponentType<{ className?: string }> };
type ReferenceGroup = { id: string; label: string; icon: React.ComponentType<{ className?: string }>; items: ReferenceItem[] };

// Reference Data, grouped by what each type describes. `entity` is the reference route slug
// (/reference/[entity], REFERENCE_ENTITY_CONFIGS).
const REFERENCE_GROUPS: ReferenceGroup[] = [
  {
    id: 'catalogue',
    label: 'Catalogue',
    icon: Package,
    items: [
      { entity: 'brands', label: 'Brands', icon: Tag },
      { entity: 'products', label: 'Products', icon: Package },
      { entity: 'categories', label: 'Categories', icon: LayoutGrid },
      { entity: 'textures', label: 'Textures', icon: Droplet },
      { entity: 'ingredients', label: 'Active Ingredients', icon: Sparkles },
    ],
  },
  {
    id: 'skin-science',
    label: 'Skin Science',
    icon: Target,
    items: [
      { entity: 'dimensions', label: 'Dimensions', icon: Target },
      { entity: 'skin-conditions', label: 'Skin Conditions', icon: ShieldAlert },
      { entity: 'severity-tier-groups', label: 'Severity Tier Groups', icon: ShieldAlert },
    ],
  },
  {
    id: 'customer-safety',
    label: 'Customer Safety',
    icon: ShieldAlert,
    items: [{ entity: 'conditions', label: 'Customer Conditions', icon: Tag }],
  },
];

export interface HistoryItem {
  id: string;
  request: ApiClientRequest;
  response: ResponseData;
  timestamp: number;
}

export interface SidebarProps {
  history: HistoryItem[];
  onSelectRequest: (request: ApiClientRequest, response?: ResponseData) => void;
  collections: Collection[];
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
  onMoveGroupToCollection?: (groupId: string, targetCollectionId: string, sourceCollectionId: string, targetParentId?: string | null) => void;
  onUpdateCollectionParent?: (collectionId: string, parentId?: string | null) => void;
  onConvertCollectionToFolder?: (collectionId: string, targetCollectionId: string, targetParentGroupId?: string | null) => void;
  onConvertFolderToCollection?: (collectionId: string, groupId: string) => void;
  onReorderCollections?: (collectionIds: string[]) => void;
  onReorderGroups?: (collectionId: string, groupIds: string[]) => void;
  globalEnvironments?: Environment[];
  onOpenGlobalEnvironmentsModal?: () => void;
  // Core Engine & Reference callbacks
  onOpenForms?: () => void;
  onOpenScoring?: () => void;
  onOpenMatching?: () => void;
  onOpenSimulatorStudio?: () => void;
  onOpenAssessments?: () => void;
  onOpenApplications?: () => void;
  onOpenReference?: (entity?: string) => void;
  onOpenApiKeys?: () => void;
  // Responsive sidebar state
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const ApiClientSidebar: React.FC<SidebarProps> = ({
  onSelectRequest,
  collections,
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
  onOpenForms,
  onOpenScoring,
  onOpenMatching,
  onOpenSimulatorStudio,
  onOpenAssessments,
  onOpenApplications,
  onOpenReference,
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  // Collapsible section visibility states — all closed by default
  const [isGatewayOpen, setIsGatewayOpen] = useState(false);
  const [isCoreEnginesOpen, setIsCoreEnginesOpen] = useState(false);
  const [isMasterDataOpen, setIsMasterDataOpen] = useState(false);
  const [isReferenceOpen, setIsReferenceOpen] = useState(false);
  const [closedReferenceGroups, setClosedReferenceGroups] = useState<Record<string, boolean>>({});

  const [searchQuery, setSearchQuery] = useState('');
  const isSearching = searchQuery.trim().length > 0;
  const showGateway = isSearching || isGatewayOpen;
  const showCoreEngines = isSearching || isCoreEnginesOpen;
  const showMasterData = isSearching || isMasterDataOpen;
  const showReference = isSearching || isReferenceOpen;

  // DESKTOP COLLAPSED ICON-RAIL VIEW
  if (isCollapsed) {
    return (
      <aside className="hidden md:flex w-12 bg-sidebar border-r border-sidebar-border flex-col items-center py-2 shrink-0 select-none text-xs text-sidebar-foreground h-full justify-between">
        <div className="flex flex-col items-center gap-2.5 w-full">
          {/* Expand Sidebar Button */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1.5 hover:bg-sidebar-accent hover:text-sidebar-foreground rounded-md text-muted-foreground transition cursor-pointer"
            title="Expand Sidebar"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>

          <div className="w-6 border-b border-sidebar-border my-0.5" />

          {/* Icon Shortcuts */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1.5 hover:bg-sidebar-accent hover:text-sidebar-foreground rounded-md text-muted-foreground transition cursor-pointer relative group"
            title="API Collections"
          >
            <Layers className="h-4 w-4" />
            <span className="absolute left-12 bg-popover text-popover-foreground text-[10px] font-medium px-2 py-1 rounded border border-border shadow-xs opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-50">
              API Collections
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenForms}
            className="p-1.5 hover:bg-sidebar-accent hover:text-sidebar-foreground rounded-md text-muted-foreground transition cursor-pointer relative group"
            title="Form Engine"
          >
            <FileText className="h-4 w-4" />
            <span className="absolute left-12 bg-popover text-popover-foreground text-[10px] font-medium px-2 py-1 rounded border border-border shadow-xs opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-50">
              Form Engine
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenScoring}
            className="p-1.5 hover:bg-sidebar-accent hover:text-sidebar-foreground rounded-md text-muted-foreground transition cursor-pointer relative group"
            title="Score Engine"
          >
            <Award className="h-4 w-4" />
            <span className="absolute left-12 bg-popover text-popover-foreground text-[10px] font-medium px-2 py-1 rounded border border-border shadow-xs opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-50">
              Score Engine
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenMatching}
            className="p-1.5 hover:bg-sidebar-accent hover:text-sidebar-foreground rounded-md text-muted-foreground transition cursor-pointer relative group"
            title="Matching Engine"
          >
            <Puzzle className="h-4 w-4" />
            <span className="absolute left-12 bg-popover text-popover-foreground text-[10px] font-medium px-2 py-1 rounded border border-border shadow-xs opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-50">
              Matching Engine
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenSimulatorStudio}
            className="p-1.5 hover:bg-sidebar-accent hover:text-sidebar-foreground rounded-md text-muted-foreground transition cursor-pointer relative group"
            title="Simulator Studio"
          >
            <Palette className="h-4 w-4" />
            <span className="absolute left-12 bg-popover text-popover-foreground text-[10px] font-medium px-2 py-1 rounded border border-border shadow-xs opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-50">
              Simulator Studio
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenAssessments}
            className="p-1.5 hover:bg-sidebar-accent hover:text-sidebar-foreground rounded-md text-muted-foreground transition cursor-pointer relative group"
            title="Assessments"
          >
            <FileText className="h-4 w-4" />
            <span className="absolute left-12 bg-popover text-popover-foreground text-[10px] font-medium px-2 py-1 rounded border border-border shadow-xs opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-50">
              Assessments
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenApplications}
            className="p-1.5 hover:bg-sidebar-accent hover:text-sidebar-foreground rounded-md text-muted-foreground transition cursor-pointer relative group"
            title="Applications"
          >
            <Smartphone className="h-4 w-4" />
            <span className="absolute left-12 bg-popover text-popover-foreground text-[10px] font-medium px-2 py-1 rounded border border-border shadow-xs opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-50">
              Applications
            </span>
          </button>

          <button
            type="button"
            onClick={() => onOpenReference?.('brands')}
            className="p-1.5 hover:bg-sidebar-accent hover:text-sidebar-foreground rounded-md text-muted-foreground transition cursor-pointer relative group"
            title="Brands"
          >
            <Tag className="h-4 w-4" />
            <span className="absolute left-12 bg-popover text-popover-foreground text-[10px] font-medium px-2 py-1 rounded border border-border shadow-xs opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-50">
              Brands
            </span>
          </button>

          <button
            type="button"
            onClick={() => onOpenReference?.('products')}
            className="p-1.5 hover:bg-sidebar-accent hover:text-sidebar-foreground rounded-md text-muted-foreground transition cursor-pointer relative group"
            title="Products"
          >
            <Package className="h-4 w-4" />
            <span className="absolute left-12 bg-popover text-popover-foreground text-[10px] font-medium px-2 py-1 rounded border border-border shadow-xs opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-50">
              Products
            </span>
          </button>

          <button
            type="button"
            onClick={() => onOpenReference?.('categories')}
            className="p-1.5 hover:bg-sidebar-accent hover:text-sidebar-foreground rounded-md text-muted-foreground transition cursor-pointer relative group"
            title="Categories"
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="absolute left-12 bg-popover text-popover-foreground text-[10px] font-medium px-2 py-1 rounded border border-border shadow-xs opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-50">
              Categories
            </span>
          </button>

          <button
            type="button"
            onClick={() => onOpenReference?.('textures')}
            className="p-1.5 hover:bg-sidebar-accent hover:text-sidebar-foreground rounded-md text-muted-foreground transition cursor-pointer relative group"
            title="Textures"
          >
            <Droplet className="h-4 w-4" />
            <span className="absolute left-12 bg-popover text-popover-foreground text-[10px] font-medium px-2 py-1 rounded border border-border shadow-xs opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-50">
              Textures
            </span>
          </button>

          <button
            type="button"
            onClick={() => onOpenReference?.('skin-conditions')}
            className="p-1.5 hover:bg-sidebar-accent hover:text-sidebar-foreground rounded-md text-muted-foreground transition cursor-pointer relative group"
            title="Skin Conditions"
          >
            <ShieldAlert className="h-4 w-4" />
            <span className="absolute left-12 bg-popover text-popover-foreground text-[10px] font-medium px-2 py-1 rounded border border-border shadow-xs opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-50">
              Skin Conditions
            </span>
          </button>
        </div>
      </aside>
    );
  }

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Responsive Sidebar Container */}
      <aside
        className={`${
          isMobileOpen
            ? 'fixed inset-y-0 left-0 z-50 w-80 shadow-xl'
            : 'hidden md:flex w-80'
        } bg-sidebar border-r border-sidebar-border flex-col shrink-0 select-none text-xs text-sidebar-foreground h-full overflow-hidden transition-all duration-200 ease-in-out`}
      >
        <SidebarHeader
          onAddCollection={onAddCollection}
          onToggleCollapse={onToggleCollapse}
          onCloseMobile={onCloseMobile}
        />

        {/* Global Search Input */}
        <div className="px-2 py-1.5 border-b border-sidebar-border bg-sidebar shrink-0">
          <div className="relative flex items-center">
            <Search
              style={{ left: '0.625rem' }}
              className="h-3.5 w-3.5 text-muted-foreground absolute top-1/2 -translate-y-1/2 pointer-events-none z-10 shrink-0"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter routes & engines..."
              style={{ paddingLeft: '2rem', paddingRight: searchQuery ? '1.75rem' : '0.5rem' }}
              className="w-full bg-background text-foreground placeholder:text-muted-foreground text-xs rounded-md pl-8 pr-6 py-1 border border-sidebar-border focus:border-sidebar-ring outline-none transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ right: '0.375rem' }}
                className="absolute top-1/2 -translate-y-1/2 p-0.5 hover:text-foreground text-muted-foreground rounded cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Sections Container */}
        <div className="flex-1 overflow-y-auto min-h-0 py-1 space-y-1">
          
          {/* SECTION 1: API COLLECTIONS */}
          <div className="border-b border-sidebar-border pb-1">
            <div
              onClick={() => setIsGatewayOpen(!isGatewayOpen)}
              className="flex items-center justify-between px-2.5 py-1.5 hover:bg-sidebar-accent cursor-pointer text-foreground font-semibold text-xs tracking-wide transition rounded-md mx-1"
            >
              <div className="flex items-center gap-1.5">
                {showGateway ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                <Layers className="h-3.5 w-3.5" />
                <span>API Collections</span>
              </div>
            </div>

            {showGateway && (
              <div className="pt-0.5">
                <CollectionTree
                  collections={collections}
                  searchQuery={searchQuery}
                  expandedCollectionId={expandedCollectionId}
                  routesByCollection={routesByCollection}
                  groupsByCollection={groupsByCollection}
                  activeRouteId={activeRouteId}
                  onSelectRoute={(route) => {
                    onSelectRoute?.(route);
                    if (isMobileOpen && onCloseMobile) onCloseMobile();
                  }}
                  onExpandCollection={onExpandCollection}
                  onOpenCollectionSettings={onOpenCollectionSettings}
                  onDeleteCollection={onDeleteCollection}
                  onDeleteRoute={onDeleteRoute}
                  onAddCollection={onAddCollection}
                  onAddRoute={onAddRoute}
                  onAddGroup={onAddGroup}
                  onOpenGroupSettings={onOpenGroupSettings}
                  onDeleteGroup={onDeleteGroup}
                  onMoveRouteToGroup={onMoveRouteToGroup}
                  onMoveGroupToCollection={onMoveGroupToCollection}
                  onUpdateCollectionParent={onUpdateCollectionParent}
                  onConvertCollectionToFolder={onConvertCollectionToFolder}
                  onConvertFolderToCollection={onConvertFolderToCollection}
                  onReorderCollections={onReorderCollections}
                  onReorderGroups={onReorderGroups}
                />
              </div>
            )}
          </div>

          {/* SECTION 2: CORE ENGINE */}
          <div className="border-b border-sidebar-border pb-1">
            <div
              onClick={() => setIsCoreEnginesOpen(!isCoreEnginesOpen)}
              className="flex items-center justify-between px-2.5 py-1.5 hover:bg-sidebar-accent cursor-pointer text-foreground font-semibold text-xs tracking-wide transition rounded-md mx-1"
            >
              <div className="flex items-center gap-1.5">
                {showCoreEngines ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                <Settings className="h-3.5 w-3.5" />
                <span>Core Engines</span>
              </div>
            </div>

            {showCoreEngines && (
              <div className="px-2 pt-1 space-y-1">
                {/* Form Engine */}
                <button
                  type="button"
                  onClick={() => {
                    onOpenForms?.();
                    if (isMobileOpen && onCloseMobile) onCloseMobile();
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 bg-card hover:bg-sidebar-accent border border-sidebar-border hover:border-sidebar-ring/40 rounded-md text-left transition group cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground shrink-0" />
                    <span className="text-xs font-medium text-foreground truncate" title="Form Engine">Form Engine</span>
                  </div>
                  <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-foreground shrink-0 opacity-0 group-hover:opacity-100 transition" />
                </button>

                {/* Score Engine */}
                <button
                  type="button"
                  onClick={() => {
                    onOpenScoring?.();
                    if (isMobileOpen && onCloseMobile) onCloseMobile();
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 bg-card hover:bg-sidebar-accent border border-sidebar-border hover:border-sidebar-ring/40 rounded-md text-left transition group cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Award className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground shrink-0" />
                    <span className="text-xs font-medium text-foreground truncate" title="Score Engine">Score Engine</span>
                  </div>
                  <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-foreground shrink-0 opacity-0 group-hover:opacity-100 transition" />
                </button>

                {/* Matching Engine */}
                <button
                  type="button"
                  onClick={() => {
                    onOpenMatching?.();
                    if (isMobileOpen && onCloseMobile) onCloseMobile();
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 bg-card hover:bg-sidebar-accent border border-sidebar-border hover:border-sidebar-ring/40 rounded-md text-left transition group cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Puzzle className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground shrink-0" />
                    <span className="text-xs font-medium text-foreground truncate" title="Matching Engine">Matching Engine</span>
                  </div>
                  <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-foreground shrink-0 opacity-0 group-hover:opacity-100 transition" />
                </button>

                {/* Simulator Studio (was Try-On, then Vision Engine): the simulator's flow and results */}
                <button
                  type="button"
                  onClick={() => {
                    onOpenSimulatorStudio?.();
                    if (isMobileOpen && onCloseMobile) onCloseMobile();
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 bg-card hover:bg-sidebar-accent border border-sidebar-border hover:border-sidebar-ring/40 rounded-md text-left transition group cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Palette className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground shrink-0" />
                    <span className="text-xs font-medium text-foreground truncate" title="Simulator Studio">Simulator Studio</span>
                  </div>
                  <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-foreground shrink-0 opacity-0 group-hover:opacity-100 transition" />
                </button>
              </div>
            )}
          </div>

          {/* SECTION 3: MASTER DATA */}
          <div className="border-b border-sidebar-border pb-1">
            <div
              onClick={() => setIsMasterDataOpen(!isMasterDataOpen)}
              className="flex items-center justify-between px-2.5 py-1.5 hover:bg-sidebar-accent cursor-pointer text-foreground font-semibold text-xs tracking-wide transition rounded-md mx-1"
            >
              <div className="flex items-center gap-1.5">
                {showMasterData ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                <Package className="h-3.5 w-3.5" />
                <span>Master Data</span>
              </div>
            </div>

            {showMasterData && (
              <div className="px-2 pt-1 space-y-1">
                {/* Diagnostic Assessments */}
                <button
                  type="button"
                  onClick={() => {
                    onOpenAssessments?.();
                    if (isMobileOpen && onCloseMobile) onCloseMobile();
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 bg-card hover:bg-sidebar-accent border border-sidebar-border hover:border-sidebar-ring/40 rounded-md text-left transition group cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground shrink-0" />
                    <span className="text-xs font-medium text-foreground truncate" title="Assessments">Assessments</span>
                  </div>
                  <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-foreground shrink-0 opacity-0 group-hover:opacity-100 transition" />
                </button>

                {/* Applications & Channels */}
                <button
                  type="button"
                  onClick={() => {
                    onOpenApplications?.();
                    if (isMobileOpen && onCloseMobile) onCloseMobile();
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 bg-card hover:bg-sidebar-accent border border-sidebar-border hover:border-sidebar-ring/40 rounded-md text-left transition group cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Smartphone className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground shrink-0" />
                    <span className="text-xs font-medium text-foreground truncate" title="Applications">Applications</span>
                  </div>
                  <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-foreground shrink-0 opacity-0 group-hover:opacity-100 transition" />
                </button>
              </div>
            )}
          </div>

          {/* SECTION 4: REFERENCE DATA */}
          <div>
            <div
              onClick={() => setIsReferenceOpen(!isReferenceOpen)}
              className="flex items-center justify-between px-2.5 py-1.5 hover:bg-sidebar-accent cursor-pointer text-foreground font-semibold text-xs tracking-wide transition rounded-md mx-1"
            >
              <div className="flex items-center gap-1.5">
                {showReference ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                <Tag className="h-3.5 w-3.5" />
                <span>Reference Data</span>
              </div>
            </div>

            {showReference && (
              <div className="px-2 pt-1 space-y-2">
                {REFERENCE_GROUPS.map((group) => {
                  const GroupIcon = group.icon;
                  const groupOpen = isSearching || !closedReferenceGroups[group.id];
                  return (
                    <div key={group.id}>
                      <button
                        type="button"
                        onClick={() => setClosedReferenceGroups((prev) => ({ ...prev, [group.id]: !prev[group.id] }))}
                        aria-expanded={groupOpen}
                        className="w-full flex items-center gap-1.5 px-1.5 py-1 hover:bg-sidebar-accent rounded-md text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition cursor-pointer"
                      >
                        {groupOpen ? <ChevronDown className="h-3 w-3 shrink-0" /> : <ChevronRight className="h-3 w-3 shrink-0" />}
                        <GroupIcon className="h-3 w-3 shrink-0" />
                        <span className="truncate">{group.label}</span>
                      </button>
                      {groupOpen && (
                        <div className="pl-3 pt-1 space-y-1">
                          {group.items.map((item) => {
                            const ItemIcon = item.icon;
                            return (
                              <button
                                key={item.entity}
                                type="button"
                                onClick={() => {
                                  onOpenReference?.(item.entity);
                                  if (isMobileOpen && onCloseMobile) onCloseMobile();
                                }}
                                className="w-full flex items-center justify-between px-2.5 py-1.5 bg-card hover:bg-sidebar-accent border border-sidebar-border hover:border-sidebar-ring/40 rounded-md text-left transition group cursor-pointer shadow-2xs"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <ItemIcon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground shrink-0" />
                                  <span className="text-xs font-medium text-foreground truncate" title={item.label}>{item.label}</span>
                                </div>
                                <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-foreground shrink-0 opacity-0 group-hover:opacity-100 transition" />
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export { ApiClientSidebar as Sidebar };
