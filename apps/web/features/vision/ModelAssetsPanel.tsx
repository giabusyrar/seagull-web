'use client';

import React, { useState } from 'react';
import { AlertTriangle, Check, Download, History, Upload } from 'lucide-react';
import { Button, DataTable, InfoTooltip, type ColumnDef } from '@gateway-experience/shared';
import { useModelAssets, type AssetGroup, type AssetHistoryEntry, type ModelAsset } from './useModelAssets';

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KiB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MiB`;
}

/**
 * The model assets a worker fetches at start — FaceLandmarker today — as
 * opposed to the capability models in the registry panel, which score an
 * analysis. Several versions can exist under one name; exactly one is active,
 * and that is the one workers get.
 */
export function ModelAssetsPanel() {
  const { groups, isLoading, error, refresh, upload, activate, deactivate, history } = useModelAssets();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [historyFor, setHistoryFor] = useState<{ name: string; entries: AssetHistoryEntry[] } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Upload form
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [label, setLabel] = useState('');
  const [activateOnUpload, setActivateOnUpload] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!name.trim() || !file) return;
    setUploading(true);
    setActionError(null);
    const result = await upload(name.trim(), file, {
      label: label.trim() || undefined,
      activate: activateOnUpload,
    });
    setUploading(false);
    if (result.ok) {
      setName('');
      setFile(null);
      setLabel('');
      setActivateOnUpload(false);
    } else {
      setActionError(result.error ?? 'Upload failed.');
    }
  };

  const showHistory = async (assetName: string) => {
    setActionError(null);
    try {
      const data = await history(assetName);
      setHistoryFor({ name: assetName, entries: Array.isArray(data?.history) ? data.history : [] });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not read the history.');
    }
  };

  const columns: ColumnDef<AssetGroup>[] = [
    {
      key: 'name',
      header: 'Asset',
      render: (group) => (
        <div>
          <div className="font-mono text-xs font-semibold text-foreground">{group.name}</div>
          <div className="text-[10px] text-muted-foreground">
            {group.versions.length} version{group.versions.length === 1 ? '' : 's'}
          </div>
        </div>
      ),
    },
    {
      key: 'active',
      header: 'Active version',
      render: (group) => {
        const active = group.versions.find((v) => v.id === group.activeId);
        if (!active) {
          // Not an error: an asset with no active version simply is not served.
          return <span className="text-[11px] text-muted-foreground">none active — workers get nothing</span>;
        }
        return (
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs text-foreground">
              <Check className="h-3 w-3 text-emerald-600" />
              {active.label || active.original_filename}
            </div>
            <div className="text-[10px] text-muted-foreground font-mono">{formatBytes(active.size_bytes)}</div>
          </div>
        );
      },
    },
    {
      key: 'sha256',
      header: 'SHA-256',
      render: (group) => {
        const active = group.versions.find((v) => v.id === group.activeId) ?? group.versions[0];
        if (!active) return null;
        return (
          // Shown, not hidden: it is the only way to tell whether the stored
          // file is the one you think it is.
          <span className="font-mono text-[10px] text-muted-foreground" title={active.sha256}>
            {active.sha256.slice(0, 12)}…
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (group) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button variant="ghost" size="xs" onClick={() => showHistory(group.name)} leftIcon={<History className="h-3 w-3" />}>
            History
          </Button>
          <Button variant="ghost" size="xs" onClick={() => setExpanded(expanded === group.name ? null : group.name)}>
            {expanded === group.name ? 'Hide versions' : 'Versions'}
          </Button>
          <a
            href={`/api/vision-worker/assets/${encodeURIComponent(group.name)}`}
            className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
          >
            <Download className="h-3 w-3" />
            Download
          </a>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <InfoTooltip
          label="About model assets"
          content={
            <>
              Shared model files the Python workers fetch when they start — FaceLandmarker today. One version per
              name is active, and that is the one workers receive. These are not the capability models in the Models
              tab, which score an analysis.
            </>
          }
        />
        <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={isLoading}>
          Refresh
        </Button>
      </div>

      {(error || actionError) && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
          <span className="text-foreground">{error ?? actionError}</span>
        </div>
      )}

      <DataTable
        columns={columns}
        data={groups}
        keyExtractor={(group) => group.name}
        isLoading={isLoading}
        emptyMessage="The asset registry is empty. Nothing has been uploaded, so workers fall back to whatever ships in their image."
      />

      {expanded && <VersionList group={groups.find((g) => g.name === expanded)} onActivate={activate} onDeactivate={deactivate} />}

      {historyFor && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Activation history · {historyFor.name}
            </span>
            <Button variant="ghost" size="xs" onClick={() => setHistoryFor(null)}>
              Close
            </Button>
          </div>
          {historyFor.entries.length === 0 ? (
            <p className="text-[11px] text-muted-foreground">No activations recorded for this asset.</p>
          ) : (
            <ul className="space-y-1 text-[11px] font-mono text-muted-foreground">
              {historyFor.entries.map((entry, i) => (
                <li key={i}>{JSON.stringify(entry)}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Upload */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Upload a version</div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-[11px] text-muted-foreground">
              Asset name — workers fetch by this exact name (e.g. face_landmarker)
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="face_landmarker"
              className="w-full rounded-md border border-border bg-background px-2 py-1.5 font-mono text-xs outline-none focus:border-primary"
            />
          </label>
          <label className="space-y-1">
            <span className="text-[11px] text-muted-foreground">Label (optional)</span>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="float16 v1"
              className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs outline-none focus:border-primary"
            />
          </label>
        </div>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-xs file:mr-3 file:rounded-md file:border file:border-border file:bg-secondary file:px-3 file:py-1.5 file:text-xs"
        />
        <label className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <input type="checkbox" checked={activateOnUpload} onChange={(e) => setActivateOnUpload(e.target.checked)} />
          Activate this version once uploaded
        </label>
        <Button onClick={handleUpload} disabled={!name.trim() || !file || uploading} leftIcon={<Upload className="h-3.5 w-3.5" />}>
          {uploading ? 'Uploading…' : 'Upload'}
        </Button>
      </div>
    </div>
  );
}

function VersionList({
  group,
  onActivate,
  onDeactivate,
}: {
  group?: AssetGroup;
  onActivate: (name: string, id: string) => Promise<{ ok: boolean; error?: string }>;
  onDeactivate: (name: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [busy, setBusy] = useState(false);
  if (!group) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Versions · {group.name}
        </span>
        {group.activeId && (
          <Button
            variant="outline"
            size="xs"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await onDeactivate(group.name);
              setBusy(false);
            }}
          >
            Deactivate
          </Button>
        )}
      </div>
      <ul className="divide-y divide-border/60">
        {group.versions.map((v: ModelAsset) => (
          <li key={v.id} className="flex items-center justify-between gap-3 py-2 text-xs">
            <div className="min-w-0">
              <div className="truncate text-foreground">
                {v.label || v.original_filename}
                {v.id === group.activeId && (
                  <span className="ml-2 rounded border border-emerald-500/30 bg-emerald-500/10 px-1 text-[9px] font-bold text-emerald-600">
                    ACTIVE
                  </span>
                )}
              </div>
              <div className="truncate font-mono text-[10px] text-muted-foreground" title={v.sha256}>
                {formatBytes(v.size_bytes)} · {v.sha256.slice(0, 16)}… · {new Date(v.uploaded_at).toLocaleString('id-ID')}
              </div>
            </div>
            {v.id !== group.activeId && (
              <Button
                variant="outline"
                size="xs"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  await onActivate(group.name, v.id);
                  setBusy(false);
                }}
              >
                Activate
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
