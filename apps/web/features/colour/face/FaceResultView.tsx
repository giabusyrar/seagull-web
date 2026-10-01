'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronLeft, ChevronRight, Info, MapPinOff, X } from 'lucide-react';
import { cn, usePersistentState } from '@gateway-experience/shared';
import { GUIDANCE_STROKE, GuidanceLegend, GuidanceOverlay, focusTransform, type FocusBox } from './GuidanceOverlay';
import { MeasurementLayer, MeasurementLegend, type DrawnMeasurement } from './MeasurementOverlay';
import {
  ClassificationRow,
  GuidanceDetail,
  ProvenanceDetail,
  QualityDetail,
  RegionsDetail,
  TraitRow,
} from './ResultRows';
import {
  CLASSIFICATION_STATUS_LABEL,
  REGION_CONFIDENCE_LABEL,
  TRAIT_STATUS_LABEL,
  buildPins,
  regionConfidence,
  type FaceArchitectureResult,
  type Measurement,
  type Pin,
  type PinKind,
} from './faceTypes';
import { friendlyValue, measurementName } from './measurementCopy';
import { IRIS_DIAMETER_MM, physicalScale, type PhysicalScale } from './physicalScale';

// Pin colours per kind. Guidance pins take their polygon's confidence colour
// instead, so a pin never looks more certain than the area it labels.
const PIN_COLOUR: Record<Exclude<PinKind, 'guidance'>, string> = {
  classification: '#0f766e',
  trait: '#7c3aed',
};

type View = 'results' | 'measure' | 'guidance' | 'head';
type MeasureMode = 'single' | 'all';

const VIEW_LABEL: Record<View, string> = {
  results: 'Hasil',
  measure: 'Pengukuran',
  guidance: 'Panduan makeup',
  head: '3D',
};

interface Props {
  photoUrl: string;
  result: FaceArchitectureResult | null;
  drawn: DrawnMeasurement[];
  selectedMeasurement: string | null;
  onSelectMeasurement: (key: string | null) => void;
  verifiedOnly: boolean;
  onVerifiedOnlyChange: (v: boolean) => void;
  /** The 3D head panel, mounted only while the 3D view is open (it builds on demand). */
  renderHead?: () => React.ReactNode;
}

/**
 * The face-architecture result, one view at a time so the photo never
 * carries everything at once:
 *
 * - Hasil: the photo clean, classifications and traits as a list under it.
 *   Picking one marks where on the face it was read from; one the engine
 *   gave no location for says so instead of being pinned somewhere plausible.
 * - Pengukuran: one measurement at a time with previous/next, the photo
 *   zoomed onto it, or all of them at once, each named and valued in plain
 *   words (measurementCopy); lengths in millimetres from physicalScale.
 * - Panduan makeup: the guidance polygons, drawn per confidence.
 * - 3D: the fitted head (HeadPanel), in place of the photo.
 *
 * Quality, region visibility and provenance sit behind one "Info analisa"
 * button. The uncalibrated-profile warning stays above the photo, always.
 */
