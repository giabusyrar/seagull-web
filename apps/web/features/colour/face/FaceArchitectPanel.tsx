'use client';

import React, { useState } from 'react';
import { AlertTriangle, Info, Ruler, Scan } from 'lucide-react';
import { ApplicationSelect, Badge, BrandSelect, Button, cn, usePersistentState } from '@gateway-experience/shared';
import { useCoreCollection } from '@/lib/hooks/use-core-collection';
import { CameraCapture } from '../CameraCapture';
import { GuidanceLegend, GuidanceOverlay } from './GuidanceOverlay';
import { useFaceArchitecture } from './useFaceArchitecture';
import {
  CLASSIFICATION_STATUS_LABEL,
  TRAIT_STATUS_LABEL,
  faceErrorText,
  isRetryable,
  regionConfidence,
  type Classification,
  type FaceArchitectureResult,
  type Trait,
} from './faceTypes';

const PERSIST_PREFIX = 'xg.faceArchitect.';

interface Props {
  file: File | null;
  photoUrl: string | null;
  onPhoto: (f: File | null) => void;
}

/**
 * Face architecture: shape classification, per-feature traits and makeup
 * placement guidance for one photo, from the same studio photo the colour
 * tab uses.
 *
 * The seed profile shipped with core-engine is uncalibrated, so this panel
 * states that on every result and never presents a shape as a measured
 * verdict. Entries the engine could not assess are shown with their reason
 * rather than hidden, and guidance it could not verify is drawn distinctly.
 */
