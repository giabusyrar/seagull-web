import React from 'react';
import { FilterOptionItem, SearchFilterBar, SearchFilterBarProps } from '@gateway-experience/shared';

interface ReferenceManagerProps {
    initialEntity?: string;
}
declare const ReferenceManager: React.FC<ReferenceManagerProps>;

interface ReferenceEntityDashboardProps {
    slug: string;
}
declare const ReferenceEntityDashboard: React.FC<ReferenceEntityDashboardProps>;

interface EntityFieldSchema {
    key: string;
    label: string;
    type: 'text' | 'number' | 'textarea' | 'select' | 'relation' | 'multi-relation';
    required?: boolean;
    options?: Array<{
        value: string;
        label: string;
        description?: string;
    }>;
    relationEntity?: 'brands' | 'ingredients' | 'dimensions' | 'statuses' | 'conditions' | 'applications';
    isCsvArray?: boolean;
}
interface EntityConfig {
    slug: string;
    title: string;
    singularTitle: string;
    description: string;
    iconName: string;
    apiEndpoint: string;
    dataKey: string;
    fields: EntityFieldSchema[];
}
declare const REFERENCE_ENTITY_CONFIGS: Record<string, EntityConfig>;

interface ReferenceTableProps {
    config: EntityConfig;
    items: any[];
    onEdit: (item: any) => void;
    onDelete: (item: any) => void;
    searchQuery?: string;
}
declare const ReferenceTable: React.FC<ReferenceTableProps>;

interface ReferenceFormModalProps {
    isOpen: boolean;
    config: EntityConfig;
    initialData?: any;
    onClose: () => void;
    onSave: (data: Record<string, any>) => Promise<void>;
}
declare const ReferenceFormModal: React.FC<ReferenceFormModalProps>;

type index_EntityConfig = EntityConfig;
type index_EntityFieldSchema = EntityFieldSchema;
declare const index_FilterOptionItem: typeof FilterOptionItem;
declare const index_REFERENCE_ENTITY_CONFIGS: typeof REFERENCE_ENTITY_CONFIGS;
declare const index_ReferenceEntityDashboard: typeof ReferenceEntityDashboard;
declare const index_ReferenceFormModal: typeof ReferenceFormModal;
declare const index_ReferenceManager: typeof ReferenceManager;
declare const index_ReferenceTable: typeof ReferenceTable;
declare const index_SearchFilterBar: typeof SearchFilterBar;
declare const index_SearchFilterBarProps: typeof SearchFilterBarProps;
declare namespace index {
  export { type index_EntityConfig as EntityConfig, type index_EntityFieldSchema as EntityFieldSchema, index_FilterOptionItem as FilterOptionItem, index_REFERENCE_ENTITY_CONFIGS as REFERENCE_ENTITY_CONFIGS, index_ReferenceEntityDashboard as ReferenceEntityDashboard, index_ReferenceFormModal as ReferenceFormModal, index_ReferenceManager as ReferenceManager, index_ReferenceTable as ReferenceTable, index_SearchFilterBar as SearchFilterBar, index_SearchFilterBarProps as SearchFilterBarProps };
}

export { type EntityConfig as E, ReferenceManager as R, type EntityFieldSchema as a, REFERENCE_ENTITY_CONFIGS as b, ReferenceEntityDashboard as c, ReferenceFormModal as d, ReferenceTable as e, index as i };
