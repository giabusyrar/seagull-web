'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { User, Eye, Activity, Database, Code, Clock, X, AlertTriangle } from 'lucide-react';
import {
  PageHeader,
  SearchFilterBar,
  DataTable,
  BrandTag,
  CodeBlock,
  Button,
  BrandSelect,
  ApplicationSelect,
  type ColumnDef,
} from '@gateway-experience/shared';

/**
 * Customer assessments, read from core-engine
 * (GET /core/assessments/history and /core/assessments/customers/:customerId).
 *
 * They used to be read from the gateway's own assessment store, which is being
 * retired. core-engine's records carry different fields, so this view shows
 * what that store actually holds — the bio-age, UV and "assessment type"
 * columns are gone because no such field exists; inventing them would have
 * been worse than losing them.
 */
interface AssessmentRecord {
  id: string;
  customerId: string;
  brandId: string;
  applicationId: string;
  formId?: string;
  totalScore?: number;
  skinProfileCode?: string;
  skinProfile?: string | null;
  skinGradingTiers?: string | null;
  dimensionScores?: string;
  recommendedProducts?: string | null;
  rawAnswers?: string | null;
  visionMetrics?: string | null;
  executionTimeMs?: number;
  createdAt: string;
  updatedAt?: string | null;
}

// Both scopes are required by the API; without them it answers 400.
const UNIVERSAL = '*';

function parseJsonField(raw: string | null | undefined): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

