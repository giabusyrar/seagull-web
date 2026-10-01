'use client';

import React from 'react';
import { Badge, cn } from '@gateway-experience/shared';
import {
  CLASSIFICATION_STATUS_LABEL,
  REGION_CONFIDENCE_LABEL,
  TRAIT_STATUS_LABEL,
  regionConfidence,
  type Classification,
  type FaceArchitectureResult,
  type GuidanceRegion,
  type Trait,
} from './faceTypes';

// One rendering per result type, shared by the text cards and the
// information marks on the photo, so both always say the same thing.

type OptionState = 'chosen' | 'possible' | 'other' | 'not_assessable';

interface Option {
  label: string;
  state: OptionState;
  /** Shown after the label, e.g. a relative score. */
  note?: string;
}

const OPTION_STATE_TITLE: Record<OptionState, string> = {
  chosen: 'Hasil',
  possible: 'Mungkin juga',
  other: 'Opsi lain',
  not_assessable: 'Tidak bisa dinilai dari foto ini',
};

function OptionChips({ options }: { options: Option[] }) {
  return (
    <ul className="mt-1 flex flex-wrap gap-1">
      {options.map((o) => (
        <li
          key={o.label}
          title={OPTION_STATE_TITLE[o.state]}
          className={cn(
            'rounded-full border px-2 py-0.5 text-[11px]',
            o.state === 'chosen' && 'border-primary bg-primary text-primary-foreground font-semibold',
            o.state === 'possible' && 'border-dashed border-primary text-foreground',
            o.state === 'other' && 'border-border text-foreground',
            o.state === 'not_assessable' && 'border-border text-muted-foreground line-through',
          )}
        >
          {o.label}
          {o.state === 'possible' && <span className="text-muted-foreground"> · mungkin</span>}
          {o.note && <span className={cn(o.state === 'chosen' ? 'opacity-80' : 'text-muted-foreground')}> {o.note}</span>}
        </li>
      ))}
    </ul>
  );
}

/** Every class the classifier knows: scored ones first, best first, then the ones this photo could not score. */
function classificationOptions(c: Classification): Option[] {
  const scored = Object.entries(c.scores ?? {})
    .sort(([, a], [, b]) => b - a)
    .map(([label, score]): Option => ({
      label,
      state: label === c.primary ? 'chosen' : label === c.secondary ? 'possible' : 'other',
      note: `${Math.round(score * 100)}%`,
    }));
  const unscored = (c.notAssessable ?? []).map((label): Option => ({ label, state: 'not_assessable' }));
  return [...scored, ...unscored];
}

export function ClassificationRow({ name, c }: { name: string; c: Classification }) {
  const assessed = c.status === 'single' || c.status === 'blend';
  const options = classificationOptions(c);
  return (
    <div className="border-b border-border/60 py-2 last:border-0">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium">{name}</span>
        <Badge variant={assessed ? 'default' : 'warning'}>{CLASSIFICATION_STATUS_LABEL[c.status] || c.status}</Badge>
      </div>
      {options.length > 0 && <OptionChips options={options} />}
      {Object.keys(c.scores ?? {}).length > 0 && (
        <p className="mt-1 text-[11px] text-muted-foreground">Persentase = skor relatif di antara bentuk yang bisa dinilai.</p>
      )}
      {c.reason && <p className="mt-0.5 text-[11px] text-muted-foreground">{c.reason}</p>}
    </div>
  );
}

