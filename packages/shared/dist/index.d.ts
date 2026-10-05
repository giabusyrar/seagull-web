export interface Collection {
    id: string;
    name: string;
    type: 'proxy' | 'llm';
    originalPrefix?: string | null;
    healthCheckPath: string;
    status: 'healthy' | 'unhealthy' | 'unknown';
    lastCheckedAt?: string | null;
    activeEnvironmentId?: string | null;
    provider?: string | null;
    outboundSecretId?: string | null;
    knowledgeBase?: string | null;
    createdAt: string;
    updatedAt?: string | null;
    deletedAt?: string | null;
}
export interface Route {
    id: string;
    collectionId: string;
    groupId?: string | null;
    name: string;
    method: string;
    originalPattern: string;
    targetPattern?: string | null;
    llmModel?: string | null;
    systemInstruction?: string | null;
    outputSchema?: string | null;
    createdAt: string;
    updatedAt?: string | null;
    deletedAt?: string | null;
}
export interface DbExecutionLog {
    id: string;
    routeId?: string | null;
    collectionId?: string | null;
    method: string;
    url: string;
    status: number;
    statusText: string;
    latencyMs: number;
    source: string;
    requestBody?: string | null;
    createdAt: string;
}
export interface SkinProfile {
    code: string;
    name: string;
    description?: string;
    category?: string;
    axis_values?: Record<string, string>;
    traits?: string[];
}
export interface SkinGradingTier {
    dimension_key: string;
    score: number;
    grade_name: string;
    severity: 'optimal' | 'mild' | 'moderate' | 'severe' | 'critical' | string;
}
export interface AnswerEntry {
    answer: string;
    score: number;
    min_score: number;
    max_score: number;
}
export interface UnifiedEvaluationOutput {
    success?: boolean;
    code: string;
    brand_id: string;
    application_id: string;
    total_score: number;
    dimension_scores: Record<string, number>;
    skin_profile: SkinProfile;
    skin_grading_tiers: SkinGradingTier[];
    customer_condition: Record<string, boolean>;
    answer_list: AnswerEntry[];
    analysis_result?: Record<string, any>;
    applied_rules?: string[];
    evaluated_at?: string;
}
export { SearchFilterBar } from './components/SearchFilterBar';
export type { SearchFilterBarProps, FilterOptionItem, ColumnOptionItem } from './components/SearchFilterBar';
export { FilterPanel, type FilterPanelProps, type FilterSection, type FilterPillOption, type FilterSelectOption } from './components/FilterPanel';
export { MonospaceBadge, type MonospaceBadgeProps } from './components/MonospaceBadge';
export { FeatureCard, type FeatureCardProps } from './components/FeatureCard';
export { PageHeader, type PageHeaderProps } from './components/PageHeader';
export { SearchableSelect, type SearchableSelectProps, type SelectOption } from './components/SearchableSelect';
export { ChipMultiSelect, type ChipMultiSelectProps, type ChipOption, type ChipGroup, type ChipTone } from './components/ChipMultiSelect';
export { FACIAL_ZONES, ZONE_TO_MAKEUP_REGION, type FacialZoneCode, type MakeupRegion } from './zones';
export { Modal, type ModalProps } from './components/Modal';
export { InfoTooltip, type InfoTooltipProps } from './components/InfoTooltip';
export { ConfirmDialog, type ConfirmDialogProps } from './components/ConfirmDialog';
export { EmptyState, type EmptyStateProps } from './components/EmptyState';
export { TabNav, type TabNavProps, type TabItem } from './components/TabNav';
export { HttpMethodBadge, type HttpMethodBadgeProps } from './components/HttpMethodBadge';
export { DataTable, type DataTableProps, type ColumnDef } from './components/DataTable';
export { CodeBlock, type CodeBlockProps } from './components/CodeBlock';
export { StatWidget, type StatWidgetProps } from './components/StatWidget';
export { Button, type ButtonProps } from './components/Button';
export { Input, type InputProps } from './components/Input';
export { Skeleton, type SkeletonProps } from './components/Skeleton';
export { Badge, type BadgeProps } from './components/Badge';
export { CodeGenerator, type CodeGeneratorProps } from './components/CodeGenerator';
export { MimeViewer, type MimeViewerProps } from './components/MimeViewer';
export { Breadcrumb, type BreadcrumbProps, type BreadcrumbItem } from './components/Breadcrumb';
export { Pagination, type PaginationProps } from './components/Pagination';
export { BrandTag, type BrandTagProps, getBrandColorTheme, getDomainFromUrl } from './components/BrandTag';
export { KeyValueTable, type KeyValueTableProps, type KeyValueItem } from './components/KeyValueTable';
export { StatusBadge, type StatusBadgeProps } from './components/StatusBadge';
export { SeverityBadge, type SeverityBadgeProps } from './components/SeverityBadge';
export { ScoreRangeInput, type ScoreRangeInputProps } from './components/ScoreRangeInput';
export { HostRoutesProvider, useHostRoutes, type HostRoutes } from './host-routes';
export { ReferenceDataProvider, useReferenceDataSource, type ReferenceDataSource, } from './components/reference/ReferenceDataProvider';
export { BrandSelect, type BrandSelectProps } from './components/reference/BrandSelect';
export { ApplicationSelect, type ApplicationSelectProps } from './components/reference/ApplicationSelect';
export { StatusSelect, type StatusSelectProps } from './components/reference/StatusSelect';
export { DimensionSelect, type DimensionSelectProps } from './components/reference/DimensionSelect';
export { SeveritySelect, type SeveritySelectProps } from './components/reference/SeveritySelect';
export { CORE_DEFAULT_SCORE_RANGE_BANDS, CORE_DEFAULT_SEVERITY_BANDS, type CoreBand } from './components/reference/core-default-bands';
export { SEVERITY_TONES, severityToneOf, type SeverityTone } from './components/reference/severity-tone';
export { LIFECYCLE_STATUSES } from './components/reference/StatusSelect';
export { cn } from './utils';
export { usePersistentState, readPersisted, writePersisted, readPersistedString, writePersistedString, saveBlob, loadBlob, } from './persistent-state';
export { DRY_RUN_HEADER } from './dry-run';