export function AssessmentRecordsView() {
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [brandId, setBrandId] = useState('');
  const [applicationId, setApplicationId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<AssessmentRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [inspectRawJson, setInspectRawJson] = useState(false);

  const scopeChosen = Boolean(brandId) && Boolean(applicationId);

  const fetchAssessments = useCallback(async () => {
    if (!scopeChosen) {
      setAssessments([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ brand_id: brandId, application_id: applicationId, limit: '100' });
      const path = customerId.trim()
        ? `/core/assessments/customers/${encodeURIComponent(customerId.trim())}`
        : '/core/assessments/history';
      const res = await fetch(`${path}?${params}`, { cache: 'no-store' });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setAssessments([]);
        setError(body?.error || `Could not read assessments (HTTP ${res.status}).`);
        return;
      }
      setAssessments(Array.isArray(body?.assessments) ? body.assessments : []);
    } catch (err) {
      setAssessments([]);
      setError(err instanceof Error ? err.message : 'Could not reach core-engine.');
    } finally {
      setLoading(false);
    }
  }, [brandId, applicationId, customerId, scopeChosen]);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, brandId, applicationId, customerId]);

  const filteredAssessments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return assessments;
    return assessments.filter((a) =>
      [a.id, a.customerId, a.formId, a.skinProfileCode].some((v) => v && v.toLowerCase().includes(q)),
    );
  }, [assessments, searchQuery]);

  const totalItems = filteredAssessments.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedItems = filteredAssessments.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const activeFilterCount = (brandId ? 1 : 0) + (applicationId ? 1 : 0) + (customerId.trim() ? 1 : 0);

  const customFilterContent = (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <span className="text-xs font-bold text-foreground uppercase tracking-wider">Scope</span>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={() => {
              setBrandId('');
              setApplicationId('');
              setCustomerId('');
            }}
            className="text-[10px] text-primary hover:underline cursor-pointer"
          >
            Reset All
          </button>
        )}
      </div>

      {/* core-engine requires both scopes, so there is no "all brands" view. */}
      <BrandSelect value={brandId} onChange={setBrandId} includeUniversal label="Brand (required)" />
      <ApplicationSelect
        value={applicationId}
        onChange={setApplicationId}
        includeUniversal
        label="Application (required)"
      />

      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
          <User className="h-3 w-3 text-sky-400" />
          <span>Customer ID (optional)</span>
        </label>
        <input
          type="text"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          placeholder="Leave empty for the whole history"
          className="w-full bg-card border border-border rounded-md px-2 py-1.5 text-xs font-mono outline-none focus:border-primary"
        />
      </div>
    </div>
  );

  const columns: ColumnDef<AssessmentRecord>[] = [
    {
      key: 'brandId',
      header: 'Brand & Profile',
      render: (item) => (
        <div className="flex flex-col gap-1 items-start">
          <BrandTag name={item.brandId === UNIVERSAL ? 'Universal' : item.brandId} />
          {item.skinProfileCode ? (
            <span className="inline-block font-mono text-[10px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded border border-border">
              {item.skinProfileCode}
            </span>
          ) : (
            <span className="text-[10px] text-muted-foreground">no profile code</span>
          )}
        </div>
      ),
    },
    {
      key: 'customerId',
      header: 'Customer',
      render: (item) => (
        <div>
          <div className="font-semibold text-foreground flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="truncate max-w-[140px]" title={item.customerId}>
              {item.customerId}
            </span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground block mt-0.5 truncate max-w-[140px]">
            {item.id}
          </span>
        </div>
      ),
    },
    {
      key: 'totalScore',
      header: 'Score & Form',
      render: (item) => (
        <div className="flex flex-col gap-1 items-start">
          {typeof item.totalScore === 'number' ? (
            <span className="bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold px-1.5 py-0.5 rounded tabular-nums">
              {Math.round(item.totalScore)}
            </span>
          ) : (
            <span className="text-[10px] text-muted-foreground">not scored</span>
          )}
          {item.formId && <span className="text-[10px] font-mono text-muted-foreground">{item.formId}</span>}
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
          {typeof item.executionTimeMs === 'number' && (
            <span className="text-[10px] block">{item.executionTimeMs} ms</span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (item) => (
        <Button variant="ghost" size="icon-xs" onClick={() => setSelectedItem(item)} title="Inspect Record">
          <Eye className="h-3.5 w-3.5 text-primary" />
        </Button>
      ),
    },
  ];

  return (
    <div className="flex-1 min-w-0 h-full overflow-y-auto bg-background text-foreground font-sans flex flex-col select-none">
      <PageHeader
        icon={<Database className="h-5 w-5 text-primary" />}
        breadcrumbs={[
          { label: 'Workbench', href: '/' },
          { label: 'Master Data' },
          { label: 'Diagnostic Assessments' },
        ]}
        title="Diagnostic & Survey Assessments"
        description="Stored by core-engine when a survey is evaluated."
      />

      <main className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto">
        <SearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search assessment ID, customer, form, profile code..."
          customFilterContent={customFilterContent}
          activeFilterCount={activeFilterCount}
          onRefresh={fetchAssessments}
          isLoading={loading}
        />

        {!scopeChosen && (
          <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
            Choose a brand and an application to read assessments: core-engine scopes every record to both, and
            answers nothing without them.
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-foreground flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className={`${selectedItem ? 'lg:col-span-7' : 'lg:col-span-12'} transition-all duration-200`}>
            <DataTable
              columns={columns}
              data={paginatedItems}
              keyExtractor={(item) => item.id}
              isLoading={loading}
              onRowClick={(item) => setSelectedItem(item)}
              emptyMessage={
                !scopeChosen
                  ? 'No scope chosen yet.'
                  : searchQuery
                    ? 'No results matched your search query.'
                    : 'core-engine has no assessments stored for this brand and application.'
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

          {selectedItem && (
            <div className="lg:col-span-5 bg-card rounded-xl border border-border shadow-xl p-5 space-y-4 sticky top-6">
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
                  <Button variant="ghost" size="icon-xs" onClick={() => setSelectedItem(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {inspectRawJson ? (
                <CodeBlock code={JSON.stringify(selectedItem, null, 2)} language="json" />
              ) : (
                <div className="space-y-3 text-xs">
                  <Field label="Customer" value={selectedItem.customerId} mono />
                  <Field label="Application" value={selectedItem.applicationId} mono />
                  <Field label="Form" value={selectedItem.formId || '—'} mono />
                  <Field
                    label="Total score"
                    value={typeof selectedItem.totalScore === 'number' ? String(selectedItem.totalScore) : 'not scored'}
                  />
                  <Field label="Skin profile" value={selectedItem.skinProfileCode || 'none'} />

                  {/* These arrive as JSON strings from core-engine. */}
                  <JsonField label="Dimension scores" raw={selectedItem.dimensionScores} />
                  <JsonField label="Skin grading tiers" raw={selectedItem.skinGradingTiers} />
                  <JsonField label="Recommended products" raw={selectedItem.recommendedProducts} />
                  <JsonField label="Vision metrics" raw={selectedItem.visionMetrics} />
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className={`text-right text-foreground ${mono ? 'font-mono text-[11px]' : ''}`}>{value}</span>
    </div>
  );
}

function JsonField({ label, raw }: { label: string; raw: string | null | undefined }) {
  const parsed = parseJsonField(raw);
  if (parsed === null) {
    return (
      <div className="flex items-center justify-between gap-3">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-muted-foreground text-[11px]">not stored</span>
      </div>
    );
  }
  return (
    <div className="space-y-1">
      <span className="text-muted-foreground">{label}</span>
      <CodeBlock code={JSON.stringify(parsed, null, 2)} language="json" />
    </div>
  );
}