export function FaceResultView({
  photoUrl,
  result,
  drawn,
  selectedMeasurement,
  onSelectMeasurement,
  verifiedOnly,
  onVerifiedOnlyChange,
  renderHead,
}: Props) {
  const [view, setView] = usePersistentState<View>('xg.faceArchitect.view', 'results');
  const [measureMode, setMeasureMode] = usePersistentState<MeasureMode>('xg.faceArchitect.measureMode', 'single');
  const [pdMm, setPdMm] = usePersistentState<number | null>('xg.faceArchitect.pdMm', null);
  const [selectedPin, setSelectedPin] = useState<string | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);

  const pins = useMemo(() => (result ? buildPins(result) : []), [result]);
  const regions = result?.guidance?.regions ?? [];
  const resultPins = pins.filter((p) => p.kind !== 'guidance');
  const guidancePins = pins.filter((p) => p.kind === 'guidance' && (!verifiedOnly || isVerifiedGuidance(result, p)));

  const views: View[] = ['results', ...(drawn.length > 0 ? (['measure'] as const) : []), ...(regions.length > 0 ? (['guidance'] as const) : []), ...(renderHead ? (['head'] as const) : [])];
  const activeView: View = views.includes(view) ? view : 'results';

  // Picking a measurement in the text card shows it where it is drawn.
  useEffect(() => {
    if (selectedMeasurement) setView('measure');
  }, [selectedMeasurement, setView]);

  const catalogue = result?.provenance.catalogueVersion ?? '';
  const scale = result ? physicalScale(result, pdMm) : null;
  const mmPerIod = scale?.mmPerIod ?? null;
  // One at a time always shows one: the picked measurement, else the first.
  const shownMeasurement =
    measureMode === 'single' ? (drawn.find((d) => d.m.key === selectedMeasurement) ?? drawn[0] ?? null) : null;
  const stepIndex = shownMeasurement ? drawn.indexOf(shownMeasurement) : -1;
  const focus = activeView === 'measure' && shownMeasurement ? boundsOf(shownMeasurement.geometry.points) : null;
  const step = (delta: number) => {
    if (drawn.length === 0) return;
    onSelectMeasurement(drawn[(stepIndex + delta + drawn.length) % drawn.length].m.key);
  };
  // In "Semua" each label carries the number of its row in the list below, so
  // a short pill on the photo still says which measurement it is.
  const numberOf = new Map(drawn.map((d, i) => [d.m.key, i + 1]));
  const measurementLabel = (m: Measurement, selected: boolean) => {
    const v = friendlyValue(m, catalogue, mmPerIod)?.short ?? '';
    if (measureMode === 'single') return `${measurementName(m, catalogue)}: ${v}`;
    return selected ? `${numberOf.get(m.key)}. ${measurementName(m, catalogue)}: ${v}` : `${numberOf.get(m.key)}  ${v}`;
  };

  const switchView = (v: View) => {
    setSelectedPin(null);
    setView(v);
  };
  const togglePin = (id: string) => setSelectedPin((prev) => (prev === id ? null : id));

  const cal = result?.provenance.calibration;
  const occluded = result ? Object.values(result.regions).filter((v) => v !== 'observed').length : 0;
  const dropped = result?.guidance?.droppedTemplates ?? [];
  const notes = (result?.quality.warnings.length ?? 0) + occluded + dropped.length;
  const shownPin = pins.find((p) => p.id === selectedPin && p.anchor) ?? null;

  return (
    <div className="space-y-2">
      {cal && cal.status !== 'calibrated' && (
        <div className="flex items-start gap-1.5 rounded-lg border border-warning/40 bg-warning/10 px-2.5 py-1.5 text-[11px] text-foreground">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
          <span>
            <span className="font-semibold">Profil belum terkalibrasi ({cal.status}).</span> Hasil ini interpretasi profil, bukan
            vonis bentuk wajah.
          </span>
        </div>
      )}

      {result && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div role="tablist" aria-label="Tampilan" className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5">
            {views.map((v) => (
              <button
                key={v}
                type="button"
                role="tab"
                aria-selected={activeView === v}
                onClick={() => switchView(v)}
                className={cn(
                  'rounded-md px-3 py-1 text-xs font-semibold transition-colors',
                  activeView === v ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {VIEW_LABEL[v]}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setInfoOpen((o) => !o)}
            aria-expanded={infoOpen}
            className={cn(
              'flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold',
              notes > 0 ? 'border-warning/60 bg-warning/10 text-foreground' : 'border-border bg-card text-muted-foreground',
            )}
          >
            <Info className="h-3.5 w-3.5" />
            Info analisa{notes > 0 ? ` · ${notes} catatan` : ''}
          </button>
        </div>
      )}

      {result && infoOpen && <InfoPanel result={result} onClose={() => setInfoOpen(false)} />}

      {activeView === 'head' && renderHead ? (
        renderHead()
      ) : (
        <GuidanceOverlay
          photoUrl={photoUrl}
          regions={activeView === 'guidance' ? regions : []}
          verifiedOnly={verifiedOnly}
          focus={focus}
          renderLayer={(size) =>
            activeView === 'measure' && drawn.length > 0 ? (
              <MeasurementLayer
                items={shownMeasurement ? [shownMeasurement] : drawn}
                selectedKey={shownMeasurement?.m.key ?? selectedMeasurement}
                size={size}
                showAll={measureMode === 'all'}
                onSelect={(key) => onSelectMeasurement(measureMode === 'all' && key === selectedMeasurement ? null : key)}
                labelOf={measurementLabel}
                zoom={focus ? focusTransform(focus, size).scale : 1}
                view={focus ? visibleBox(focus, size) : undefined}
              />
            ) : null
          }
          renderOverlay={(size) =>
            result &&
            shownPin && (
              <PinMark
                label={shownPin.label}
                colour={pinColour(result, shownPin)}
                left={(shownPin.anchor![0] / size.w) * 100}
                top={(shownPin.anchor![1] / size.h) * 100}
              />
            )
          }
        />
      )}

      {result && activeView === 'results' && (
        <div className="space-y-1.5">
          <p className="text-[11px] text-muted-foreground">Pilih hasil untuk melihat detail dan posisinya di wajah.</p>
          <ul className="divide-y divide-border/60 rounded-lg border border-border bg-card">
            {resultPins.map((p) => (
              <ResultItem
                key={p.id}
                pin={p}
                colour={pinColour(result, p)}
                value={pinValue(result, p)}
                alt={pinAlternative(result, p)}
                open={selectedPin === p.id}
                onToggle={() => togglePin(p.id)}
              >
                <PinDetail result={result} pin={p} />
              </ResultItem>
            ))}
            {resultPins.length === 0 && <li className="px-3 py-2 text-[11px] text-muted-foreground">Profil ini tidak punya hasil.</li>}
          </ul>
        </div>
      )}

      {result && activeView === 'measure' && (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div role="radiogroup" aria-label="Tampilkan pengukuran" className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5">
              {(['single', 'all'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  role="radio"
                  aria-checked={measureMode === mode}
                  onClick={() => setMeasureMode(mode)}
                  className={cn(
                    'rounded-md px-2.5 py-0.5 text-[11px] font-semibold',
                    measureMode === mode ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {mode === 'single' ? 'Satu per satu' : `Semua (${drawn.length})`}
                </button>
              ))}
            </div>
            <ul className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
              <MeasurementLegend />
            </ul>
          </div>

          {measureMode === 'single' && shownMeasurement && (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-2">
              <button type="button" onClick={() => step(-1)} aria-label="Sebelumnya" className="rounded p-1 hover:bg-muted">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="min-w-0 flex-1 text-center">
                <MeasurementSummary m={shownMeasurement.m} catalogue={catalogue} mmPerIod={mmPerIod} centred />
                <div className="mt-0.5 text-[10px] tabular-nums text-muted-foreground">
                  {stepIndex + 1} / {drawn.length}
                </div>
              </div>
              <button type="button" onClick={() => step(1)} aria-label="Berikutnya" className="rounded p-1 hover:bg-muted">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {measureMode === 'all' && (
            <ul className="divide-y divide-border/60 rounded-lg border border-border bg-card">
              {result.measurements.map((m) => {
                const drawable = drawn.some((d) => d.m.key === m.key);
                const selected = selectedMeasurement === m.key;
                return (
                  <li key={m.key}>
                    <button
                      type="button"
                      disabled={!drawable}
                      onClick={() => onSelectMeasurement(selected ? null : m.key)}
                      aria-pressed={selected}
                      className={cn('w-full px-3 py-1.5 text-left', drawable && 'hover:bg-muted/50', selected && 'bg-muted/60')}
                    >
                      <MeasurementSummary m={m} catalogue={catalogue} mmPerIod={mmPerIod} number={numberOf.get(m.key)} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <ScaleNote scale={scale} pdMm={pdMm} onPdChange={setPdMm} />
        </div>
      )}

      {result && activeView === 'guidance' && (
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
            <GuidanceLegend regions={regions} />
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={verifiedOnly} onChange={(e) => onVerifiedOnlyChange(e.target.checked)} />
              Sembunyikan yang belum terkonfirmasi
            </label>
          </div>
          <ul className="divide-y divide-border/60 rounded-lg border border-border bg-card">
            {guidancePins.map((p) => {
              const r = regions[Number(p.id.split(':')[1])];
              return (
                <ResultItem
                  key={p.id}
                  pin={p}
                  colour={pinColour(result, p)}
                  value={REGION_CONFIDENCE_LABEL[regionConfidence(r)]}
                  open={selectedPin === p.id}
                  onToggle={() => togglePin(p.id)}
                >
                  <GuidanceDetail r={r} />
                </ResultItem>
              );
            })}
          </ul>
        </div>
      )}

      {result && !result.landmarks && result.measurements.some((m) => m.value !== null) && (
        <p className="text-[11px] text-muted-foreground">
          Engine belum mengirim koordinat landmark, jadi pengukuran dan posisi hasil belum bisa ditandai di foto. Nilainya ada di
          detail teks.
        </p>
      )}
    </div>
  );
}

function isVerifiedGuidance(result: FaceArchitectureResult | null, p: Pin): boolean {
  const r = result?.guidance?.regions[Number(p.id.split(':')[1])];
  return !!r && regionConfidence(r) === 'verified';
}

function pinColour(result: FaceArchitectureResult, p: Pin): string {
  if (p.kind !== 'guidance') return PIN_COLOUR[p.kind];
  const r = result.guidance?.regions[Number(p.id.split(':')[1])];
  return r ? GUIDANCE_STROKE[regionConfidence(r)].colour : GUIDANCE_STROKE.unsourced.colour;
}

/** The result in words, for the collapsed row: what was read, or why nothing was. */
function pinValue(result: FaceArchitectureResult, p: Pin): string {
  const key = pinKey(p);
  if (p.kind === 'classification') {
    const c = result.classifications[key];
    if (c.status === 'single' || c.status === 'blend') return `${c.primary}${c.secondary ? ` + ${c.secondary}` : ''}`;
    return CLASSIFICATION_STATUS_LABEL[c.status] || c.status;
  }
  const t = result.traits[key];
  return t.label || TRAIT_STATUS_LABEL[t.status] || t.status;
}

/** The neighbouring label of a trait read near a category boundary. */
function pinAlternative(result: FaceArchitectureResult, p: Pin): string | undefined {
  if (p.kind !== 'trait') return undefined;
  const t = result.traits[pinKey(p)];
  return t.boundaryUncertain ? t.alternative : undefined;
}

function pinKey(p: Pin): string {
  return p.id.slice(p.id.indexOf(':') + 1);
}

function pinName(p: Pin): string {
  return p.kind === 'guidance' ? p.label : pinKey(p);
}

function ResultItem({
  pin,
  colour,
  value,
  alt,
  open,
  onToggle,
  children,
}: {
  pin: Pin;
  colour: string;
  value: string;
  alt?: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={cn('flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-muted/50', open && 'bg-muted/50')}
      >
        <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: colour }} />
        <span className="min-w-0 flex-1 truncate text-muted-foreground">{pinName(pin)}</span>
        <span className="shrink-0 font-semibold">
          {value}
          {alt && <span className="font-normal text-muted-foreground"> / {alt}?</span>}
        </span>
        {!pin.anchor && (
          <span title="Engine tidak memberi posisi di wajah untuk hasil ini">
            <MapPinOff className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          </span>
        )}
        <ChevronDown className={cn('h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="px-3 pb-2">
          {!pin.anchor && (
            <p className="text-[11px] text-muted-foreground">
              Tidak ditandai di foto: engine tidak menyebut pengukuran/landmark untuk hasil ini.
            </p>
          )}
          {children}
        </div>
      )}
    </li>
  );
}

function PinMark({ label, colour, left, top }: { label: string; colour: string; left: number; top: number }) {
  return (
    <div
      className="pointer-events-none absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full border-2 border-white py-0.5 pl-1 pr-2 text-[11px] font-semibold text-white shadow"
      style={{ left: `${left}%`, top: `${top}%`, backgroundColor: colour }}
    >
      <span className="h-2 w-2 rounded-full bg-white" />
      <span className="max-w-48 truncate">{label}</span>
    </div>
  );
}

function PinDetail({ result, pin }: { result: FaceArchitectureResult; pin: Pin }) {
  const key = pinKey(pin);
  if (pin.kind === 'classification') return <ClassificationRow name={key} c={result.classifications[key]} />;
  if (pin.kind === 'trait') return <TraitRow name={key} t={result.traits[key]} />;
  const r = result.guidance?.regions[Number(key)];
  return r ? <GuidanceDetail r={r} /> : null;
}

function InfoPanel({ result, onClose }: { result: FaceArchitectureResult; onClose: () => void }) {
  const dropped = result.guidance?.droppedTemplates ?? [];
  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-3 shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Info analisa</span>
        <button type="button" onClick={onClose} aria-label="Tutup" className="rounded p-0.5 text-muted-foreground hover:bg-muted">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <InfoSection title="Kualitas foto">
        <QualityDetail result={result} />
      </InfoSection>
      <InfoSection title="Visibilitas area">
        <RegionsDetail result={result} />
      </InfoSection>
      <InfoSection title="Asal data">
        <ProvenanceDetail result={result} />
      </InfoSection>
      {dropped.length > 0 && (
        <InfoSection title="Panduan yang tidak bisa ditempatkan">
          <ul className="space-y-0.5 text-[11px] text-muted-foreground">
            {dropped.map((d, i) => (
              <li key={`${d.template}-${i}`}>
                {d.template}: {d.reason}
              </li>
            ))}
          </ul>
        </InfoSection>
      )}
    </div>
  );
}

function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-0.5 text-[11px] font-semibold text-foreground">{title}</div>
      {children}
    </div>
  );
}

export function MeasurementSummary({
  m,
  catalogue,
  mmPerIod,
  centred,
  number,
}: {
  m: Measurement;
  catalogue: string;
  mmPerIod: number | null;
  centred?: boolean;
  /** Its number on the photo, when it is drawn there. */
  number?: number;
}) {
  const v = friendlyValue(m, catalogue, mmPerIod);
  return (
    <div className={cn('text-xs', centred ? 'space-y-0.5' : 'flex items-baseline justify-between gap-2')}>
      <div className={cn('min-w-0', centred ? 'font-semibold' : 'truncate text-muted-foreground')}>
        {!centred && (
          <span className="mr-1.5 inline-block w-4 text-right font-semibold tabular-nums text-foreground">{number ?? ''}</span>
        )}
        {measurementName(m, catalogue)}
        {m.proxy && <span className="ml-1 text-[10px] font-normal text-muted-foreground">(perkiraan)</span>}
      </div>
      <div className={cn(!centred && 'shrink-0 text-right')}>
        {v ? (
          <>
            <span className={cn(centred ? 'text-sm font-bold' : 'font-semibold')}>{v.long}</span>
            {v.band && <span className="ml-1 text-[10px] text-muted-foreground">(kisaran {v.band})</span>}
          </>
        ) : (
          <span className="text-muted-foreground">{m.reason || 'tidak tersedia'}</span>
        )}
      </div>
    </div>
  );
}

/** The part of the photo on screen when zoomed onto focus, in image pixels. */
export function visibleBox(focus: FocusBox, size: { w: number; h: number }): FocusBox {
  const t = focusTransform(focus, size);
  return { x: (-t.tx * size.w) / t.scale, y: (-t.ty * size.h) / t.scale, w: size.w / t.scale, h: size.h / t.scale };
}

export function boundsOf(points: [number, number][]): FocusBox {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
}

/** Where the millimetres come from, and the PD input that replaces the estimate. */
export function ScaleNote({
  scale,
  pdMm,
  onPdChange,
}: {
  scale: PhysicalScale | null;
  pdMm: number | null;
  onPdChange: (v: number | null) => void;
}) {
  const [draft, setDraft] = useState(pdMm !== null ? String(pdMm) : '');
  useEffect(() => setDraft(pdMm !== null ? String(pdMm) : ''), [pdMm]);
  const commit = () => {
    const v = Number(draft.replace(',', '.'));
    onPdChange(draft.trim() !== '' && Number.isFinite(v) && v > 0 ? v : null);
  };

  return (
    <div className="space-y-1.5 rounded-lg border border-border bg-muted/30 p-2 text-[11px] text-muted-foreground">
      <p>
        {scale?.source === 'pd' && (
          <>
            Ukuran mm dihitung dari <span className="font-semibold text-foreground">PD {pdMm} mm</span> yang kamu isi.
          </>
        )}
        {scale?.source === 'iris' && (
          <>
            Ukuran mm adalah <span className="font-semibold text-foreground">perkiraan</span> dari ukuran iris di foto (iris
            dewasa rata-rata {IRIS_DIAMETER_MM} mm), meleset sekitar ±{Math.round((scale.relativeSd ?? 0) * 100)}% per orang. Isi PD kamu
            untuk hasil lebih tepat.
          </>
        )}
        {!scale && <>Engine tidak mengirim titik iris, jadi ukuran belum bisa diubah ke mm. Isi PD kamu untuk melihatnya.</>}
      </p>
      <form
        className="flex flex-wrap items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          commit();
        }}
      >
        <label className="flex items-center gap-1.5">
          PD (jarak pupil, dari resep kacamata)
          <input
            type="number"
            inputMode="decimal"
            step="0.5"
            min="0"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            placeholder="mis. 62"
            className="w-20 rounded border border-border bg-card px-1.5 py-0.5 text-foreground"
          />
          mm
        </label>
        {pdMm !== null && (
          <button type="button" onClick={() => onPdChange(null)} className="underline hover:text-foreground">
            Hapus, pakai perkiraan iris
          </button>
        )}
      </form>
      <p>“×” = kali jarak antar mata. “Kisaran” = rentang ketidakpastian pengukuran.</p>
    </div>
  );
}
