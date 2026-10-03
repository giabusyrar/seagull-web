'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldAlert, Boxes, Play, Building, Smartphone, Palette } from 'lucide-react';
import { PageHeader, TabNav, ConfirmDialog, usePersistentState, type TabItem } from '@gateway-experience/shared';
import type { ConflictMatrixRule, ProductGroup, ProductCatalogItem, Shade, ClinicalMatchResult } from '../types';

import { ConflictMatrixTab } from './tabs/ConflictMatrixTab';
import { ProductGroupsTab } from './tabs/ProductGroupsTab';
import { ShadesTab } from './tabs/ShadesTab';
import { MatchSimulatorTab } from './tabs/MatchSimulatorTab';

import { ConflictRuleModal } from './modals/ConflictRuleModal';
import { ProductGroupModal } from './modals/ProductGroupModal';
import { ShadeModal } from './modals/ShadeModal';
import { conflictsApi, productGroupsApi, productsApi, runMatch, shadesApi } from '../api';

export const MatchManager: React.FC = () => {
  const [activeTab, setActiveTab] = usePersistentState<'conflicts' | 'groups' | 'shades' | 'simulator'>('xg.matchEngine.activeTab', 'conflicts');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});

  // Confirm Delete Dialog State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Multi-Tenant Scoping Selection
  const [selectedBrand, setSelectedBrand] = usePersistentState<string>('xg.matchEngine.brand', '*');
  const [selectedApp, setSelectedApp] = usePersistentState<string>('xg.matchEngine.application', '*');

  // Data States
  const [conflicts, setConflicts] = useState<ConflictMatrixRule[]>([]);
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);
  const [products, setProducts] = useState<ProductCatalogItem[]>([]);
  const [shades, setShades] = useState<Shade[]>([]);
  const [shadeProductId, setShadeProductId] = useState<string>('');

  // Modals Visibility
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isShadeModalOpen, setIsShadeModalOpen] = useState(false);

  // Edit Targets
  const [editingConflict, setEditingConflict] = useState<ConflictMatrixRule | null>(null);
  const [editingGroup, setEditingGroup] = useState<ProductGroup | null>(null);
  const [editingShade, setEditingShade] = useState<Shade | null>(null);

  // Simulator State — inputs and the last result survive a reload.
  const [simBrand, setSimBrand] = usePersistentState('xg.matchEngine.simulator.brand', '*');
  const [simSkinType, setSimSkinType] = usePersistentState('xg.matchEngine.simulator.skinType', 'OSPT');
  const [simSebum, setSimSebum] = usePersistentState('xg.matchEngine.simulator.sebum', 75);
  const [simHydration, setSimHydration] = usePersistentState('xg.matchEngine.simulator.hydration', 40);
  const [simSensitivity, setSimSensitivity] = usePersistentState('xg.matchEngine.simulator.sensitivity', 65);
  const [simPregnant, setSimPregnant] = usePersistentState('xg.matchEngine.simulator.pregnant', false);
  const [simRetinol, setSimRetinol] = usePersistentState('xg.matchEngine.simulator.retinol', true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = usePersistentState<ClinicalMatchResult | null>('xg.matchEngine.simulator.result', null);

  // Lists are fetched for every tenant (the engine's `*`) and narrowed by the
  // brand/application dropdowns in the tabs. The scope is sent explicitly so
  // the gateway's collection params can never pick the tenant instead.
  const loadData = () => {
    conflictsApi
      .list()
      .then((list) => {
        if (list) setConflicts(list);
      })
      .catch(() => {});

    productGroupsApi
      .list()
      .then((list) => {
        if (list) setProductGroups(list);
      })
      .catch(() => {});

    productsApi
      .list()
      .then((list) => {
        if (list) {
          setProducts(list);
          setShadeProductId((prev) => prev || list[0]?.id || '');
        }
      })
      .catch(() => {});
  };

  const loadShades = (productId: string) => {
    if (!productId) {
      setShades([]);
      return;
    }
    shadesApi
      .list(productId)
      .then((list) => {
        if (list) setShades(list);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadShades(shadeProductId);
  }, [shadeProductId]);

  const matchTabs: TabItem[] = [
    { id: 'conflicts', label: 'Contraindication Matrix', icon: <ShieldAlert className="h-4 w-4 text-rose-400" />, badge: conflicts.length },
    { id: 'groups', label: 'Product Groups', icon: <Boxes className="h-4 w-4 text-amber-400" />, badge: productGroups.length },
    { id: 'shades', label: 'Shades', icon: <Palette className="h-4 w-4 text-rose-400" />, badge: shades.length },
    { id: 'simulator', label: 'Match Simulator', icon: <Play className="h-4 w-4 text-emerald-400" /> },
  ];

  const handleSaveConflict = async (data: any) => {
    if (editingConflict) {
      const updated = { ...editingConflict, ...data };
      setConflicts((prev) => prev.map((x) => (x.id === editingConflict.id ? updated : x)));
      try {
        await conflictsApi.update(updated);
      } catch {}
    } else {
      const newConf: ConflictMatrixRule = {
        id: `conf-${Date.now()}`,
        brandId: selectedBrand,
        applicationId: selectedApp,
        ...data,
      };
      setConflicts((prev) => [newConf, ...prev]);
      try {
        await conflictsApi.create(newConf);
      } catch {}
    }
  };

  const handleDeleteConflict = (id: string) => {
    const conf = conflicts.find((x) => x.id === id);
    setDeleteConfirm({
      isOpen: true,
      title: 'Delete Conflict Matrix Rule',
      message: `Are you sure you want to delete ingredient conflict "${conf?.ingredientA} vs ${conf?.ingredientB}"?`,
      onConfirm: async () => {
        setConflicts((prev) => prev.filter((x) => x.id !== id));
        try {
          await conflictsApi.remove(id);
        } catch {}
        setDeleteConfirm((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleSaveGroup = async (data: any) => {
    if (editingGroup) {
      const updated = { ...editingGroup, ...data };
      setProductGroups((prev) => prev.map((x) => (x.id === editingGroup.id ? updated : x)));
      try {
        await productGroupsApi.update(updated);
      } catch {}
    } else {
      const newGroup: ProductGroup = {
        id: `pgrp-${Date.now()}`,
        ...data,
      };
      setProductGroups((prev) => [newGroup, ...prev]);
      try {
        await productGroupsApi.create(newGroup);
      } catch {}
    }
  };

  const handleDeleteGroup = (id: string) => {
    const group = productGroups.find((x) => x.id === id);
    setDeleteConfirm({
      isOpen: true,
      title: 'Delete Product Group',
      message: `Are you sure you want to delete product group "${group?.name || id}"? Products relying on this campaign restriction will fall back to the full catalog.`,
      onConfirm: async () => {
        setProductGroups((prev) => prev.filter((x) => x.id !== id));
        try {
          await productGroupsApi.remove(id);
        } catch {}
        setDeleteConfirm((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleSaveShade = async (data: any) => {
    if (editingShade) {
      const updated = { ...editingShade, ...data };
      setShades((prev) => prev.map((x) => (x.id === editingShade.id ? updated : x)));
      try {
        await shadesApi.update(updated);
      } catch {}
    } else {
      const newShade: Shade = {
        id: `shade-${Date.now()}`,
        extractionStatus: 'pending',
        ...data,
      };
      setShades((prev) => [newShade, ...prev]);
      try {
        await shadesApi.create(newShade);
        // Re-fetch shortly after so the real ExtractionStatus (set by the
        // backend once tryon-engine is triggered) replaces the optimistic
        // "pending" placeholder above.
        setTimeout(() => loadShades(shadeProductId), 1000);
      } catch {}
    }
  };

  const handleDeleteShade = (id: string) => {
    const shade = shades.find((x) => x.id === id);
    setDeleteConfirm({
      isOpen: true,
      title: 'Delete Shade',
      message: `Are you sure you want to delete shade "${shade?.name || id}"?`,
      onConfirm: async () => {
        setShades((prev) => prev.filter((x) => x.id !== id));
        try {
          await shadesApi.remove(id);
        } catch {}
        setDeleteConfirm((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Run Simulator
  const handleRunSimulator = async () => {
    setIsSimulating(true);
    try {
      const payload = {
        brand_id: simBrand,
        application_id: selectedApp,
        dimension_scores: {
          sebum: Number(simSebum),
          hydration: Number(simHydration),
          sensitivity: Number(simSensitivity),
          pigmentation: 45,
        },
        skin_profile: simSkinType,
        customer_conditions: {
          is_pregnant: simPregnant,
          uses_retinol: simRetinol,
        },
      };

      const data = await runMatch(payload);
      if (data) setSimResult(data);
    } catch {} finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="flex-1 min-w-0 h-full overflow-y-auto bg-background text-foreground font-sans flex flex-col select-none">
      <PageHeader
        icon={<Sparkles className="h-5 w-5 text-beak" />}
        breadcrumbs={[
          { label: 'Workbench', href: '/' },
          { label: 'Core Engines' },
          { label: 'Match Engine' },
        ]}
        title="Clinical Product Matcher & Routine Generator"
      >
        <TabNav
          tabs={matchTabs}
          activeTab={activeTab}
          onTabChange={(id) => setActiveTab(id as any)}
        />
      </PageHeader>

      <main className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto">
        {activeTab === 'conflicts' && (
          <ConflictMatrixTab
            conflicts={conflicts}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onOpenAddModal={() => {
              setEditingConflict(null);
              setIsConflictModalOpen(true);
            }}
            onOpenEditModal={(c) => {
              setEditingConflict(c);
              setIsConflictModalOpen(true);
            }}
            onDeleteConflict={handleDeleteConflict}
            selectedBrand={selectedBrand}
            setSelectedBrand={setSelectedBrand}
            selectedApp={selectedApp}
            setSelectedApp={setSelectedApp}
          />
        )}

        {activeTab === 'groups' && (
          <ProductGroupsTab
            groups={productGroups}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onOpenAddModal={() => {
              setEditingGroup(null);
              setIsGroupModalOpen(true);
            }}
            onOpenEditModal={(g) => {
              setEditingGroup(g);
              setIsGroupModalOpen(true);
            }}
            onDeleteGroup={handleDeleteGroup}
            selectedBrand={selectedBrand}
            setSelectedBrand={setSelectedBrand}
            selectedApp={selectedApp}
            setSelectedApp={setSelectedApp}
          />
        )}

        {activeTab === 'shades' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 bg-secondary/40 border border-border rounded-lg px-3 py-2 w-fit">
              <label className="text-xs font-semibold text-muted-foreground">Product:</label>
              <select
                value={shadeProductId}
                onChange={(e) => setShadeProductId(e.target.value)}
                className="bg-transparent text-xs font-bold text-foreground outline-none cursor-pointer"
              >
                {products.length === 0 && <option value="">No products found</option>}
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <ShadesTab
              shades={shades}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onOpenAddModal={() => {
                setEditingShade(null);
                setIsShadeModalOpen(true);
              }}
              onOpenEditModal={(s) => {
                setEditingShade(s);
                setIsShadeModalOpen(true);
              }}
              onDeleteShade={handleDeleteShade}
            />
          </div>
        )}

        {activeTab === 'simulator' && (
          <MatchSimulatorTab
            simBrand={simBrand}
            setSimBrand={setSimBrand}
            simSkinType={simSkinType}
            setSimSkinType={setSimSkinType}
            simSebum={simSebum}
            setSimSebum={setSimSebum}
            simHydration={simHydration}
            setSimHydration={setSimHydration}
            simSensitivity={simSensitivity}
            setSimSensitivity={setSimSensitivity}
            simPregnant={simPregnant}
            setSimPregnant={setSimPregnant}
            simRetinol={simRetinol}
            setSimRetinol={setSimRetinol}
            onRunSimulator={handleRunSimulator}
            isSimulating={isSimulating}
            simResult={simResult}
          />
        )}
      </main>

      {/* Modals */}
      <ConflictRuleModal
        isOpen={isConflictModalOpen}
        onClose={() => setIsConflictModalOpen(false)}
        onSave={handleSaveConflict}
        editingConflict={editingConflict}
      />

      <ProductGroupModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        onSave={handleSaveGroup}
        editingGroup={editingGroup}
        defaultBrand={selectedBrand}
      />

      <ShadeModal
        isOpen={isShadeModalOpen}
        onClose={() => setIsShadeModalOpen(false)}
        onSave={handleSaveShade}
        editingShade={editingShade}
        productId={shadeProductId}
      />

      {/* Global Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title={deleteConfirm.title}
        message={deleteConfirm.message}
        onConfirm={deleteConfirm.onConfirm}
        onClose={() => setDeleteConfirm((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
