'use client';

import { useState } from 'react';
import { useCollections as useLibCollections } from '@/lib/hooks/use-collections';
import type { Collection } from '@/types/api-client';

export function useCollections() {
  const {
    collections,
    loading,
    error,
    refresh: refreshCollections,
    createCollection: libCreateCollection,
    updateCollection: libUpdateCollection,
    deleteCollection: libDeleteCollection,
    reorderCollections: libReorderCollections,
  } = useLibCollections();

  const [expandedCollectionId, setExpandedCollectionId] = useState<string | null>(null);
  const [targetCollectionId, setTargetCollectionId] = useState<string | null>(null);
  const [settingsCollection, setSettingsCollection] = useState<Collection | null>(null);
  const [isCreateCollectionModalOpen, setIsCreateCollectionModalOpen] = useState(false);

  const handleCreateCollection = async (name: string, type: 'proxy' | 'llm', originalPrefix?: string, provider?: string) => {
    const res = await libCreateCollection({ name, type, originalPrefix, provider });
    return res;
  };

  const handleUpdateCollection = async (id: string, data: Partial<Collection>) => {
    const res = await libUpdateCollection(id, data);
    return res;
  };

  const handleDeleteCollection = async (collection: Collection) => {
    const res = await libDeleteCollection(collection.id);
    if (res.success) {
      if (expandedCollectionId === collection.id) {
        setExpandedCollectionId(null);
      }
    }
    return res;
  };

  const handleReorderCollections = async (collectionIds: string[]) => {
    const res = await libReorderCollections(collectionIds);
    return res;
  };

  return {
    collections,
    loading,
    error,
    refreshCollections,
    expandedCollectionId,
    setExpandedCollectionId,
    targetCollectionId,
    setTargetCollectionId,
    settingsCollection,
    setSettingsCollection,
    isCreateCollectionModalOpen,
    setIsCreateCollectionModalOpen,
    handleCreateCollection,
    handleUpdateCollection,
    handleDeleteCollection,
    handleReorderCollections,
  };
}
