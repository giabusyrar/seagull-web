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
    relationEntity?: 'brands' | 'ingredients' | 'dimensions' | 'conditions' | 'applications' | 'categories' | 'textures';
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

export { type EntityConfig, type EntityFieldSchema, REFERENCE_ENTITY_CONFIGS };
