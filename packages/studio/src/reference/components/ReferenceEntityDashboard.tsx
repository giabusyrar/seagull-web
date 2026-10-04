'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Database,
} from 'lucide-react';
import type { EntityConfig } from '../config/reference-entity-configs';
import { REFERENCE_ENTITY_CONFIGS } from '../config/reference-entity-configs';
import { ReferenceTable } from './ReferenceTable';
import { ReferenceFormModal } from './ReferenceFormModal';
import { SeverityTierGroupModal } from './SeverityTierGroupModal';
import { deleteEntityItem, listEntityItems, saveEntityItem } from '../api';
import { PageHeader, SearchFilterBar, ConfirmDialog, Pagination, FilterPanel, type FilterSection } from '@gateway-experience/shared';


interface ReferenceEntityDashboardProps {
  slug: string;
}

export const ReferenceEntityDashboard: React.FC<ReferenceEntityDashboardProps> = ({ slug }) => {
  const [activeSlug, setActiveSlug] = useState(slug);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});

  useEffect(() => {
    setActiveSlug(slug);
  }, [slug]);

  const config: EntityConfig = REFERENCE_ENTITY_CONFIGS[activeSlug] || REFERENCE_ENTITY_CONFIGS['brands'];

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchColumn, setSearchColumn] = useState<string>('all');
  const [filterOption, setFilterOption] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [deleteConfig, setDeleteConfig] = useState<{ isOpen: boolean; item: any | null; isDeleting: boolean }>({
    isOpen: false,
    item: null,
    isDeleting: false,
  });

  // Reset filter selections and page when active tab changes
  useEffect(() => {
    setSearchColumn('all');
    setFilterOption('all');
    setActiveFilters({});
    setCurrentPage(1);
  }, [activeSlug]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, searchColumn, filterOption]);

  // Dynamically generate search column target options based on entity schema
  const columnOptions = useMemo(() => {
    const opts: { value: string; label: string }[] = [
      { value: 'all', label: 'All Columns' },
      { value: 'name', label: 'Name' },
      { value: 'code', label: 'Code' },
    ];

    if (config.slug === 'products') {
      opts.push(
        { value: 'brand', label: 'Brand' },
        { value: 'ingredients', label: 'Ingredients' }
      );
    } else if (config.slug === 'ingredients') {
      opts.push({ value: 'category', label: 'Category / Function' });
    } else if (['severity-tiers', 'severity-tier', 'severity-levels'].includes(config.slug)) {
      opts.push({ value: 'group', label: 'Tier Group / Category' });
    } else if (config.slug === 'brands') {
      opts.push(
        { value: 'website', label: 'Website' },
        { value: 'colorCode', label: 'Color Code' }
      );
    }



    opts.push({ value: 'description', label: 'Description' });
    return opts;
  }, [config.slug]);

  // Dynamically generate column multi-select options based on loaded items
  const brandOptions = useMemo(() => {
    const brands = Array.from(
      new Set(
        (items || [])
          .map((i) => i.brandName || i.brandId)
          .filter((b): b is string => typeof b === 'string' && b.trim().length > 0)
      )
    );
    return brands.map((b) => ({ value: b, label: b }));
  }, [items]);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await listEntityItems(config));
    } catch (err) {
      console.error('Fetch items error:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [config]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSave = async (formData: any) => {
    try {
      const isEdit = !!editingItem;
      const payload = isEdit
        ? { ...editingItem, ...formData, id: editingItem.id }
        : formData;

      await saveEntityItem(config.apiEndpoint, payload, isEdit);

      await fetchItems();
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    }
  };


  const handleRequestDelete = (target: any) => {
    setDeleteConfig({
      isOpen: true,
      item: target,
      isDeleting: false,
    });
  };

  const handleConfirmDelete = async () => {
    const target = deleteConfig.item;
    if (!target) return;

    const targetId = typeof target === 'object' && target !== null ? target.id : target;
    if (!targetId || typeof targetId !== 'string') return;

    setDeleteConfig((prev) => ({ ...prev, isDeleting: true }));
    try {
      await deleteEntityItem(config.apiEndpoint, targetId);
      await fetchItems();
      setDeleteConfig({ isOpen: false, item: null, isDeleting: false });
    } catch (err: any) {
      alert(err.message || 'Delete failed');
      setDeleteConfig((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const filterItemList = useCallback(
    (sourceItems: any[], q: string, targetCol: string, filterObj: Record<string, any>) => {
      const normalizedQ = q.toLowerCase().trim();

      return sourceItems.filter((item) => {
        // 1. Target Column or All Columns Search Filter
        if (normalizedQ) {
          if (targetCol === 'name') {
            const val = (item.name || item.title || '').toLowerCase();
            if (!val.includes(normalizedQ)) return false;
          } else if (targetCol === 'code') {
            const val = (item.code || '').toLowerCase();
            if (!val.includes(normalizedQ)) return false;
          } else if (targetCol === 'brand') {
            const val = (item.brandName || item.brandId || '').toLowerCase();
            if (!val.includes(normalizedQ)) return false;
          } else if (targetCol === 'group') {
            const val = (item.group || item.category || '').toLowerCase();
            if (!val.includes(normalizedQ)) return false;
          } else if (targetCol === 'ingredients') {
            const ingList = Array.isArray(item.ingredientNames)
              ? item.ingredientNames.join(' ')
              : '';
            if (!ingList.toLowerCase().includes(normalizedQ)) return false;
          } else if (targetCol === 'description') {
            const val = (item.description || '').toLowerCase();
            if (!val.includes(normalizedQ)) return false;
          } else {
            // 'all' columns search
            const nameMatch = (item.name || item.title || '').toLowerCase().includes(normalizedQ);
            const codeMatch = (item.code || '').toLowerCase().includes(normalizedQ);
            const slugMatch = (item.slug || '').toLowerCase().includes(normalizedQ);
            const groupMatch = (item.group || '').toLowerCase().includes(normalizedQ);
            const brandMatch = (item.brandName || item.brandId || '').toLowerCase().includes(normalizedQ);
            const descMatch = (item.description || '').toLowerCase().includes(normalizedQ);

            if (!nameMatch && !codeMatch && !slugMatch && !groupMatch && !brandMatch && !descMatch) {
              return false;
            }
          }

        }

        // 2. Real Column Multi-Select Filters
        if (Array.isArray(filterObj.brands) && filterObj.brands.length > 0) {
          const itemBrand = item.brandName || item.brandId || '';
          if (!filterObj.brands.includes(itemBrand)) return false;
        }

        return true;
      });
    },
    []
  );

  const safeItems = Array.isArray(items) ? items : [];
  const filteredItems = useMemo(
    () => filterItemList(safeItems, searchQuery, searchColumn, activeFilters),
    [filterItemList, safeItems, searchQuery, searchColumn, activeFilters]
  );

  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="flex-1 min-w-0 h-full overflow-y-auto bg-background text-foreground font-sans flex flex-col select-none">
      <PageHeader
        icon={<Database className="h-5 w-5 text-beak" />}
        breadcrumbs={[
          { label: 'Workbench', href: '/' },
          { label: 'Reference Data' },
          { label: config.title },
        ]}
        title={config.title}
        description={config.description}
      />

      <main className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto flex flex-col">
        <SearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder={`Search ${config.title.toLowerCase()}...`}
          searchColumn={searchColumn}
          onSearchColumnChange={setSearchColumn}
          columnOptions={columnOptions}
          onOpenFilterPanel={config.slug === 'products' ? () => setIsFilterPanelOpen(true) : undefined}
          activeFilterCount={Object.keys(activeFilters).filter((k) => activeFilters[k] && activeFilters[k] !== 'all').length}
          onRefresh={fetchItems}
          isLoading={loading}
          actionLabel={`New ${config.singularTitle}`}
          onAction={() => {
            setEditingItem(null);
            setIsModalOpen(true);
          }}
        />

        <div className="w-full">
          <ReferenceTable
            config={config}
            items={paginatedItems}
            searchQuery={searchQuery}
            onEdit={(item) => {
              setEditingItem(item);
              setIsModalOpen(true);
            }}
            onDelete={handleRequestDelete}
          />
        </div>

        {!loading && totalItems > 0 && (
          <div className="pt-2">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={(page) => setCurrentPage(page)}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
            />
          </div>
        )}
      </main>

      {['severity-tier-groups', 'severity-tier-group', 'severity-tiers', 'severity-tier', 'severity-groups', 'severity-group'].includes(config.slug) ? (
        <SeverityTierGroupModal
          isOpen={isModalOpen}
          initialData={editingItem}
          onClose={() => {
            setIsModalOpen(false);
            setEditingItem(null);
          }}
          onSave={handleSave}
        />
      ) : (
        <ReferenceFormModal
          isOpen={isModalOpen}
          config={config}
          initialData={editingItem}
          onClose={() => {
            setIsModalOpen(false);
            setEditingItem(null);
          }}
          onSave={handleSave}
        />
      )}

      <ConfirmDialog
        isOpen={deleteConfig.isOpen}
        onClose={() => setDeleteConfig({ isOpen: false, item: null, isDeleting: false })}
        onConfirm={handleConfirmDelete}
        title={`Delete ${config.singularTitle}`}
        message={`Are you sure you want to delete ${
          deleteConfig.item?.name ? `"${deleteConfig.item.name}"` : 'this item'
        }? This action cannot be undone.`}
        confirmLabel="Delete"
        isDestructive={true}
        isLoading={deleteConfig.isDeleting}
      />

      {config.slug !== 'brands' && (
        <FilterPanel
          isOpen={isFilterPanelOpen}
          onClose={() => setIsFilterPanelOpen(false)}
          title={`Filter ${config.title}`}
          sections={[
            ...(brandOptions.length > 0
              ? [
                  {
                    id: 'brands',
                    label: 'Brand',
                    type: 'select' as const,
                    isMultiSelect: true,
                    options: brandOptions,
                    searchPlaceholder: 'Search brand...',
                  },
                ]
              : []),
            {
              id: 'searchColumn',
              label: 'Search Target Column',
              type: 'select' as const,
              isMultiSelect: false,
              options: columnOptions,
              searchPlaceholder: 'Select column...',
            },
          ]}
          initialFilters={{
            searchColumn: searchColumn,
            ...activeFilters,
          }}
          onApply={(filters) => {
            setActiveFilters(filters);
            if (filters.searchColumn) setSearchColumn(filters.searchColumn);
          }}
          onReset={() => {
            setActiveFilters({});
            setSearchColumn('all');
          }}
          resultCount={(draftFilters) => {
            const draftSearchCol = draftFilters.searchColumn || searchColumn;
            return filterItemList(safeItems, searchQuery, draftSearchCol, draftFilters).length;
          }}
        />
      )}
    </div>
  );
};
