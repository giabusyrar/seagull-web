'use client';

import React, { useMemo, useState } from 'react';
import { AlertTriangle, Loader2, RotateCcw, Sparkles } from 'lucide-react';
import { ApplicationSelect, BrandSelect, Button, cn, usePersistentState } from '@gateway-experience/shared';
import { useCoreCollection } from '@/lib/hooks/use-core-collection';
import { AnalysisCard } from '../AnalysisCard';
import { CameraCapture } from '../CameraCapture';
import { YesNoField, type YesNo } from '../YesNoField';
import { CATEGORY_LABEL, errorText } from '../types';
import { FaceResultView, MeasurementSummary } from '../face/FaceResultView';
import { HeadReportSummary, ShadingControl, SidePhoto } from '../face/HeadPanel';
import { HeadViewer, type HeadShading, type HeadStats } from '../face/HeadViewer';
import { ClassificationRow, GuidanceDetail, TraitRow } from '../face/ResultRows';
import { faceErrorText, measurementGeometry, type FaceArchitectureResult } from '../face/faceTypes';
import { headErrorText } from '../face/headTypes';
import { headMarkers } from '../face/headMarkers';
import { measurementName } from '../face/measurementCopy';
import { physicalScale } from '../face/physicalScale';
import { useFaceArchitecture } from '../face/useFaceArchitecture';
import { useFaceHead } from '../face/useFaceHead';
import { type DrawnMeasurement } from '../face/MeasurementOverlay';
import { useColourAnalysis } from './useColourAnalysis';

// Shared with the Bentuk Wajah tab, so the profile scope and PD are chosen once.
const FACE_PREFIX = 'xg.faceArchitect.';

interface Props {
  file: File | null;
  photoUrl: string | null;
  onPhoto: (f: File | null) => void;
  hijab: YesNo;
  onHijab: (v: YesNo) => void;
  hairVisible: YesNo;
  onHairVisible: (v: YesNo) => void;
}

/**
 * One capture, three analyses, one screen. The front photo (plus optional
 * three-quarter side photos for the head) and the two colour questions are
 * asked once; then face architecture, the 3D head and colour analysis run in
 * parallel, each with its own loading and error state. The 3D head is the
 * centrepiece, with the measurements drawn on it; the measurement and colour
 * panels sit beside it. Without a head (it failed, or is still loading) the
 * measurements fall back to the 2D overlay on the photo.
 */
export function CombinedAnalysisView({ file, photoUrl, onPhoto, hijab, onHijab, hairVisible, onHairVisible }: Props) {
  const { getEndpoint } = useCoreCollection();
  const [brandId, setBrandId] = usePersistentState<string>(FACE_PREFIX + 'brand', '*');
  const [applicationId, setApplicationId] = usePersistentState<string>(FACE_PREFIX + 'application', '*');
  const [pdMm] = usePersistentState<number | null>(FACE_PREFIX + 'pdMm', null);
  const [sides, setSides] = useState<Partial<Record<'left' | 'right', File>>>({});
  const views = useMemo(() => (file ? { front: file, ...sides } : {}), [file, sides]);

  const face = useFaceArchitecture(file, getEndpoint);
  const head = useFaceHead(views, getEndpoint);
  const colour = useColourAnalysis(file, getEndpoint);
  const [started, setStarted] = useState(false);

  const ready = !!file && hijab !== '' && hairVisible !== '';
  const runAll = () => {
    if (!ready) return;
    setStarted(true);
    void face.analyze(brandId, applicationId);
    void head.build(brandId, applicationId);
    void colour.analyze(hijab === 'yes', hairVisible === 'yes');
  };
  const reset = () => {
    onPhoto(null);
    setSides({});
    setStarted(false);
  };

  if (!file || !photoUrl) {
    return (
      <div className="mx-auto max-w-md">
        <CameraCapture onPhoto={onPhoto} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <CaptureBar
        photoUrl={photoUrl}
        sides={sides}
        onSide={(side, f) => setSides((s) => ({ ...s, [side]: f ?? undefined }))}
        hijab={hijab}
        onHijab={onHijab}
        hairVisible={hairVisible}
        onHairVisible={onHairVisible}
        brandId={brandId}
        onBrand={setBrandId}
        applicationId={applicationId}
        onApplication={setApplicationId}
        ready={ready}
        running={face.loading || head.loading || colour.loading}
        started={started}
        onRun={runAll}
        onReset={reset}
      />

      {started && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] items-start">
          <HeadStage
            photoUrl={photoUrl}
            head={head}
            face={face.result}
            faceLoading={face.loading}
            pdMm={pdMm}
          />
          <div className="space-y-4 min-w-0">
            <MeasurementPanel result={face.result} loading={face.loading} error={face.error ? faceErrorText(face.error) : null} />
            <ColourPanel colour={colour} />
          </div>
        </div>
      )}
    </div>
  );
}