export function FaceArchitectPanel({ file, photoUrl, onPhoto }: Props) {
  const { getEndpoint } = useCoreCollection();
  const [brandId, setBrandId] = usePersistentState<string>(PERSIST_PREFIX + 'brand', '*');
  const [applicationId, setApplicationId] = usePersistentState<string>(PERSIST_PREFIX + 'application', '*');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const { result, error, loading, analyze } = useFaceArchitecture(file, getEndpoint);

  const run = () => void analyze(brandId, applicationId);

  return (
    <div className="flex-1 min-h-0 overflow-auto p-4">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-3">
            {!file && <CameraCapture onPhoto={onPhoto} />}
            {file && photoUrl && (
              <>
                <GuidanceOverlay photoUrl={photoUrl} regions={result?.guidance?.regions ?? []} verifiedOnly={verifiedOnly} />
                {result?.guidance?.regions?.length ? (
                  <div className="space-y-2">
                    <GuidanceLegend regions={result.guidance.regions} />
                    <label className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} />
                      Sembunyikan penempatan yang belum terkonfirmasi
                    </label>
                  </div>
                ) : null}
                <Button variant="secondary" onClick={() => onPhoto(null)}>
                  Ganti foto
                </Button>
              </>
            )}
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-border bg-card p-4 space-y-3 shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Scope profil</div>
              <BrandSelect value={brandId} onChange={setBrandId} includeUniversal label="Brand" />
              <ApplicationSelect value={applicationId} onChange={setApplicationId} includeUniversal label="Aplikasi" />
              <Button onClick={run} disabled={!file || loading} className="w-full">
                <Scan className="h-4 w-4" />
                {loading ? 'Menganalisis…' : 'Analisis bentuk wajah'}
              </Button>
              {!file && <p className="text-[11px] text-muted-foreground">Ambil atau unggah foto lebih dulu.</p>}
            </div>

            {error && (
              <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  {error.status === 409 ? 'Belum dikonfigurasi' : 'Analisis gagal'}
                </div>
                <p className="text-xs text-foreground">{faceErrorText(error)}</p>
                {error.entries.length > 1 && (
                  <ul className="list-disc pl-4 text-[11px] text-muted-foreground">
                    {error.entries.map((e, i) => (
                      <li key={i}>{typeof e.reason === 'string' ? e.reason : JSON.stringify(e)}</li>
                    ))}
                  </ul>
                )}
                {isRetryable(error) && (
                  <Button variant="secondary" onClick={run} disabled={loading}>
                    Coba lagi
                  </Button>
                )}
              </div>
            )}

            {result && <ResultCards result={result} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultCards({ result }: { result: FaceArchitectureResult }) {
  const cal = result.provenance.calibration;
  const dropped = result.guidance?.droppedTemplates ?? [];

  return (
    <div className="space-y-3">
      {cal.status !== 'calibrated' && (
        <div className="rounded-2xl border border-warning/40 bg-warning/5 p-4 text-xs space-y-1">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Info className="h-4 w-4" />
            Profil belum terkalibrasi ({cal.status})
          </div>
          <p className="text-muted-foreground">
            Hasil di bawah adalah interpretasi profil, bukan pengukuran yang sudah divalidasi. Jangan dibaca sebagai vonis
            bentuk wajah.
          </p>
        </div>
      )}

      <Card title="Klasifikasi">
        {Object.entries(result.classifications).map(([key, c]) => (
          <ClassificationRow key={key} name={key} c={c} />
        ))}
        {Object.keys(result.classifications).length === 0 && <Empty>Profil ini tidak punya klasifikasi.</Empty>}
      </Card>

      <Card title="Trait">
        {Object.entries(result.traits).map(([key, t]) => (
          <TraitRow key={key} name={key} t={t} />
        ))}
        {Object.keys(result.traits).length === 0 && <Empty>Profil ini tidak punya trait.</Empty>}
      </Card>

      <Card title="Panduan makeup">
        {result.guidance === null && <Empty>Profil ini tidak punya bagian guidance.</Empty>}
        {result.guidance?.regions.map((r, i) => (
          <div key={`${r.template}-${i}`} className="flex items-center justify-between gap-2 py-1 text-xs">
            <span className="min-w-0 truncate">
              {r.role} · <span className="text-muted-foreground">{r.template}</span>
            </span>
            <span className="flex shrink-0 items-center gap-1">
              {r.match === 'secondary' && <Badge variant="warning">bukti lemah</Badge>}
              <Badge variant={regionConfidence(r) === 'verified' ? 'default' : 'warning'}>{regionConfidence(r)}</Badge>
            </span>
          </div>
        ))}
        {dropped.length > 0 && (
          <div className="mt-2 border-t border-border pt-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tidak bisa ditempatkan</div>
            <ul className="mt-1 space-y-0.5 text-[11px] text-muted-foreground">
              {dropped.map((d, i) => (
                <li key={`${d.template}-${i}`}>
                  {d.template}: {d.reason}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      <Card title="Pengukuran">
        <div className="space-y-1 text-xs">
          {result.measurements.map((m) => (
            <div key={m.key} className="flex items-center justify-between gap-2">
              <span className="min-w-0 truncate text-muted-foreground">{m.key}</span>
              <span className="shrink-0 tabular-nums">
                {m.value === null ? <span className="text-muted-foreground">{m.reason || 'tidak tersedia'}</span> : `${m.value} ${m.unit}`}
                {m.proxy && <Badge variant="warning" className="ml-1">proxy</Badge>}
              </span>
            </div>
          ))}
          {(result.measurementsMissing?.length ?? 0) > 0 && (
            <p className="pt-1 text-[11px] text-muted-foreground">
              Tidak dikembalikan worker: {result.measurementsMissing!.join(', ')}
            </p>
          )}
        </div>
      </Card>

      <Card title="Kualitas & asal data">
        <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
          <Row label="Roll" value={`${result.quality.rollDeg.toFixed(1)}°`} />
          <Row label="Yaw" value={`${result.quality.yawDeg.toFixed(1)}°`} />
          <Row label="Pitch" value={`${result.quality.pitchDeg.toFixed(1)}°`} />
          <Row label="IOD" value={`${result.quality.iodPx.toFixed(0)} px`} />
          <Row label="Model" value={`${result.provenance.model.name} ${result.provenance.model.version}`} />
          <Row label="Profil" value={`${result.provenance.profile.code} v${result.provenance.profile.version}`} />
        </dl>
        {result.quality.warnings.length > 0 && (
          <p className="mt-2 text-[11px] text-muted-foreground">Peringatan: {result.quality.warnings.join(', ')}</p>
        )}
      </Card>
    </div>
  );
}

function ClassificationRow({ name, c }: { name: string; c: Classification }) {
  const assessed = c.status === 'single' || c.status === 'blend';
  return (
    <div className="border-b border-border/60 py-2 last:border-0">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium">{name}</span>
        <Badge variant={assessed ? 'default' : 'warning'}>{CLASSIFICATION_STATUS_LABEL[c.status] || c.status}</Badge>
      </div>
      {assessed && (
        <div className="mt-0.5 text-xs text-foreground">
          {c.primary}
          {c.secondary && <span className="text-muted-foreground"> + {c.secondary}</span>}
        </div>
      )}
      {c.reason && <p className="mt-0.5 text-[11px] text-muted-foreground">{c.reason}</p>}
      {(c.notAssessable?.length ?? 0) > 0 && (
        <p className="text-[11px] text-muted-foreground">Tidak bisa dinilai: {c.notAssessable.join(', ')}</p>
      )}
    </div>
  );
}

function TraitRow({ name, t }: { name: string; t: Trait }) {
  return (
    <div className="border-b border-border/60 py-2 last:border-0">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium">{name}</span>
        <span className="flex items-center gap-1">
          {t.boundaryUncertain && <Badge variant="warning">di batas</Badge>}
          <Badge variant={t.status === 'assessed' ? 'default' : 'warning'}>{TRAIT_STATUS_LABEL[t.status] || t.status}</Badge>
        </span>
      </div>
      {t.label && (
        <div className="mt-0.5 text-xs">
          {t.label}
          {t.alternative && <span className="text-muted-foreground"> (atau {t.alternative})</span>}
        </div>
      )}
      {t.reason && <p className="mt-0.5 text-[11px] text-muted-foreground">{t.reason}</p>}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
      <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        <Ruler className="h-3 w-3" />
        {title}
      </div>
      {children}
    </div>
  );
}

const Empty = ({ children }: { children: React.ReactNode }) => <p className="text-[11px] text-muted-foreground">{children}</p>;

const Row = ({ label, value }: { label: string; value: string }) => (
  <>
    <dt className="text-muted-foreground">{label}</dt>
    <dd className={cn('text-right tabular-nums')}>{value}</dd>
  </>
);
