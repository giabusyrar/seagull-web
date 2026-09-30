'use client';

import React, { useMemo, useState } from 'react';
import { AlertTriangle, Eye, Fingerprint, Gauge, Info, X } from 'lucide-react';
import { cn, usePersistentState } from '@gateway-experience/shared';
import { GUIDANCE_STROKE, GuidanceLegend, GuidanceOverlay } from './GuidanceOverlay';
import { MeasurementLayer, MeasurementLegend, type DrawnMeasurement } from './MeasurementOverlay';
import {
  ClassificationRow,
  GuidanceDetail,
  ProvenanceDetail,
  QualityDetail,
  RegionsDetail,
  TraitRow,
} from './ResultRows';
import { buildPins, regionConfidence, type FaceArchitectureResult, type Pin, type PinKind } from './faceTypes';

// Pin colours per kind. Guidance pins take their polygon's confidence colour
// instead, so a pin never looks more certain than the area it labels.
const PIN_COLOUR: Record<Exclude<PinKind, 'guidance'>, string> = {
  classification: '#0f766e',
  trait: '#7c3aed',
};

const PIN_KIND_LABEL: Record<PinKind, string> = {
  classification: 'Klasifikasi',
  trait: 'Trait',
  guidance: 'Panduan makeup',
};

type Hud = 'quality' | 'regions' | 'provenance' | 'unplaced';

interface Props {
  photoUrl: string;
  result: FaceArchitectureResult | null;
  drawn: DrawnMeasurement[];
  selectedMeasurement: string | null;
  onSelectMeasurement: (key: string) => void;
  verifiedOnly: boolean;
  onVerifiedOnlyChange: (v: boolean) => void;
}

/**
 * Everything the face-architecture engine returned, on the photo itself:
 * measurements as lines/angles/points with their values (always shown),
 * guidance as polygons, and every classification, trait and guidance area
 * as a numbered information mark that opens its details. Results with no
 * place on the face (quality, region visibility, provenance) sit as chips on
 * the photo's edges. A result the engine gave no location for is listed
 * under "Belum bisa ditempatkan" rather than pinned somewhere plausible.
 */
