'use client';

import React from 'react';
import { AlertTriangle, Loader2, ScanFace } from 'lucide-react';
import { Button, cn } from '@gateway-experience/shared';
import { MeasurementSummary, ScaleNote } from '../face/FaceResultView';
import { ClassificationRow, GuidanceDetail, TraitRow } from '../face/ResultRows';
import { faceErrorText, type FaceApiError, type FaceArchitectureResult } from '../face/faceTypes';
import type { PhysicalScale } from '../face/physicalScale';

interface Props {
  result: FaceArchitectureResult | null;
  loading: boolean;
  error: FaceApiError | null;
  /** Measurements that have a drawing (on the photo, and on the head when it carries points). */
  drawableKeys: Set<string>;
  selected: string | null;
  onSelect: (key: string | null) => void;
  scale: PhysicalScale | null;
  pdMm: number | null;
  onPdChange: (v: number | null) => void;
  /** Run the face analysis (and the head) on its own, e.g. after "Langsung coba makeup". */
  onAnalyze: () => void;
}

/**
 * The Wajah side of the studio: face architecture as the engine sends it.
 * Measurements first (picking one shows it on the photo or the head), then
 * the shape, traits and makeup guidance.
 */
export function FacePanel({ result, loading, error, drawableKeys, selected, onSelect, scale, pdMm, onPdChange, onAnalyze }: Props) {
  if (!result) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3">
        {loading ? (
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Menganalisis bentuk wajah…
          </p>
        ) : (
          <>
            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                {faceErrorText(error)}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Analisis bentuk wajah belum dijalankan untuk foto ini.</p>
            <Button size="sm" leftIcon={<ScanFace className="h-3.5 w-3.5" />} onClick={onAnalyze}>
              Analisis wajah
            </Button>
          </>
        )}
      </div>
    );
  }

  const catalogue = result.provenance.catalogueVersion;
  const cal = result.provenance.calibration;
  const guidance = result.guidance?.regions ?? [];

  return (
    <div className="space-y-4">
      {cal.status !== 'calibrated' && (
        <div className="flex items-start gap-1.5 rounded-xl border border-warning/40 bg-warning/10 px-3 py-2 text-[11px]">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
          <span>
            <span className="font-semibold">Profil belum terkalibrasi ({cal.status}).</span> Hasil ini interpretasi profil, bukan
            vonis bentuk wajah.
          </span>
        </div>
      )}

      <Section title="Pengukuran" hint="Pilih untuk melihatnya di foto atau di kepala 3D.">
        <ul className="divide-y divide-border/60 rounded-xl border border-border">
          {result.measurements.map((m) => {
            const drawable = drawableKeys.has(m.key);
            const isSel = selected === m.key;
            return (
              <li key={m.key}>
                <button
                  type="button"
                  disabled={!drawable}
                  onClick={() => onSelect(isSel ? null : m.key)}
                  aria-pressed={isSel}
                  className={cn('w-full px-3 py-1.5 text-left', drawable && 'hover:bg-muted/50', isSel && 'bg-muted/60')}
                >
                  <MeasurementSummary m={m} catalogue={catalogue} mmPerIod={scale?.mmPerIod ?? null} />
                </button>
              </li>
            );
          })}
        </ul>
        <ScaleNote scale={scale} pdMm={pdMm} onPdChange={onPdChange} />
      </Section>

      <Section title="Bentuk & trait">
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
      </Section>

      {guidance.length > 0 && (
        <Section title="Panduan makeup">
          {guidance.map((r, i) => (
            <GuidanceDetail key={`${r.template}-${i}`} r={r} />
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-2">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{title}</div>
        {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </div>
  );
}
