'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Download, Palette, RotateCcw, ScanFace, Sparkles, Undo2 } from 'lucide-react';
import { ApplicationSelect, BrandSelect, Button, cn, loadBlob, saveBlob, usePersistentState } from '@gateway-experience/shared';
import { useCoreCollection } from '@/lib/hooks/use-core-collection';
import { analyzeColour, fetchColourCatalog } from './api';
import { AnalysisCard } from './AnalysisCard';
import { CameraCapture } from './CameraCapture';
import { ProductPicker } from './ProductPicker';
import { useTryOn } from './useTryOn';
import { YesNoField, type YesNo } from './YesNoField';
import { brandsInCatalog, filterCatalog, type BrandCount } from './brands/filterCatalog';
import { useProductBrands } from './brands/useProductBrands';
import { FacePanel } from './studio/FacePanel';
import { PhotoStage, type Panel, type Stage } from './studio/PhotoStage';
import { SideShots, type Side, type Sides } from './studio/SideShots';
import { measurementGeometry } from './face/faceTypes';
import { physicalScale } from './face/physicalScale';
import { useFaceArchitecture } from './face/useFaceArchitecture';
import { useFaceHead } from './face/useFaceHead';
import type { DrawnMeasurement } from './face/MeasurementOverlay';
import { catalogOf, errorText, type AnalyzeResult, type ApiError, type CatalogResult } from './types';

type Step = 'capture' | 'questions' | 'result';

// The last session — photo, answers, analysis and chosen look — survives a
// reload. The photo is a file, so it goes to IndexedDB; the rest to
// localStorage. Shared by the workbench tab and /colour-analysis.
const PERSIST_PREFIX = 'xg.tryOnEngine.';
const PHOTO_KEY = PERSIST_PREFIX + 'photo';
// Shared with the face-architecture panel, so the profile scope and PD are set once.
const FACE_PREFIX = 'xg.faceArchitect.';

/**
 * Personal colour and face analysis from one photo, laid out like the
 * brand's existing try-on (photo on the left, panels on the right), in the
 * Seagull theme.
 *
 * Flow: photo (camera or upload) → two questions, optional side photos →
 * one "Analisis" that runs, in parallel, the colour analysis (POST
 * /core/colour-engine/analyze), face architecture (POST
 * /core/vision-engine/face-architecture/:brand/:app) and the 3D head (…/head).
 * The right side switches between Warna (result + try-on, POST
 * /core/colour-engine/tryon) and Wajah (measurements, shape, guidance); the
 * photo side has a floating 2D/3D switch. "Langsung coba makeup" skips the
 * analyses and loads the catalog (GET /core/colour-engine/catalog).
 */
