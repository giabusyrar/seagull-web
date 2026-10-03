'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Box, ImagePlus, X } from 'lucide-react';
import { Button, cn } from '@gateway-experience/shared';
import { HeadViewer, NO_SIGMA_GREY, PRIOR_GREY, SIGMA_RAMP, type HeadShading, type HeadStats } from './HeadViewer';
import { HEAD_VIEW_LABEL, headErrorText, type HeadReport, type HeadViewName } from './headTypes';
import { useFaceHead } from './useFaceHead';

type GetEndpoint = (key: 'vision', path: string) => string;

interface Props {
  front: File;
  brandId: string;
  applicationId: string;
  getEndpoint: GetEndpoint;
}

/**
 * The 3D head for the current photo, built on demand when this panel opens.
 * Side photos are optional and sharpen the shape. Everything the engine says
 * about how far to trust the head is shown next to it.
 */
export function HeadPanel({ front, brandId, applicationId, getEndpoint }: Props) {
  const [sides, setSides] = useState<Partial<Record<'left' | 'right', File>>>({});
  const views = useMemo(() => ({ front, ...sides }), [front, sides]);
  const { glb, loading, error, build } = useFaceHead(views, getEndpoint);
  const [localGlb, setLocalGlb] = useState<{ name: string; data: ArrayBuffer } | null>(null);
  const [stats, setStats] = useState<HeadStats | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [shading, setShading] = useState<HeadShading>('natural');

  // On demand: opening this panel builds the head; adding side photos does
  // not refit until asked ("Buat ulang"). Unmounting aborts the request.
  useEffect(() => {
    void build(brandId, applicationId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shown = localGlb?.data ?? glb;
  useEffect(() => {
    setStats(null);
    setLoadError(null);
  }, [shown]);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {(['left', 'right'] as const).map((side) => (
          <SidePhoto
            key={side}
            label={HEAD_VIEW_LABEL[side]}
            file={sides[side]}
            onChange={(f) => setSides((s) => ({ ...s, [side]: f ?? undefined }))}
          />
        ))}
        <Button variant="secondary" onClick={() => void build(brandId, applicationId)} disabled={loading}>
          <Box className="h-4 w-4" />
          {loading ? 'Membuat kepala 3D…' : glb ? 'Buat ulang' : 'Buat kepala 3D'}
        </Button>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Foto samping opsional: wajah menoleh sebagian (tiga perempat), bukan profil penuh. Dengan foto samping, bentuk kepala
        lebih akurat.
      </p>

      {error && !localGlb && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-2.5 text-xs">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <span>{headErrorText(error)}</span>
        </div>
      )}
      {loadError && <p className="text-xs text-destructive">GLB tidak bisa dibaca: {loadError}</p>}

      {shown ? (
        <>
          {localGlb && (
            <div className="flex items-center justify-between rounded-lg border border-warning/40 bg-warning/10 px-2.5 py-1.5 text-[11px]">
              <span>
                Menampilkan file lokal <span className="font-semibold">{localGlb.name}</span>, bukan hasil dari foto ini.
              </span>
              <button type="button" onClick={() => setLocalGlb(null)} aria-label="Tutup file lokal" className="rounded p-0.5 hover:bg-muted">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <HeadViewer glb={shown} shading={shading} onLoaded={setStats} onError={setLoadError} />
          <ShadingControl shading={shading} onChange={setShading} stats={stats} />
          {stats && <HeadReportSummary report={stats.report} provenanceMissing={stats.provenanceMissing} />}
        </>
      ) : (
        <div className="flex aspect-[4/5] w-full items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
          {loading ? 'Membuat kepala 3D dari foto…' : 'Kepala 3D belum dibuat.'}
        </div>
      )}

      <LocalGlbPicker onPick={setLocalGlb} />
    </div>
  );
}

export function SidePhoto({ label, file, onChange }: { label: string; file?: File; onChange: (f: File | null) => void }) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[11px]">
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
      <button type="button" onClick={() => input.current?.click()} className="flex items-center gap-1 font-semibold">
        <ImagePlus className="h-3.5 w-3.5" />
        {label}
      </button>
      {file ? (
        <>
          <span className="max-w-28 truncate text-muted-foreground">{file.name}</span>
          <button
            type="button"
            aria-label={`Hapus foto ${label.toLowerCase()}`}
            onClick={() => {
              if (input.current) input.current.value = '';
              onChange(null);
            }}
            className="rounded p-0.5 hover:bg-muted"
          >
            <X className="h-3 w-3" />
          </button>
        </>
      ) : (
        <span className="text-muted-foreground">opsional</span>
      )}
    </span>
  );
}

export function ShadingControl({ shading, onChange, stats }: { shading: HeadShading; onChange: (s: HeadShading) => void; stats: HeadStats | null }) {
  const sigma = stats?.sigmaRange;
  return (
    <div className="space-y-1.5">
      <div role="radiogroup" aria-label="Pewarnaan" className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5">
        {(
          [
            ['natural', 'Natural'],
            ['provenance', 'Foto vs perkiraan'],
            ['sigma', 'Ketidakpastian'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={shading === value}
            disabled={value === 'sigma' && !sigma}
            onClick={() => onChange(value)}
            className={cn(
              'rounded-md px-2.5 py-0.5 text-[11px] font-semibold disabled:opacity-40',
              shading === value ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {label}
          </button>
        ))}
      </div>
      {shading === 'natural' ? (
        <p className="text-[11px] text-muted-foreground">
          Warna dari foto di bagian yang terlihat. Pilih “Foto vs perkiraan” untuk menandai bagian yang hanya perkiraan model.
        </p>
      ) : shading === 'provenance' ? (
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="inline-block h-3 w-3 rounded-sm border border-border" style={{ backgroundColor: PRIOR_GREY }} />
          Abu-abu = tidak terlihat di foto mana pun; bentuknya perkiraan model, bukan hasil foto.
        </p>
      ) : (
        sigma && (
          <div className="space-y-0.5 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="tabular-nums">{sigma[0].toFixed(1)} mm</span>
              <span
                className="inline-block h-2.5 w-32 rounded-full"
                style={{ background: `linear-gradient(to right, ${SIGMA_RAMP[0]}, ${SIGMA_RAMP[1]})` }}
              />
              <span className="tabular-nums">{sigma[1].toFixed(1)} mm</span>
            </div>
            <p>
              Ketidakpastian posisi tiap titik, <span className="font-semibold text-foreground">setidaknya</span> sebesar ini
              (batas bawah dari model, bukan rentang kepercayaan).
            </p>
            {stats?.sigmaMissing && (
              <p className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-sm border border-border" style={{ backgroundColor: NO_SIGMA_GREY }} />
                Abu-abu muda = tidak ada nilai ketidakpastian dari model (mis. rambut atau penutup kepala).
              </p>
            )}
          </div>
        )
      )}
    </div>
  );
}

const CONSISTENCY_TEXT: Record<string, { text: string; warn: boolean }> = {
  consistent: { text: 'Bentuk dari tiap foto saling cocok.', warn: false },
  views_may_differ: {
    text: 'Bentuk dari tiap foto berbeda. Mungkin bukan orang yang sama, atau pose/ekspresinya berbeda.',
    warn: true,
  },
  unconfigured: { text: 'Pemeriksaan kecocokan antar foto belum dikonfigurasi.', warn: true },
  undetermined: { text: 'Kecocokan antar foto tidak bisa ditentukan (salah satu foto gagal dicocokkan sendiri).', warn: true },
};

export function HeadReportSummary({ report, provenanceMissing }: { report: HeadReport | null; provenanceMissing: boolean }) {
  if (!report) {
    return (
      <p className="text-[11px] text-warning">
        GLB tidak membawa laporan (HeadReport), jadi seberapa jauh kepala ini bisa dipercaya tidak diketahui.
      </p>
    );
  }
  const consistency = report.viewConsistency ? CONSISTENCY_TEXT[report.viewConsistency.flag] : null;
  const ev = report.shapeEvidence;
  return (
    <div className="space-y-2 rounded-lg border border-border bg-card p-3 text-xs">
      <div className="flex items-start gap-1.5 rounded-md bg-warning/10 px-2 py-1.5 text-[11px]">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
        <span>
          <span className="font-semibold">Hanya visualisasi.</span> Ukuran wajah tetap dari analisis 2D; tidak ada yang diukur
          dari kepala 3D ini.
        </span>
      </div>
      {provenanceMissing && (
        <p className="text-[11px] text-warning">GLB tidak membawa info area yang terlihat, jadi semua area ditampilkan sebagai perkiraan.</p>
      )}

      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[11px]">
        <dt className="text-muted-foreground">Foto dipakai</dt>
        <dd>
          {report.views.map((v) => (
            <div key={v.name}>
              {HEAD_VIEW_LABEL[v.name] ?? v.name}: menoleh {v.yawDeg.toFixed(0)}°, selisih titik {v.nme.toFixed(3)}{' '}
              <span className="text-muted-foreground">(batas tolak {report.nmeLimit})</span>
            </div>
          ))}
        </dd>

        <dt className="text-muted-foreground">Bukti bentuk</dt>
        <dd>
          {ev.effectiveComponents.toFixed(1)} dari {report.components.identity} komponen bentuk benar-benar ditentukan foto
          <span className="text-muted-foreground">; sisanya mendekati bentuk rata-rata model.</span>
        </dd>

        <dt className="text-muted-foreground">Kamera</dt>
        <dd>
          Sudut pandang {report.camera.fovDeg.toFixed(0)}°
          {report.camera.fovSource === 'prior_dominated' ? (
            <span className="text-muted-foreground"> (dari asumsi awal; dengan satu foto belum bisa diperkirakan)</span>
          ) : (
            <span className="text-muted-foreground"> (diperkirakan dari foto, ±{report.camera.fovSdDeg.toFixed(1)}°)</span>
          )}
        </dd>

        {consistency && (
          <>
            <dt className="text-muted-foreground">Antar foto</dt>
            <dd className={cn(consistency.warn && 'font-semibold text-warning')}>
              {consistency.text}
              {report.viewConsistency?.rmsMm != null && (
                <span className="font-normal text-muted-foreground">
                  {' '}
                  (selisih {report.viewConsistency.rmsMm.toFixed(1)} mm
                  {report.viewConsistency.thresholdMm != null && `, batas ${report.viewConsistency.thresholdMm} mm`})
                </span>
              )}
            </dd>
          </>
        )}
      </dl>

      <details className="text-[11px] text-muted-foreground">
        <summary className="cursor-pointer select-none">Detail teknis</summary>
        <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
          <dt>Model</dt>
          <dd>
            {report.model.name} {report.model.version}
          </dd>
          {report.segmenter && (
            <>
              <dt>Segmenter</dt>
              <dd>
                {report.segmenter.name} {report.segmenter.version}
              </dd>
            </>
          )}
          <dt>Korespondensi</dt>
          <dd>v{report.correspondence.version}</dd>
          <dt>Jarak dari rata-rata</dt>
          <dd>{ev.distanceFromMean.toFixed(0)}</dd>
          <dt>Komponen</dt>
          <dd>
            identitas {report.components.identity}, wajah bawah {report.components.lowerFace}, mata {report.components.eye}
          </dd>
          <dt>Catatan engine</dt>
          <dd>{report.notice}</dd>
        </dl>
      </details>
    </div>
  );
}

/** Opens a .glb from disk, for checking the viewer against a sample head. */
function LocalGlbPicker({ onPick }: { onPick: (g: { name: string; data: ArrayBuffer }) => void }) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <div className="text-[11px] text-muted-foreground">
      <input
        ref={input}
        type="file"
        accept=".glb,model/gltf-binary"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (f) onPick({ name: f.name, data: await f.arrayBuffer() });
          e.target.value = '';
        }}
      />
      <button type="button" onClick={() => input.current?.click()} className="underline hover:text-foreground">
        Buka file .glb lokal (uji viewer)
      </button>
    </div>
  );
}
