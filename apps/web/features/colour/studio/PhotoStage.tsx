'use client';

import React, { useMemo, useState } from 'react';
import { AlertTriangle, Box, Image as ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@gateway-experience/shared';
import { BeforeAfter } from '../BeforeAfter';
import { GuidanceOverlay, focusTransform } from '../face/GuidanceOverlay';
import { MeasurementLayer, type DrawnMeasurement } from '../face/MeasurementOverlay';
import { boundsOf, visibleBox } from '../face/FaceResultView';
import { HeadReportSummary, ShadingControl } from '../face/HeadPanel';
import { HeadViewer, type HeadShading, type HeadStats } from '../face/HeadViewer';
import { headMarkers } from '../face/headMarkers';
import { headErrorText } from '../face/headTypes';
import { friendlyValue, measurementName } from '../face/measurementCopy';
import type { FaceArchitectureResult } from '../face/faceTypes';
import type { FaceApiError } from '../face/faceTypes';

export type Stage = '2d' | '3d';
export type Panel = 'colour' | 'face' | 'form';

// One frame for every view, so switching 2D/3D or Warna/Wajah never jumps.
const FRAME = 'w-full aspect-[3/4]';

interface Props {
  photoUrl: string;
  stage: Stage;
  onStage: (s: Stage) => void;
  panel: Panel;
  /** Colour try-on, shown in 2D under the Warna panel. */
  tryOnUrl: string | null;
  tryOnLoading: boolean;
  face: FaceArchitectureResult | null;
  drawn: DrawnMeasurement[];
  selected: string | null;
  onSelect: (key: string | null) => void;
  mmPerIod: number | null;
  head: { glb: ArrayBuffer | null; loading: boolean; error: FaceApiError | null };
  /** The 3D view can be opened (a front photo exists). */
  canShow3d: boolean;
}

/**
 * The photo side of the studio, with a floating 2D/3D switch.
 * - 2D under Warna: the try-on before/after.
 * - 2D under Wajah: the photo with the measurements; the picked one is
 *   zoomed onto and labelled.
 * - 3D: the fitted head; under Wajah, with the measurements drawn on it.
 */
export function PhotoStage(props: Props) {
  const { stage, onStage, canShow3d } = props;
  return (
    <div className="relative">
      {stage === '3d' ? <HeadStage {...props} /> : props.panel === 'face' && props.face ? <FacePhoto {...props} /> : (
        <BeforeAfter before={props.photoUrl} after={props.tryOnUrl} loading={props.tryOnLoading} className={FRAME} />
      )}

      {canShow3d && (
        <button
          type="button"
          onClick={() => onStage(stage === '3d' ? '2d' : '3d')}
          aria-label={stage === '3d' ? 'Tampilkan foto (2D)' : 'Tampilkan kepala 3D'}
          title={stage === '3d' ? 'Tampilkan foto (2D)' : 'Tampilkan kepala 3D'}
          className="absolute right-3 top-3 z-30 flex items-center gap-1.5 rounded-full border border-border bg-card/95 px-3 py-1.5 text-xs font-bold text-foreground shadow-md backdrop-blur transition hover:bg-card"
        >
          {stage === '3d' ? <ImageIcon className="h-4 w-4" /> : <Box className="h-4 w-4" />}
          {stage === '3d' ? '2D' : '3D'}
        </button>
      )}
    </div>
  );
}

function FacePhoto({ photoUrl, face, drawn, selected, onSelect, mmPerIod }: Props) {
  const catalogue = face?.provenance.catalogueVersion ?? '';
  const shown = drawn.find((d) => d.m.key === selected) ?? null;
  const focus = shown ? boundsOf(shown.geometry.points) : null;
  return (
    <div className={cn(FRAME, 'flex items-center justify-center overflow-hidden rounded-lg bg-muted/30')}>
      <GuidanceOverlay
        photoUrl={photoUrl}
        regions={[]}
        verifiedOnly={false}
        focus={focus}
        renderLayer={(size) =>
          drawn.length > 0 ? (
            <MeasurementLayer
              items={shown ? [shown] : drawn}
              selectedKey={selected}
              size={size}
              showAll={false}
              onSelect={(key) => onSelect(key === selected ? null : key)}
              labelOf={(m) => `${measurementName(m, catalogue)}: ${friendlyValue(m, catalogue, mmPerIod)?.short ?? ''}`}
              zoom={focus ? focusTransform(focus, size).scale : 1}
              view={focus ? visibleBox(focus, size) : undefined}
            />
          ) : null
        }
      />
    </div>
  );
}

function HeadStage({ head, face, selected, panel, onStage }: Props) {
  const [stats, setStats] = useState<HeadStats | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [shading, setShading] = useState<HeadShading>('natural');
  const landmarkPoints = stats?.report?.landmarkPoints;
  const markers = useMemo(
    () => (panel === 'face' && face ? headMarkers(face.measurements, landmarkPoints, selected) : []),
    [panel, face, landmarkPoints, selected],
  );

  if (head.loading) {
    return (
      <div className={cn(FRAME, 'flex items-center justify-center gap-2 rounded-lg border border-dashed border-border text-xs text-muted-foreground')}>
        <Loader2 className="h-4 w-4 animate-spin" />
        Membuat kepala 3D dari foto…
      </div>
    );
  }
  if (head.error || loadError || !head.glb) {
    return (
      <div className={cn(FRAME, 'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border p-6 text-center text-xs')}>
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <p>
          {head.error
            ? headErrorText(head.error)
            : loadError
              ? `GLB tidak bisa dibaca: ${loadError}`
              : 'Kepala 3D belum dibuat. Jalankan analisis dulu.'}
        </p>
        <button type="button" onClick={() => onStage('2d')} className="text-xs font-semibold underline">
          Kembali ke foto
        </button>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <HeadViewer
        glb={head.glb}
        shading={shading}
        onLoaded={setStats}
        onError={setLoadError}
        markers={markers}
        className={FRAME}
      />
      <ShadingControl shading={shading} onChange={setShading} stats={stats} />
      {panel === 'face' && face && stats && !landmarkPoints && (
        <p className="text-[11px] text-muted-foreground">
          Pengukuran belum bisa digambar di kepala: kepala ini belum membawa posisi 3D titik wajah.
        </p>
      )}
      {stats && (
        <details className="text-xs">
          <summary className="cursor-pointer select-none text-[11px] text-muted-foreground">Tentang kepala 3D ini</summary>
          <div className="mt-2">
            <HeadReportSummary report={stats.report} provenanceMissing={stats.provenanceMissing} />
          </div>
        </details>
      )}
    </div>
  );
}
