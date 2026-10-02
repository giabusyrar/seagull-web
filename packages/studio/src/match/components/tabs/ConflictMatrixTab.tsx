'use client';

import React from 'react';
import { ShieldAlert, Pencil, Trash2, Building, Smartphone } from 'lucide-react';
import { SearchFilterBar, DataTable, Button, type ColumnDef } from '@gateway-experience/shared';
import type { ConflictMatrixRule } from '../../types';

interface ConflictMatrixTabProps {
  conflicts: ConflictMatrixRule[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (c: ConflictMatrixRule) => void;
  onDeleteConflict: (id: string) => void;
  selectedBrand: string;
  setSelectedBrand: (b: string) => void;
  selectedApp: string;
  setSelectedApp: (a: string) => void;
}

export const ConflictMatrixTab: React.FC<ConflictMatrixTabProps> = ({
  conflicts,
  searchQuery,
  onSearchChange,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteConflict,
  selectedBrand,
  setSelectedBrand,
  selectedApp,
  setSelectedApp,
}) => {
  const filtered = conflicts.filter((c) => {
    if (selectedBrand !== '*' && c.brandId && c.brandId !== '*' && c.brandId !== selectedBrand) {
      return false;
    }
    if (selectedApp !== '*' && c.applicationId && c.applicationId !== '*' && c.applicationId !== selectedApp) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.ingredientA.toLowerCase().includes(q) ||
      c.ingredientB.toLowerCase().includes(q) ||
      c.conflictType.toLowerCase().includes(q) ||
      (c.warningMessage && c.warningMessage.toLowerCase().includes(q))
    );
  });

  const activeFilterCount = (selectedBrand !== '*' ? 1 : 0) + (selectedApp !== '*' ? 1 : 0);

  const customFilterContent = (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <span className="text-xs font-bold text-foreground uppercase tracking-wider">Multi-Tenant Filters</span>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={() => {
              setSelectedBrand('*');
              setSelectedApp('*');
            }}
            className="text-[10px] text-beak hover:underline cursor-pointer"
          >
            Reset All
          </button>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
          <Building className="h-3 w-3 text-beak" />
          <span>Brand Scope</span>
        </label>
        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="w-full bg-secondary/50 border border-border rounded-lg p-2 text-xs font-bold text-beak focus:border-ring outline-none cursor-pointer"
        >
          <option value="*" className="bg-popover text-popover-foreground">All Brands (*)</option>
          <option value="wardah" className="bg-popover text-popover-foreground">Wardah Beauty</option>
          <option value="kahf" className="bg-popover text-popover-foreground">Kahf Men Care</option>
          <option value="labore" className="bg-popover text-popover-foreground">Laboré Sensitive Skin</option>
          <option value="emina" className="bg-popover text-popover-foreground">Emina Teen & Young</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
          <Smartphone className="h-3 w-3 text-sky-400" />
          <span>Channel / Application</span>
        </label>
        <select
          value={selectedApp}
          onChange={(e) => setSelectedApp(e.target.value)}
          className="w-full bg-secondary/50 border border-border rounded-lg p-2 text-xs font-bold text-sky-400 focus:border-ring outline-none cursor-pointer"
        >
          <option value="*" className="bg-popover text-popover-foreground">Omnichannel (*)</option>
          <option value="ecommerce_mobile" className="bg-popover text-popover-foreground">Mobile App</option>
          <option value="store_kiosk" className="bg-popover text-popover-foreground">Skin Kiosk</option>
          <option value="web_consult" className="bg-popover text-popover-foreground">Online Portal</option>
        </select>
      </div>
    </div>
  );

  const columns: ColumnDef<ConflictMatrixRule>[] = [
    {
      key: 'ingredientA',
      header: 'Ingredient A',
      render: (c) => (
        <div className="font-semibold text-rose-400 flex items-center gap-2">
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>{c.ingredientA}</span>
        </div>
      ),
    },
    {
      key: 'ingredientB',
      header: 'Ingredient B',
      render: (c) => <span className="font-semibold text-rose-300 font-mono">{c.ingredientB}</span>,
    },
    {
      key: 'conflictType',
      header: 'Conflict Type',
      render: (c) => (
        <span className="bg-rose-500/15 text-rose-400 font-mono px-2 py-0.5 rounded text-[10px] uppercase border border-rose-500/30 font-bold">
          {c.conflictType}
        </span>
      ),
    },
    {
      key: 'resolutionAction',
      header: 'Routine Resolution',
      render: (c) => (
        <span className="font-mono font-bold text-amber-300 uppercase text-[11px]">
          {c.resolutionAction}
        </span>
      ),
    },
    {
      key: 'warningMessage',
      header: 'Clinical Warning Copy',
      render: (c) => (
        <span className="text-muted-foreground text-xs max-w-xs truncate block" title={c.warningMessage}>
          {c.warningMessage || '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (c) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onOpenEditModal(c)}
            title="Edit Conflict"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onDeleteConflict(c.id)}
            title="Delete Conflict"
            className="hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search conflicting ingredient pairs..."
        actionLabel="New Conflict Rule"
        onAction={onOpenAddModal}
        customFilterContent={customFilterContent}
        activeFilterCount={activeFilterCount}
      />

      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(c) => c.id}
        emptyMessage="No conflict matrix rules found for current filters."
      />
    </div>
  );
};