export function FaceResultView({
  photoUrl,
  result,
  drawn,
  selectedMeasurement,
  onSelectMeasurement,
  verifiedOnly,
  onVerifiedOnlyChange,
}: Props) {
  const [showLabels, setShowLabels] = usePersistentState('xg.faceArchitect.pinLabels', false);
  const [openPin, setOpenPin] = useState<string | null>(null);
  const [openHud, setOpenHud] = useState<Hud | null>(null);

  const pins = useMemo(() => (result ? buildPins(result) : []), [result]);
  const placed = pins.filter((p) => p.anchor && (!verifiedOnly || p.kind !== 'guidance' || isVerifiedGuidance(result, p)));
  const unplaced = pins.filter((p) => !p.anchor);
  const numberOf = new Map(pins.map((p, i) => [p.id, i + 1]));
  const openPinObj = pins.find((p) => p.id === openPin) ?? null;

  const toggleHud = (h: Hud) => {
    setOpenPin(null);
    setOpenHud((prev) => (prev === h ? null : h));
  };
  const togglePin = (id: string) => {
    setOpenHud(null);
    setOpenPin((prev) => (prev === id ? null : id));
  };

  const cal = result?.provenance.calibration;
  const occluded = result ? Object.values(result.regions).filter((v) => v !== 'observed').length : 0;

  return (
    <div className="space-y-2">
      <GuidanceOverlay
        photoUrl={photoUrl}
        regions={result?.guidance?.regions ?? []}
        verifiedOnly={verifiedOnly}
        renderLayer={(size) =>
          drawn.length > 0 ? (
            <MeasurementLayer
              items={drawn}
              selectedKey={selectedMeasurement}
              size={size}
              showNames={showLabels}
              onSelect={onSelectMeasurement}
              pinAnchors={placed.map((p) => p.anchor!)}
            />
          ) : null
        }
        renderOverlay={(size) =>
          result && (
            <>
              {cal && cal.status !== 'calibrated' && (
                <div className="absolute inset-x-2 top-2 z-20 flex items-start gap-1.5 rounded-lg bg-warning/90 px-2 py-1 text-[11px] font-semibold text-black shadow">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Profil belum terkalibrasi ({cal.status}): interpretasi profil, bukan vonis bentuk wajah.
                </div>
              )}

              {placed.map((p) => (
                <PinMark
                  key={p.id}
                  pin={p}
                  number={numberOf.get(p.id)!}
                  colour={pinColour(result, p)}
                  left={(p.anchor![0] / size.w) * 100}
                  top={(p.anchor![1] / size.h) * 100}
                  showLabel={showLabels}
                  open={openPin === p.id}
                  onToggle={() => togglePin(p.id)}
                />
              ))}

              {openPinObj?.anchor && (
                <Popover
                  left={(openPinObj.anchor[0] / size.w) * 100}
                  top={(openPinObj.anchor[1] / size.h) * 100}
                  title={`${numberOf.get(openPinObj.id)}. ${PIN_KIND_LABEL[openPinObj.kind]}`}
                  onClose={() => setOpenPin(null)}
                >
                  <PinDetail result={result} pin={openPinObj} />
                </Popover>
              )}

              <div className="absolute inset-x-2 bottom-2 z-20 flex flex-wrap items-end gap-1.5">
                <HudChip icon={<Gauge className="h-3 w-3" />} active={openHud === 'quality'} onClick={() => toggleHud('quality')}>
                  Kualitas{result.quality.warnings.length > 0 ? ` · ${result.quality.warnings.length} peringatan` : ''}
                </HudChip>
                <HudChip
                  icon={<Eye className="h-3 w-3" />}
                  active={openHud === 'regions'}
                  tone={occluded > 0 ? 'warning' : undefined}
                  onClick={() => toggleHud('regions')}
                >
                  Area{occluded > 0 ? ` · ${occluded} tidak terlihat` : ''}
                </HudChip>
                <HudChip icon={<Fingerprint className="h-3 w-3" />} active={openHud === 'provenance'} onClick={() => toggleHud('provenance')}>
                  Asal data
                </HudChip>
                {(unplaced.length > 0 || (result.guidance?.droppedTemplates.length ?? 0) > 0) && (
                  <HudChip
                    icon={<Info className="h-3 w-3" />}
                    active={openHud === 'unplaced'}
                    tone="warning"
                    onClick={() => toggleHud('unplaced')}
                  >
                    Belum bisa ditempatkan · {unplaced.length + (result.guidance?.droppedTemplates.length ?? 0)}
                  </HudChip>
                )}
              </div>

              {openHud && (
                <div className="absolute inset-x-2 bottom-11 z-30 max-h-[60%] overflow-auto rounded-lg border border-border bg-card/95 p-3 shadow-lg backdrop-blur">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{HUD_TITLE[openHud]}</span>
                    <CloseButton onClick={() => setOpenHud(null)} />
                  </div>
                  {openHud === 'quality' && <QualityDetail result={result} />}
                  {openHud === 'regions' && <RegionsDetail result={result} />}
                  {openHud === 'provenance' && <ProvenanceDetail result={result} />}
                  {openHud === 'unplaced' && <UnplacedDetail result={result} pins={unplaced} numberOf={numberOf} />}
                </div>
              )}
            </>
          )
        }
      />

      {result && (
        <div className="space-y-1.5">
          <GuidanceLegend regions={result.guidance?.regions ?? []}>
            {drawn.length > 0 && <MeasurementLegend />}
            <LegendDot colour={PIN_COLOUR.classification} label="Klasifikasi" />
            <LegendDot colour={PIN_COLOUR.trait} label="Trait" />
          </GuidanceLegend>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={showLabels} onChange={(e) => setShowLabels(e.target.checked)} />
              Tampilkan nama di setiap penanda dan pengukuran
            </label>
            {result.guidance?.regions?.length ? (
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={verifiedOnly} onChange={(e) => onVerifiedOnlyChange(e.target.checked)} />
                Sembunyikan penempatan yang belum terkonfirmasi
              </label>
            ) : null}
          </div>
          {!result.landmarks && result.measurements.some((m) => m.value !== null) && (
            <p className="text-[11px] text-muted-foreground">
              Engine belum mengirim koordinat landmark, jadi garis pengukuran dan penanda trait/klasifikasi belum bisa ditaruh di
              foto. Nilainya ada di detail teks.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

const HUD_TITLE: Record<Hud, string> = {
  quality: 'Kualitas foto',
  regions: 'Visibilitas area',
  provenance: 'Asal data',
  unplaced: 'Belum bisa ditempatkan di foto',
};

function isVerifiedGuidance(result: FaceArchitectureResult | null, p: Pin): boolean {
  const r = result?.guidance?.regions[Number(p.id.split(':')[1])];
  return !!r && regionConfidence(r) === 'verified';
}

function pinColour(result: FaceArchitectureResult, p: Pin): string {
  if (p.kind !== 'guidance') return PIN_COLOUR[p.kind];
  const r = result.guidance?.regions[Number(p.id.split(':')[1])];
  return r ? GUIDANCE_STROKE[regionConfidence(r)].colour : GUIDANCE_STROKE.unsourced.colour;
}

function PinMark({
  pin,
  number,
  colour,
  left,
  top,
  showLabel,
  open,
  onToggle,
}: {
  pin: Pin;
  number: number;
  colour: string;
  left: number;
  top: number;
  showLabel: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      title={pin.label}
      className={cn(
        'absolute z-10 flex -translate-x-1/2 translate-y-1 items-center gap-1 rounded-full border-2 border-white text-[10px] font-bold text-white shadow transition-transform hover:scale-110',
        open && 'scale-110 ring-2 ring-white',
      )}
      style={{ left: `${left}%`, top: `${top}%`, backgroundColor: colour }}
    >
      <span className="flex h-5 min-w-5 items-center justify-center px-1">{number}</span>
      {showLabel && <span className="max-w-40 truncate pr-2 font-semibold">{pin.label}</span>}
    </button>
  );
}

function Popover({
  left,
  top,
  title,
  onClose,
  children,
}: {
  left: number;
  top: number;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  // Open away from the nearer edges so the card stays on the photo.
  const alignRight = left > 50;
  const alignUp = top > 55;
  return (
    <div
      className="absolute z-20 w-64 max-w-[80%] rounded-lg border border-border bg-card/95 p-3 shadow-lg backdrop-blur"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        transform: `translate(${alignRight ? 'calc(-100% - 14px)' : '14px'}, ${alignUp ? 'calc(-100% + 10px)' : '-10px'})`,
      }}
    >
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{title}</span>
        <CloseButton onClick={onClose} />
      </div>
      {children}
    </div>
  );
}

function PinDetail({ result, pin }: { result: FaceArchitectureResult; pin: Pin }) {
  const key = pin.id.slice(pin.id.indexOf(':') + 1);
  if (pin.kind === 'classification') return <ClassificationRow name={key} c={result.classifications[key]} />;
  if (pin.kind === 'trait') return <TraitRow name={key} t={result.traits[key]} />;
  const r = result.guidance?.regions[Number(key)];
  return r ? <GuidanceDetail r={r} /> : null;
}

function UnplacedDetail({
  result,
  pins,
  numberOf,
}: {
  result: FaceArchitectureResult;
  pins: Pin[];
  numberOf: Map<string, number>;
}) {
  const dropped = result.guidance?.droppedTemplates ?? [];
  return (
    <div className="space-y-2">
      {pins.length > 0 && (
        <p className="text-[11px] text-muted-foreground">
          Engine tidak menyebut pengukuran/landmark untuk hasil ini, jadi tidak ada posisi di wajah yang bisa dipertanggungjawabkan.
        </p>
      )}
      {pins.map((p) => (
        <div key={p.id}>
          <div className="text-[10px] font-bold text-muted-foreground">
            {numberOf.get(p.id)}. {PIN_KIND_LABEL[p.kind]}
          </div>
          <PinDetail result={result} pin={p} />
        </div>
      ))}
      {dropped.length > 0 && (
        <div>
          <div className="text-[10px] font-bold text-muted-foreground">Panduan yang tidak bisa ditempatkan engine</div>
          <ul className="mt-0.5 space-y-0.5 text-[11px] text-muted-foreground">
            {dropped.map((d, i) => (
              <li key={`${d.template}-${i}`}>
                {d.template}: {d.reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function HudChip({
  icon,
  active,
  tone,
  onClick,
  children,
}: {
  icon: React.ReactNode;
  active: boolean;
  tone?: 'warning';
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={active}
      className={cn(
        'flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold shadow backdrop-blur',
        tone === 'warning' ? 'border-warning/60 bg-warning/85 text-black' : 'border-border bg-card/85 text-foreground',
        active && 'ring-2 ring-primary',
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label="Tutup" className="rounded p-0.5 text-muted-foreground hover:bg-muted">
      <X className="h-3.5 w-3.5" />
    </button>
  );
}

function LegendDot({ colour, label }: { colour: string; label: string }) {
  return (
    <li className="flex items-center gap-1.5">
      <span className="inline-block h-3 w-3 rounded-full border-2 border-white shadow" style={{ backgroundColor: colour }} />
      {label}
    </li>
  );
}
