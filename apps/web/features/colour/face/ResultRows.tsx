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

export function ClassificationRow({ name, c }: { name: string; c: Classification }) {
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

export function TraitRow({ name, t }: { name: string; t: Trait }) {
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
