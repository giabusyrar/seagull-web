'use client';

import React from 'react';
import { Boxes, Pencil, Trash2, Building, Smartphone, CheckCircle2, XCircle } from 'lucide-react';
import { SearchFilterBar, DataTable, Button, type ColumnDef, BrandSelect, ApplicationSelect } from '@gateway-experience/shared';
import type { ProductGroup } from '../../types';

interface ProductGroupsTabProps {
  groups: ProductGroup[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (g: ProductGroup) => void;
  onDeleteGroup: (id: string) => void;
  selectedBrand: string;
  setSelectedBrand: (b: string) => void;
  selectedApp: string;
  setSelectedApp: (a: string) => void;
}

export const ProductGroupsTab: React.FC<ProductGroupsTabProps> = ({
  groups,
  searchQuery,
  onSearchChange,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteGroup,
  selectedBrand,
  setSelectedBrand,
  selectedApp,
  setSelectedApp,
}) => {
  const filtered = groups.filter((g) => {
    if (selectedBrand !== '*' && g.brandId && g.brandId !== '*' && g.brandId !== selectedBrand) {
      return false;
    }
    if (selectedApp !== '*' && g.applicationId && g.applicationId !== '*' && g.applicationId !== selectedApp) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      g.name.toLowerCase().includes(q) ||
      (g.code || '').toLowerCase().includes(q) ||
      g.categories.some((c) => c.toLowerCase().includes(q))
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
            className="text-[10px] text-primary hover:underline cursor-pointer"
          >
            Reset All
          </button>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
          <Building className="h-3 w-3 text-primary" />
          <span>Brand Scope</span>
        </label>
        <BrandSelect value={selectedBrand} onChange={setSelectedBrand} includeUniversal label="" />
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
          <Smartphone className="h-3 w-3 text-sky-400" />
          <span>Channel / Application</span>
        </label>
        <ApplicationSelect value={selectedApp} onChange={setSelectedApp} includeUniversal label="" />
      </div>
    </div>
  );

  const columns: ColumnDef<ProductGroup>[] = [
    {
      key: 'name',
      header: 'Campaign Group',
      render: (g) => (
        <div className="flex flex-col gap-0.5">
          <div className="font-semibold text-foreground flex items-center gap-2">
            <Boxes className="h-3.5 w-3.5 text-primary" />
            <span>{g.name}</span>
          </div>
          {g.code && <span className="text-[10px] font-mono text-muted-foreground">{g.code}</span>}
        </div>
      ),
    },
    {
      key: 'brandId',
      header: 'Brand',
      render: (g) => (
        <span className="bg-primary/10 text-primary font-mono px-2 py-0.5 rounded text-[10px] uppercase border border-primary/30 font-bold">
          {g.brandId || '*'}
        </span>
      ),
    },
    {
      key: 'products',
      header: 'Products',
      render: (g) => (
        <span className="font-mono text-xs text-muted-foreground">{g.productIds?.length || 0} product(s)</span>
      ),
    },
    {
      key: 'categories',
      header: 'Categories',
      render: (g) => {
        if (!g.categories || g.categories.length === 0) {
          return <span className="text-muted-foreground text-xs">—</span>;
        }
        return (
          <div className="flex flex-wrap items-center gap-1 max-w-xs">
            {g.categories.map((c) => (
              <span
                key={c}
                className="bg-amber-500/15 text-amber-400 font-mono px-1.5 py-0.5 rounded text-[9px] uppercase border border-amber-500/30 font-bold"
              >
                {c}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (g) =>
        g.isActive ? (
          <span className="flex items-center gap-1 text-emerald-400 text-[11px] font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5" /> Active
          </span>
        ) : (
          <span className="flex items-center gap-1 text-muted-foreground text-[11px] font-semibold">
            <XCircle className="h-3.5 w-3.5" /> Inactive
          </span>
        ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (g) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onOpenEditModal(g)}
            title="Edit Product Group"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onDeleteGroup(g.id)}
            title="Delete Product Group"
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
        searchPlaceholder="Search product groups by name, code, or category..."
        actionLabel="New Product Group"
        onAction={onOpenAddModal}
        customFilterContent={customFilterContent}
        activeFilterCount={activeFilterCount}
      />

      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(g) => g.id}
        emptyMessage="No product groups found for current filters. Create one to curate a campaign catalog for a brand."
      />
    </div>
  );
};