/** optionsNote: say per row that the engine sends no full option list; off where a list says it once. */
export function TraitRow({ name, t, optionsNote = true }: { name: string; t: Trait; optionsNote?: boolean }) {
  const assessed = t.status === 'assessed';
  const options: Option[] = t.label
    ? [{ label: t.label, state: 'chosen' }, ...(t.alternative ? [{ label: t.alternative, state: 'possible' as const }] : [])]
    : [];
  return (
    <div className="border-b border-border/60 py-2 last:border-0">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium">{name}</span>
        {!assessed && <Badge variant="warning">{TRAIT_STATUS_LABEL[t.status] || t.status}</Badge>}
      </div>
      {options.length > 0 && <OptionChips options={options} />}
      {t.boundaryUncertain && t.alternative && (
        <p className="mt-1 text-[11px] text-muted-foreground">
          Nilainya dekat batas antar kategori. Dengan ketelitian pengukuran saat ini, bisa juga terbaca sebagai{' '}
          <span className="font-semibold text-foreground">{t.alternative}</span>.
        </p>
      )}
      {assessed && optionsNote && (
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          Engine hanya mengirim hasil{t.alternative ? ' dan alternatif terdekat' : ''}, belum daftar semua opsi trait ini.
        </p>
      )}
      {t.reason && <p className="mt-0.5 text-[11px] text-muted-foreground">{t.reason}</p>}
    </div>
  );
}

export function GuidanceDetail({ r }: { r: GuidanceRegion }) {
  const conf = regionConfidence(r);
  return (
    <div className="space-y-1 py-1 text-xs">
      <div className="font-medium">
        {r.role} · <span className="text-muted-foreground">{r.template}</span>
      </div>
      <div className="flex flex-wrap gap-1">
        <Badge variant={conf === 'verified' ? 'default' : 'warning'}>{REGION_CONFIDENCE_LABEL[conf]}</Badge>
        {r.match === 'secondary' && <Badge variant="warning">bukti lemah</Badge>}
      </div>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px]">
        <Row label="Intensitas" value={String(r.intensity)} />
        <Row label="Rule" value={r.ruleId} />
      </dl>
      {r.unverifiedRegions.length > 0 && (
        <p className="text-[11px] text-muted-foreground">Area belum terkonfirmasi: {r.unverifiedRegions.join(', ')}</p>
      )}
    </div>
  );
}

export function QualityDetail({ result }: { result: FaceArchitectureResult }) {
  const q = result.quality;
  return (
    <div className="space-y-1 text-xs">
      <dl className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px]">
        <Row label="Roll" value={`${q.rollDeg.toFixed(1)}°`} />
        <Row label="Yaw" value={`${q.yawDeg.toFixed(1)}°`} />
        <Row label="Pitch" value={`${q.pitchDeg.toFixed(1)}°`} />
        <Row label="IOD" value={`${q.iodPx.toFixed(0)} px`} />
      </dl>
      {q.gatesPassed.length > 0 && <p className="text-[11px] text-muted-foreground">Lolos: {q.gatesPassed.join(', ')}</p>}
      {q.warnings.length > 0 && <p className="text-[11px] text-muted-foreground">Peringatan: {q.warnings.join(', ')}</p>}
    </div>
  );
}

export function RegionsDetail({ result }: { result: FaceArchitectureResult }) {
  const entries = Object.entries(result.regions);
  if (entries.length === 0) return <p className="text-[11px] text-muted-foreground">Worker tidak melaporkan area.</p>;
  return (
    <dl className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px]">
      {entries.map(([region, visibility]) => (
        <Row key={region} label={region} value={visibility} tone={visibility === 'observed' ? undefined : 'warning'} />
      ))}
    </dl>
  );
}

export function ProvenanceDetail({ result }: { result: FaceArchitectureResult }) {
  const p = result.provenance;
  return (
    <dl className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px]">
      <Row label="Model" value={`${p.model.name} ${p.model.version}`} />
      <Row label="Profil" value={`${p.profile.code} v${p.profile.version}`} />
      <Row label="Katalog" value={p.catalogueVersion} />
      <Row label="Kalibrasi" value={p.calibration.status} tone={p.calibration.status === 'calibrated' ? undefined : 'warning'} />
    </dl>
  );
}

export const Row = ({ label, value, tone }: { label: string; value: string; tone?: 'warning' }) => (
  <>
    <dt className="text-muted-foreground">{label}</dt>
    <dd className={cn('text-right tabular-nums', tone === 'warning' && 'text-warning font-semibold')}>{value}</dd>
  </>
);