function CaptureBar(props: {
  photoUrl: string;
  sides: Partial<Record<'left' | 'right', File>>;
  onSide: (side: 'left' | 'right', f: File | null) => void;
  hijab: YesNo;
  onHijab: (v: YesNo) => void;
  hairVisible: YesNo;
  onHairVisible: (v: YesNo) => void;
  brandId: string;
  onBrand: (v: string) => void;
  applicationId: string;
  onApplication: (v: string) => void;
  ready: boolean;
  running: boolean;
  started: boolean;
  onRun: () => void;
  onReset: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
      <div className="grid gap-4 md:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={props.photoUrl} alt="Foto depan" className="h-28 w-24 rounded-lg border border-border object-cover" />

        <div className="space-y-2 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Foto</div>
          <p className="text-xs">
            Depan <span className="text-muted-foreground">(wajib, sudah ada)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {(['left', 'right'] as const).map((side) => (
              <SidePhoto
                key={side}
                label={side === 'left' ? 'Samping kiri' : 'Samping kanan'}
                file={props.sides[side]}
                onChange={(f) => props.onSide(side, f)}
              />
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">Foto samping (tiga perempat) opsional, untuk kepala 3D yang lebih akurat.</p>
        </div>

        <div className="space-y-2 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Untuk analisis warna</div>
          <YesNoField label="Memakai hijab atau penutup kepala?" value={props.hijab} onChange={props.onHijab} />
          <YesNoField label="Rambut terlihat di foto?" value={props.hairVisible} onChange={props.onHairVisible} />
        </div>
      </div>

      <details className="mt-3 text-xs">
        <summary className="cursor-pointer select-none text-[11px] text-muted-foreground">Scope profil bentuk wajah</summary>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <BrandSelect value={props.brandId} onChange={props.onBrand} includeUniversal label="Brand" />
          <ApplicationSelect value={props.applicationId} onChange={props.onApplication} includeUniversal label="Aplikasi" />
        </div>
      </details>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button onClick={props.onRun} disabled={!props.ready || props.running} leftIcon={<Sparkles className="h-4 w-4" />}>
          {props.running ? 'Menganalisis…' : props.started ? 'Analisis ulang' : 'Analisis semua'}
        </Button>
        <Button variant="outline" size="sm" leftIcon={<RotateCcw className="h-3.5 w-3.5" />} onClick={props.onReset}>
          Foto ulang
        </Button>
        {!props.ready && <span className="text-[11px] text-muted-foreground">Jawab kedua pertanyaan untuk melanjutkan.</span>}
      </div>
    </div>
  );
}

function HeadStage({
  photoUrl,
  head,
  face,
  faceLoading,
  pdMm,
}: {
  photoUrl: string;
  head: ReturnType<typeof useFaceHead>;
  face: FaceArchitectureResult | null;
  faceLoading: boolean;
  pdMm: number | null;
}) {
  const [stats, setStats] = useState<HeadStats | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [shading, setShading] = useState<HeadShading>('provenance');
  const [selected, setSelected] = useState<string | null>(null);

  const catalogue = face?.provenance.catalogueVersion ?? '';
  const mmPerIod = face ? (physicalScale(face, pdMm)?.mmPerIod ?? null) : null;
  const landmarkPoints = stats?.report?.landmarkPoints;
  const markers = useMemo(
    () => (face ? headMarkers(face.measurements, landmarkPoints, selected) : []),
    [face, landmarkPoints, selected],
  );
  const markedKeys = new Set(markers.map((m) => m.key));

  // 2D fallback: the existing photo overlay, when there is no head to show.
  const drawn = useMemo<DrawnMeasurement[]>(
    () =>
      face
        ? face.measurements.flatMap((m) => {
            const geometry = measurementGeometry(m, face.landmarks);
            return geometry ? [{ m, geometry }] : [];
          })
        : [],
    [face],
  );
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const fallback2d = !head.glb && !head.loading;

  return (
    <div className="space-y-2 rounded-2xl border border-border bg-card p-3 shadow-xs min-w-0">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Kepala 3D</div>

      {head.loading && (
        <div className="flex aspect-[4/5] w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border text-xs text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Membuat kepala 3D dari foto…
        </div>
      )}

      {(head.error || loadError) && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-2.5 text-xs">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <span>
            {head.error ? headErrorText(head.error) : `GLB tidak bisa dibaca: ${loadError}`} Pengukuran ditampilkan di foto sebagai gantinya.
          </span>
        </div>
      )}

      {head.glb && (
        <>
          <HeadViewer
            glb={head.glb}
            shading={shading}
            onLoaded={setStats}
            onError={setLoadError}
            markers={markers}
          />
          <ShadingControl shading={shading} onChange={setShading} stats={stats} />
          {face && stats && !landmarkPoints && (
            <p className="text-[11px] text-muted-foreground">
              Pengukuran belum bisa digambar di kepala: kepala ini belum membawa posisi 3D titik wajah (landmarkPoints). Daftar
              pengukuran di bawah tetap dari analisis 2D.
            </p>
          )}
        </>
      )}

      {fallback2d && face && (
        <FaceResultView
          photoUrl={photoUrl}
          result={face}
          drawn={drawn}
          selectedMeasurement={selected}
          onSelectMeasurement={setSelected}
          verifiedOnly={verifiedOnly}
          onVerifiedOnlyChange={setVerifiedOnly}
        />
      )}
      {fallback2d && !face && faceLoading && <p className="text-xs text-muted-foreground">Menunggu hasil pengukuran…</p>}

      {face && head.glb && (
        <div className="space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pengukuran</div>
          <ul className="divide-y divide-border/60 rounded-lg border border-border">
            {face.measurements.map((m) => {
              const drawable = markedKeys.has(m.key);
              const isSel = selected === m.key;
              return (
                <li key={m.key}>
                  <button
                    type="button"
                    disabled={!drawable}
                    onClick={() => setSelected(isSel ? null : m.key)}
                    aria-pressed={isSel}
                    title={drawable ? `Sorot ${measurementName(m, catalogue)} di kepala` : undefined}
                    className={cn('w-full px-3 py-1.5 text-left', drawable && 'hover:bg-muted/50', isSel && 'bg-muted/60')}
                  >
                    <MeasurementSummary m={m} catalogue={catalogue} mmPerIod={mmPerIod} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {stats && <HeadReportSummary report={stats.report} provenanceMissing={stats.provenanceMissing} />}
    </div>
  );
}

function PanelShell({ title, loading, error, children }: { title: string; loading: boolean; error: string | null; children?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-2 min-w-0">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {title}
        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      </div>
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-2.5 text-xs">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <span>{error}</span>
        </div>
      )}
      {loading && !children && <p className="text-xs text-muted-foreground">Menganalisis…</p>}
      {children}
    </div>
  );
}

function MeasurementPanel({ result, loading, error }: { result: FaceArchitectureResult | null; loading: boolean; error: string | null }) {
  const cal = result?.provenance.calibration;
  return (
    <PanelShell title="Bentuk wajah" loading={loading} error={error}>
      {result && (
        <div className="space-y-3">
          {cal && cal.status !== 'calibrated' && (
            <p className="flex items-start gap-1.5 rounded-lg border border-warning/40 bg-warning/10 px-2.5 py-1.5 text-[11px]">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
              <span>
                <span className="font-semibold">Profil belum terkalibrasi ({cal.status}).</span> Interpretasi profil, bukan vonis
                bentuk wajah.
              </span>
            </p>
          )}
          <div>
            {Object.entries(result.classifications).map(([k, c]) => (
              <ClassificationRow key={k} name={k} c={c} />
            ))}
            {Object.entries(result.traits).map(([k, t]) => (
              <TraitRow key={k} name={k} t={t} optionsNote={false} />
            ))}
          </div>
          {Object.keys(result.traits).length > 0 && (
            <p className="text-[11px] text-muted-foreground">
              Tiap trait menampilkan hasil dan alternatif terdekat; engine belum mengirim daftar semua opsinya.
            </p>
          )}
          {result.guidance && result.guidance.regions.length > 0 && (
            <div>
              <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Panduan makeup</div>
              {result.guidance.regions.map((r, i) => (
                <GuidanceDetail key={`${r.template}-${i}`} r={r} />
              ))}
            </div>
          )}
        </div>
      )}
    </PanelShell>
  );
}

function ColourPanel({ colour }: { colour: ReturnType<typeof useColourAnalysis> }) {
  const r = colour.result;
  return (
    <PanelShell title="Warna" loading={colour.loading} error={colour.error ? errorText(colour.error) : null}>
      {r && (
        <div className="space-y-3">
          <AnalysisCard result={r} defaultOpen />
          {Object.entries(r.recommendations ?? {}).some(([, recs]) => recs.length > 0) && (
            <div className="space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Palet yang cocok</div>
              {Object.entries(r.recommendations).map(([cat, recs]) =>
                recs.length === 0 ? null : (
                  <div key={cat} className="space-y-1">
                    <div className="text-[11px] font-semibold">{CATEGORY_LABEL[cat] ?? cat}</div>
                    <ul className="flex flex-wrap gap-1.5">
                      {recs.map((s) => (
                        <li key={s.shadeId} title={`${s.productName} · ${s.shadeName}`}>
                          <span
                            className={cn(
                              'block h-6 w-6 rounded-full border border-border shadow-2xs',
                              s.status === 'complementary' && 'ring-1 ring-offset-1 ring-border',
                            )}
                            style={{ backgroundColor: s.hexColor }}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                ),
              )}
              <p className="text-[11px] text-muted-foreground">Bercincin = warna pelengkap; tanpa cincin = sekuadran denganmu.</p>
            </div>
          )}
        </div>
      )}
    </PanelShell>
  );
}