export function ColourStudioView() {
  const { getEndpoint } = useCoreCollection();

  const [file, setFile] = useState<File | null>(null);
  const photoUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  const [sides, setSides] = useState<Sides>({});
  const [hijab, setHijab] = usePersistentState<YesNo>(PERSIST_PREFIX + 'hijab', '');
  const [hairVisible, setHairVisible] = usePersistentState<YesNo>(PERSIST_PREFIX + 'hairVisible', '');
  const [brandId, setBrandId] = usePersistentState<string>(FACE_PREFIX + 'brand', '*');
  const [applicationId, setApplicationId] = usePersistentState<string>(FACE_PREFIX + 'application', '*');
  const [pdMm, setPdMm] = usePersistentState<number | null>(FACE_PREFIX + 'pdMm', null);

  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = usePersistentState<AnalyzeResult | null>(PERSIST_PREFIX + 'result', null);
  const [plain, setPlain] = usePersistentState<CatalogResult | null>(PERSIST_PREFIX + 'catalog', null);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [look, setLook] = usePersistentState<Record<string, string>>(PERSIST_PREFIX + 'look', {});
  const tryon = useTryOn(file, getEndpoint);

  const views = useMemo(() => (file ? { front: file, ...sides } : {}), [file, sides]);
  const face = useFaceArchitecture(file, getEndpoint);
  const head = useFaceHead(views, getEndpoint);
  const [panel, setPanel] = usePersistentState<Panel>(PERSIST_PREFIX + 'panel', 'colour');
  const [stage, setStage] = useState<Stage>('2d');
  const [selected, setSelected] = useState<string | null>(null);

  const choosePhoto = (f: File | null) => {
    setFile(f);
    void saveBlob(PHOTO_KEY, f);
  };

  // Restore the saved photo, unless one was taken while it loaded. Once it
  // is in place, re-render the saved look on it.
  const restoredPhoto = useRef<File | null>(null);
  useEffect(() => {
    let cancelled = false;
    loadBlob<File>(PHOTO_KEY).then((saved) => {
      if (cancelled || !saved) return;
      restoredPhoto.current = saved;
      setFile((current) => current ?? saved);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  const { request: requestTryOn } = tryon;
  useEffect(() => {
    if (!file || file !== restoredPhoto.current) return;
    restoredPhoto.current = null;
    const shadeIds = Object.values(look);
    if (shadeIds.length > 0) requestTryOn(shadeIds);
    // Only when the restored photo lands; later look changes request on pick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, requestTryOn]);

  useEffect(
    () => () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl);
    },
    [photoUrl],
  );

  const step: Step = !file ? 'capture' : result || plain ? 'result' : 'questions';
  const catalog = useMemo(() => (result ? catalogOf(result) : plain?.catalog ?? {}), [result, plain]);
  // Brand filter over the try-on catalog ('' = every brand). Products whose
  // brand reference-service does not know stay under "Semua brand" only.
  const productBrands = useProductBrands();
  const [brandFilter, setBrandFilter] = usePersistentState<string>(PERSIST_PREFIX + 'brandFilter', '');
  const catalogBrands = useMemo(
    () => brandsInCatalog(catalog, productBrands.brands, productBrands.brandOf),
    [catalog, productBrands],
  );
  const activeBrand = catalogBrands.some((b) => b.id === brandFilter) ? brandFilter : '';
  const shownCatalog = useMemo(
    () => filterCatalog(catalog, activeBrand, productBrands.brandOf),
    [catalog, activeBrand, productBrands],
  );

  const drawn = useMemo<DrawnMeasurement[]>(() => {
    const r = face.result;
    if (!r) return [];
    return r.measurements.flatMap((m) => {
      const geometry = measurementGeometry(m, r.landmarks);
      return geometry ? [{ m, geometry }] : [];
    });
  }, [face.result]);
  const drawableKeys = useMemo(() => new Set(drawn.map((d) => d.m.key)), [drawn]);
  const scale = face.result ? physicalScale(face.result, pdMm) : null;

  const reset = () => {
    choosePhoto(null);
    setSides({});
    setResult(null);
    setPlain(null);
    setError(null);
    setLook({});
    setHijab('');
    setHairVisible('');
    setSelected(null);
    setStage('2d');
  };

  // A side photo added or changed on the result page refits the head with it.
  const sidesChanged = useRef(false);
  const changeSide = (side: Side, f: File | null) => {
    sidesChanged.current = true;
    setSides((s) => ({ ...s, [side]: f ?? undefined }));
  };
  const { build: buildHead } = head;
  useEffect(() => {
    if (!sidesChanged.current) return;
    sidesChanged.current = false;
    if (step === 'result') void buildHead(brandId, applicationId);
    // buildHead changes when the photos do; that is the trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildHead]);

  const analyzeFace = () => {
    void face.analyze(brandId, applicationId);
    void head.build(brandId, applicationId);
  };

  const analyze = async () => {
    if (!file || hijab === '' || hairVisible === '') return;
    analyzeFace();
    setAnalyzing(true);
    setError(null);
    try {
      setResult(await analyzeColour(getEndpoint, { image: file, hijab: hijab === 'yes', hairVisible: hairVisible === 'yes' }));
    } catch (e: unknown) {
      const err = e as Partial<ApiError>;
      setError({ status: err.status ?? 0, code: err.code ?? '', message: err.message ?? String(e) });
    } finally {
      setAnalyzing(false);
    }
  };

  const tryWithoutAnalysis = async () => {
    setLoadingCatalog(true);
    setError(null);
    try {
      setPlain(await fetchColourCatalog(getEndpoint));
    } catch (e: unknown) {
      const err = e as Partial<ApiError>;
      setError({ status: err.status ?? 0, code: err.code ?? '', message: err.message ?? String(e) });
    } finally {
      setLoadingCatalog(false);
    }
  };

  const pick = (category: string, shadeId: string | null) => {
    const next = { ...look };
    if (shadeId) next[category] = shadeId;
    else delete next[category];
    setLook(next);
    tryon.request(Object.values(next));
  };

  const clearLook = () => {
    setLook({});
    tryon.request([]);
  };

  return (
    <div className="flex-1 min-w-0 overflow-auto bg-muted/30">
      <div className="mx-auto w-full max-w-6xl p-4 sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-primary">Personal Colour &amp; Face Analysis</div>
            <h1 className="text-lg font-bold text-foreground">Kenali warna dan bentuk wajahmu</h1>
          </div>
          <Stepper step={step} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-5 items-start">
          {/* Left: photo, 2D or 3D */}
          <div className="rounded-2xl border border-border bg-card p-3 shadow-xs lg:sticky lg:top-4">
            {step === 'capture' && <CameraCapture onPhoto={choosePhoto} />}
            {step !== 'capture' && photoUrl && (
              <div className="flex flex-col gap-3">
                <PhotoStage
                  photoUrl={photoUrl}
                  stage={stage}
                  onStage={setStage}
                  panel={panel}
                  tryOnUrl={tryon.url}
                  tryOnLoading={tryon.loading}
                  face={face.result}
                  drawn={drawn}
                  selected={selected}
                  onSelect={setSelected}
                  mmPerIod={scale?.mmPerIod ?? null}
                  head={head}
                  canShow3d={step === 'result'}
                />
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" leftIcon={<RotateCcw className="h-3.5 w-3.5" />} onClick={reset}>
                    Foto ulang
                  </Button>
                  {step === 'result' && panel === 'colour' && stage === '2d' && (
                    <>
                      <Button variant="outline" size="sm" leftIcon={<Undo2 className="h-3.5 w-3.5" />} onClick={clearLook} disabled={!Object.keys(look).length}>
                        Hapus semua
                      </Button>
                      <a
                        href={tryon.url ?? undefined}
                        download="coba-makeup.png"
                        aria-disabled={!tryon.url}
                        className={cn(
                          'ml-auto inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-bold text-primary-foreground transition hover:bg-primary/90',
                          !tryon.url && 'pointer-events-none opacity-50',
                        )}
                      >
                        <Download className="h-3.5 w-3.5" />
                        Simpan foto
                      </a>
                    </>
                  )}
                </div>
                {tryon.error && <p className="text-xs text-destructive">{errorText(tryon.error)}</p>}
                <SideShots sides={sides} onChange={changeSide} disabled={head.loading} />
              </div>
            )}
          </div>

          {/* Right: questions, or the Warna / Wajah panels */}
          <div className="flex flex-col gap-4 min-w-0">
            {step === 'capture' && (
              <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3 text-sm">
                <p className="font-bold text-foreground">Cara kerjanya</p>
                <ol className="list-decimal pl-5 space-y-1.5 text-muted-foreground text-xs">
                  <li>Ambil atau unggah foto wajah.</li>
                  <li>Jawab dua pertanyaan singkat. Sekali analisis untuk warna, bentuk wajah, dan kepala 3D.</li>
                  <li>Lihat hasil warna dan coba makeup, atau pindah ke hasil wajah. Foto bisa dilihat dalam 2D atau 3D.</li>
                </ol>
              </div>
            )}

            {step === 'questions' && (
              <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sebelum analisis</div>
                <YesNoField label="Memakai hijab atau penutup kepala?" value={hijab} onChange={setHijab} />
                <YesNoField label="Rambut terlihat di foto?" value={hairVisible} onChange={setHairVisible} />
                <details className="text-xs">
                  <summary className="cursor-pointer select-none text-[11px] text-muted-foreground">Scope profil bentuk wajah</summary>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    <BrandSelect value={brandId} onChange={setBrandId} includeUniversal label="Brand" />
                    <ApplicationSelect value={applicationId} onChange={setApplicationId} includeUniversal label="Aplikasi" />
                  </div>
                </details>
                <Button
                  size="lg"
                  className="w-full"
                  isLoading={analyzing}
                  disabled={hijab === '' || hairVisible === ''}
                  leftIcon={<Sparkles className="h-4 w-4" />}
                  onClick={analyze}
                >
                  {analyzing ? 'Menganalisis…' : 'Analisis'}
                </Button>
                {(hijab === '' || hairVisible === '') && <p className="text-[11px] text-muted-foreground">Jawab kedua pertanyaan untuk melanjutkan.</p>}
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="h-px flex-1 bg-border" />
                  atau
                  <span className="h-px flex-1 bg-border" />
                </div>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full"
                  isLoading={loadingCatalog}
                  disabled={analyzing}
                  leftIcon={<Palette className="h-4 w-4" />}
                  onClick={tryWithoutAnalysis}
                >
                  Langsung coba makeup
                </Button>
                <p className="text-[11px] text-muted-foreground">Tanpa analisis, semua shade tetap bisa dicoba, hanya belum ditandai mana yang cocok.</p>
                {error && (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">{errorText(error)}</div>
                )}
              </div>
            )}

            {step === 'result' && (
              <>
                <PanelSwitch panel={panel} onPanel={setPanel} faceBusy={face.loading} />

                {panel === 'colour' && (
                  <>
                    {result ? (
                      <AnalysisCard result={result} />
                    ) : (
                      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0 space-y-0.5">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Analisis warna</div>
                          <p className="text-xs text-muted-foreground">Belum dijalankan. Analisis untuk menandai shade yang cocok untukmu.</p>
                        </div>
                        <Button size="sm" leftIcon={<Sparkles className="h-3.5 w-3.5" />} onClick={() => setPlain(null)}>
                          Analisis warna
                        </Button>
                      </div>
                    )}
                    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs">
                      {catalogBrands.length > 1 && (
                        <BrandFilter brands={catalogBrands} value={activeBrand} onChange={setBrandFilter} />
                      )}
                      <ProductPicker catalog={shownCatalog} look={look} onPick={pick} analyzed={!!result} />
                    </div>
                  </>
                )}

                {panel === 'face' && (
                  <FacePanel
                    result={face.result}
                    loading={face.loading}
                    error={face.error}
                    drawableKeys={drawableKeys}
                    selected={selected}
                    onSelect={setSelected}
                    scale={scale}
                    pdMm={pdMm}
                    onPdChange={setPdMm}
                    onAnalyze={analyzeFace}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BrandFilter({ brands, value, onChange }: { brands: BrandCount[]; value: string; onChange: (id: string) => void }) {
  const options = [{ id: '', name: 'Semua brand', products: brands.reduce((n, b) => n + b.products, 0) }, ...brands];
  return (
    <div className="mb-4 space-y-1.5">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Brand</div>
      <div role="radiogroup" aria-label="Brand" className="flex flex-wrap gap-1.5">
        {options.map((b) => (
          <button
            key={b.id || 'all'}
            type="button"
            role="radio"
            aria-checked={value === b.id}
            onClick={() => onChange(b.id)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-semibold transition cursor-pointer',
              value === b.id
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-muted-foreground hover:text-foreground',
            )}
          >
            {b.name}
            <span className={cn('ml-1 font-normal', value === b.id ? 'opacity-80' : 'text-muted-foreground')}>({b.products})</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function PanelSwitch({ panel, onPanel, faceBusy }: { panel: Panel; onPanel: (p: Panel) => void; faceBusy: boolean }) {
  return (
    <div role="tablist" aria-label="Hasil" className="flex w-fit gap-1 rounded-xl border border-border bg-secondary/50 p-1">
      {(
        [
          ['colour', 'Analisis warna', Palette],
          ['face', 'Analisis wajah', ScanFace],
        ] as const
      ).map(([key, label, Icon]) => (
        <button
          key={key}
          type="button"
          role="tab"
          aria-selected={panel === key}
          onClick={() => onPanel(key)}
          className={cn(
            'flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer',
            panel === key ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
          {key === 'face' && faceBusy && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />}
        </button>
      ))}
    </div>
  );
}

function Stepper({ step }: { step: Step }) {
  const steps: [Step, string][] = [
    ['capture', 'Foto'],
    ['questions', 'Analisis'],
    ['result', 'Hasil'],
  ];
  const at = steps.findIndex(([s]) => s === step);
  return (
    <ol className="flex items-center gap-2 text-[11px] font-semibold">
      {steps.map(([s, label], i) => (
        <li key={s} className="flex items-center gap-2">
          <span
            className={cn(
              'h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold border',
              i <= at ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border',
            )}
          >
            {i + 1}
          </span>
          <span className={i === at ? 'text-foreground' : 'text-muted-foreground'}>{label}</span>
          {i < steps.length - 1 && <span className="w-4 h-px bg-border" />}
        </li>
      ))}
    </ol>
  );
}
