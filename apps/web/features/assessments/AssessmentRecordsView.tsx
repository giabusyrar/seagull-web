'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  User,
  Eye,
  Activity,
  Database,
  Tag,
  Sparkles,
  Award,
  Code,
  Clock,
  Layers,
  X,
} from 'lucide-react';
import {
  PageHeader,
  SearchFilterBar,
  DataTable,
  BrandTag,
  CodeBlock,
  Button,
  SearchableSelect,
  type ColumnDef,
  type SelectOption,
} from '@gateway-experience/shared';

interface AssessmentRecord {
  id: string;
  assessmentType: string;
  brandId: string;
  applicationId?: string;
  customerIdentifier?: string;
  chronologicalAge?: number;
  predictedBioAge?: number;
  bioAgeOffset?: number;
  uvIndex?: number;
  globalScores?: Record<string, number>;
  recommendedProducts?: any[];
  latencyMs?: number;
  createdAt: string;
}

export function AssessmentRecordsView() {
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<AssessmentRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [inspectRawJson, setInspectRawJson] = useState(false);

  const fetchAssessments = useCallback(async () => {
    setLoading(true);
    try {
      const url = `/api/assessments?brandId=${selectedBrand}&type=${selectedType}&limit=100`;
      const res = await fetch(url, { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setAssessments(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch assessments:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedBrand, selectedType]);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedBrand, selectedType]);

  const filteredAssessments = useMemo(() => {
    return assessments.filter((a) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        a.id.toLowerCase().includes(q) ||
        (a.customerIdentifier && a.customerIdentifier.toLowerCase().includes(q)) ||
        a.brandId.toLowerCase().includes(q) ||
        a.assessmentType.toLowerCase().includes(q) ||
        (a.applicationId && a.applicationId.toLowerCase().includes(q))
      );
    });
  }, [assessments, searchQuery]);

  const totalItems = filteredAssessments.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedItems = filteredAssessments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const availableBrands = useMemo(() => {
    return Array.from(new Set(assessments.map((a) => a.brandId).filter(Boolean)));
  }, [assessments]);

  const availableTypes = useMemo(() => {
    return Array.from(new Set(assessments.map((a) => a.assessmentType).filter(Boolean)));
  }, [assessments]);

  const activeFilterCount = (selectedBrand !== 'all' ? 1 : 0) + (selectedType !== 'all' ? 1 : 0);

  const brandFilterOptions: SelectOption[] = [
    { value: 'all', label: `All Brands (${availableBrands.length})` },
    ...availableBrands.map((b) => ({
      value: b,
      label: b.replace('brand_', '').replace(/^\w/, (c) => c.toUpperCase()),
    })),
  ];

  const typeFilterOptions: SelectOption[] = [
    { value: 'all', label: `All Types (${availableTypes.length})` },
    ...availableTypes.map((t) => ({
      value: t,
      label: t.replace(/_/g, ' '),
    })),
  ];

  const customFilterContent = (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <span className="text-xs font-bold text-foreground uppercase tracking-wider">Assessment Filters</span>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={() => {
              setSelectedBrand('all');
              setSelectedType('all');
            }}
            className="text-[10px] text-primary hover:underline cursor-pointer"
          >
            Reset All
          </button>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
          <Tag className="h-3 w-3 text-primary" />
          <span>Brand Scope</span>
        </label>
        <SearchableSelect
          value={selectedBrand}
          onChange={setSelectedBrand}
          options={brandFilterOptions}
          placeholder="Select brand..."
          searchPlaceholder="Search brands..."
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
          <Activity className="h-3 w-3 text-sky-400" />
          <span>Assessment Type</span>
        </label>
        <SearchableSelect
          value={selectedType}
          onChange={setSelectedType}
          options={typeFilterOptions}
          placeholder="Select type..."
          searchPlaceholder="Search types..."
        />
      </div>
    </div>
  );

  const columns: ColumnDef<AssessmentRecord>[] = [
    {
      key: 'brandId',
      header: 'Brand & Type',
      render: (item) => (
        <div className="flex flex-col gap-1 items-start">
          <BrandTag name={item.brandId.replace('brand_', '')} />
          <span className="inline-block font-mono text-[10px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded border border-border">
            {item.assessmentType}
          </span>
        </div>
      ),
    },
    {
      key: 'customerIdentifier',
      header: 'Customer Identifier',
      render: (item) => (
        <div>
          <div className="font-semibold text-foreground flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="truncate max-w-[140px]" title={item.customerIdentifier || 'Anonymous'}>
              {item.customerIdentifier || 'Guest / Anonymous'}
            </span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground block mt-0.5 truncate max-w-[140px]">
            {item.id}
          </span>
        </div>
      ),
    },
    {
      key: 'globalScores',
      header: 'Scores & Context',
      render: (item) => (
        <div className="flex flex-wrap items-center gap-1.5">
          {item.globalScores?.UV_DEFENSE !== undefined && (
            <span className="bg-beak/20 border border-beak/20 text-beak text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5" /> UV: {Math.round(item.globalScores.UV_DEFENSE)}
            </span>
          )}
          {item.globalScores?.SKIN_LONGEVITY !== undefined && (
            <span className="bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
              <Award className="h-2.5 w-2.5" /> Longevity: {Math.round(item.globalScores.SKIN_LONGEVITY)}
            </span>
          )}
          {item.chronologicalAge && (
            <span className="text-[10px] text-muted-foreground font-mono">
              Age: {item.chronologicalAge}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created At',
      render: (item) => (
        <div className="font-mono text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1 text-foreground">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span>{new Date(item.createdAt).toLocaleDateString('id-ID')}</span>
          </div>
          <span className="text-[10px] text-muted-foreground">
            {new Date(item.createdAt).toLocaleTimeString('id-ID')}
          </span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (item) => (
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => setSelectedItem(item)}
          title="Inspect Record"
        >
          <Eye className="h-3.5 w-3.5 text-primary" />
        </Button>
      ),
    },
  ];

  return (
    <div className="flex-1 min-w-0 h-full overflow-y-auto bg-background text-foreground font-sans flex flex-col select-none">
      {/* Standard Unified PageHeader */}
      <PageHeader
        icon={<Database className="h-5 w-5 text-primary" />}
        breadcrumbs={[
          { label: 'Workbench', href: '/' },
          { label: 'Master Data' },
          { label: 'Diagnostic Assessments' },
        ]}
        title="Diagnostic & Survey Assessments"
      />

      {/* Main Body */}
      <main className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto">
        <SearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search customer ID, assessment ID, type, application..."
          customFilterContent={customFilterContent}
          activeFilterCount={activeFilterCount}
          onRefresh={fetchAssessments}
          isLoading={loading}
        />

        {/* Assessments Table & Inspection Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Table Panel */}
          <div className={`${selectedItem ? 'lg:col-span-7' : 'lg:col-span-12'} transition-all duration-200`}>
            <DataTable
              columns={columns}
              data={paginatedItems}
              keyExtractor={(item) => item.id}
              isLoading={loading}
              onRowClick={(item) => setSelectedItem(item)}
              emptyMessage={
                searchQuery
                  ? 'No results matched your search query. Try adjusting your filters.'
                  : 'No diagnostic or survey assessment records have been logged yet.'
              }
              pagination={{
                currentPage,
                totalPages,
                totalItems,
                pageSize,
                onPageChange: (p) => setCurrentPage(p),
                onPageSizeChange: (s) => {
                  setPageSize(s);
                  setCurrentPage(1);
                },
              }}
            />
          </div>

          {/* Right Inspection Drawer Panel */}
          {selectedItem && (
            <div className="lg:col-span-5 bg-card rounded-xl border border-border shadow-xl p-5 space-y-4 sticky top-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-beak/10 rounded-lg border border-beak/20 text-primary">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Assessment Inspection</h3>
                    <span className="text-[10px] font-mono text-muted-foreground">ID: {selectedItem.id}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant={inspectRawJson ? 'primary' : 'outline'}
                    size="xs"
                    onClick={() => setInspectRawJson(!inspectRawJson)}
                    leftIcon={<Code className="h-3 w-3" />}
                  >
                    JSON
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setSelectedItem(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {inspectRawJson ? (
                <CodeBlock
                  code={JSON.stringify(selectedItem, null, 2)}
                  language="json"
                  maxHeight="380px"
                />
              ) : (
                <div className="space-y-4">
                  {/* Meta Profile Card */}
                  <div className="grid grid-cols-2 gap-2 bg-secondary/40 p-3 rounded-xl border border-border">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Customer</span>
                      <p className="text-xs font-semibold text-foreground truncate">
                        {selectedItem.customerIdentifier || 'Guest / Anonymous'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Brand</span>
                      <div className="mt-0.5">
                        <BrandTag name={selectedItem.brandId.replace('brand_', '')} />
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Chronological Age</span>
                      <p className="text-xs font-semibold text-foreground">
                        {selectedItem.chronologicalAge ? `${selectedItem.chronologicalAge} yrs` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Biological Bio-Age</span>
                      <p className="text-xs font-semibold text-foreground">
                        {selectedItem.predictedBioAge
                          ? `${selectedItem.predictedBioAge} yrs (${
                              selectedItem.bioAgeOffset && selectedItem.bioAgeOffset > 0
                                ? `+${selectedItem.bioAgeOffset}`
                                : selectedItem.bioAgeOffset
                            }y)`
                          : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Dimension Scores */}
                  {selectedItem.globalScores && (
                    <div>
                      <span className="text-[11px] uppercase font-bold text-primary tracking-wider flex items-center gap-1 mb-2">
                        <Sparkles className="h-3.5 w-3.5" /> Clinical Dimension Scores
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(selectedItem.globalScores).map(([key, val]) => (
                          <div
                            key={key}
                            className="rounded-lg bg-secondary/50 border border-border p-2 flex justify-between items-center"
                          >
                            <span className="text-[11px] text-muted-foreground truncate max-w-[110px]" title={key}>
                              {key}
                            </span>
                            <span className="text-xs font-bold text-foreground font-mono">
                              {typeof val === 'number' ? Math.round(val) : val}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matched Regimen Products */}
                  {selectedItem.recommendedProducts && selectedItem.recommendedProducts.length > 0 && (
                    <div>
                      <span className="text-[11px] uppercase font-bold text-primary tracking-wider flex items-center gap-1 mb-2">
                        <Layers className="h-3.5 w-3.5" /> Matched Regimen ({selectedItem.recommendedProducts.length})
                      </span>
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {selectedItem.recommendedProducts.map((p: any, idx: number) => (
                          <div
                            key={idx}
                            className="rounded-xl bg-secondary/40 border border-border hover:border-beak/40 p-2.5 transition"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-beak/15 text-primary">
                                {p.category || 'Product'}
                              </span>
                              <span className="text-[10px] font-mono text-muted-foreground">{p.sku}</span>
                            </div>
                            <h4 className="text-xs font-bold text-foreground mt-1">{p.name}</h4>
                            {p.reason && (
                              <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{p.reason}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
