'use client';

import React, { useMemo, useState } from 'react';
import { AlertTriangle, Info, Ruler, Scan } from 'lucide-react';
import { ApplicationSelect, Badge, BrandSelect, Button, cn, usePersistentState } from '@gateway-experience/shared';
import { useCoreCollection } from '@/lib/hooks/use-core-collection';
import { CameraCapture } from '../CameraCapture';
import { GuidanceOverlay } from './GuidanceOverlay';
import { type DrawnMeasurement } from './MeasurementOverlay';
import { FaceResultView } from './FaceResultView';
import { HeadPanel } from './HeadPanel';
import { ClassificationRow, Row, TraitRow } from './ResultRows';
import { useFaceArchitecture } from './useFaceArchitecture';
import {
  faceErrorText,
  isRetryable,
  measurementGeometry,
  regionConfidence,
  type FaceArchitectureResult,
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
  const [selectedMeasurement, setSelectedMeasurement] = useState<string | null>(null);
  const { result, error, loading, analyze } = useFaceArchitecture(file, getEndpoint);

  const drawn = useMemo<DrawnMeasurement[]>(() => {
    if (!result) return [];
    return result.measurements.flatMap((m) => {
      const geometry = measurementGeometry(m, result.landmarks);
      return geometry ? [{ m, geometry }] : [];
    });
  }, [result]);
  const drawnKeys = useMemo(() => new Set(drawn.map((d) => d.m.key)), [drawn]);

  const run = () => void analyze(brandId, applicationId);

  return (
    <div className="flex-1 min-h-0 overflow-auto p-4">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-3">
            {!file && <CameraCapture onPhoto={onPhoto} />}
            {file && photoUrl && (
              <>
                {result ? (
                  <FaceResultView
                    photoUrl={photoUrl}
                    result={result}
                    drawn={drawn}
                    selectedMeasurement={selectedMeasurement}
                    onSelectMeasurement={setSelectedMeasurement}
                    verifiedOnly={verifiedOnly}
                    onVerifiedOnlyChange={setVerifiedOnly}
                    renderHead={() => (
                      <HeadPanel front={file} brandId={brandId} applicationId={applicationId} getEndpoint={getEndpoint} />
                    )}
                  />
                ) : (
                  <GuidanceOverlay photoUrl={photoUrl} regions={[]} verifiedOnly={false} />
                )}
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

            {result && (
              <details className="group rounded-2xl border border-border bg-card shadow-xs">
                <summary className="cursor-pointer select-none px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Detail teks lengkap
                </summary>
                <div className="px-3 pb-3">
                  <ResultCards
                    result={result}
                    drawnKeys={drawnKeys}
                    selectedMeasurement={selectedMeasurement}
                    onSelectMeasurement={(key) => setSelectedMeasurement((prev) => (prev === key ? null : key))}
                  />
                </div>
              </details>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ResultCardsProps {
  result: FaceArchitectureResult;
  /** Measurements that have a drawing on the photo. */
  drawnKeys: Set<string>;
  selectedMeasurement: string | null;
  onSelectMeasurement: (key: string) => void;
}

function ResultCards({ result, drawnKeys, selectedMeasurement, onSelectMeasurement }: ResultCardsProps) {
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
          {!result.landmarks && result.measurements.some((m) => m.value !== null) && (
            <p className="pb-1 text-[11px] text-muted-foreground">
              Engine tidak mengirim koordinat landmark, jadi pengukuran belum bisa digambar di foto.
            </p>
          )}
          {drawnKeys.size > 0 && (
            <p className="pb-1 text-[11px] text-muted-foreground">Klik pengukuran untuk menyorotnya di foto.</p>
          )}
          {result.measurements.map((m) => {
            const drawable = drawnKeys.has(m.key);
            const selected = selectedMeasurement === m.key;
            return (
              <button
                key={m.key}
                type="button"
                disabled={!drawable}
                onClick={() => onSelectMeasurement(m.key)}
                aria-pressed={selected}
                className={cn(
                  'flex w-full items-center justify-between gap-2 rounded px-1 text-left',
                  drawable && 'hover:bg-muted/60',
                  selected && 'bg-muted font-semibold',
                )}
              >
                <span className="min-w-0 truncate text-muted-foreground">{m.key}</span>
                <span className="shrink-0 tabular-nums">
                  {m.value === null ? (
                    <span className="text-muted-foreground">{m.reason || 'tidak tersedia'}</span>
                  ) : (
                    `${Array.isArray(m.value) ? m.value.join(', ') : m.value} ${m.unit}`
                  )}
                  {m.proxy && <Badge variant="warning" className="ml-1">proxy</Badge>}
                </span>
              </button>
            );
          })}
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
