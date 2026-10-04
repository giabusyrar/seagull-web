'use client';

import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { SearchFilterBar, DataTable, Button, type ColumnDef } from '@gateway-experience/shared';
import type { Shade } from '../../types';

interface ShadesTabProps {
  shades: Shade[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (s: Shade) => void;
  onDeleteShade: (id: string) => void;
}

export const ShadesTab: React.FC<ShadesTabProps> = ({
  shades,
  searchQuery,
  onSearchChange,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteShade,
}) => {
  const filtered = shades.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.hexColor.toLowerCase().includes(q);
  });

  const columns: ColumnDef<Shade>[] = [
    {
      key: 'name',
      header: 'Shade',
      render: (s) => (
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-full border border-white/10 shrink-0" style={{ backgroundColor: s.hexColor }} />
          <div className="flex flex-col">
            <span className="font-semibold text-foreground">{s.name}</span>
            <span className="text-[10px] font-mono text-muted-foreground">{s.hexColor}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'region',
      header: 'Applies To',
      render: (s) => <span className="font-mono text-[10px] uppercase text-muted-foreground">{s.region}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (s) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon-xs" onClick={() => onOpenEditModal(s)} title="Edit Shade">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={() => onDeleteShade(s.id)} title="Delete Shade" className="hover:text-destructive">
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
        searchPlaceholder="Search shades by name or hex color..."
        actionLabel="New Shade"
        onAction={onOpenAddModal}
      />
      <DataTable columns={columns} data={filtered} keyExtractor={(s) => s.id} emptyMessage="No shades defined for this product yet." />
    </div>
  );
};
