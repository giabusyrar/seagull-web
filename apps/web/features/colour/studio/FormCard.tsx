'use client';

import React, { useEffect, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { ApplicationSelect, BrandSelect, DRY_RUN_HEADER, usePersistentState } from '@gateway-experience/shared';
import {
  QuestionnaireRunner,
  listQuestionnaires,
  type QuestionnaireItem,
  type QuestionnaireRunnerPayload,
} from '@gateway-experience/studio/form';
import { customerFields, type StudioCustomer } from './CustomerCard';
import type { FormEvaluation, FormRun } from './FormResult';

type GetEndpoint = (key: 'form', path: string) => string;


const PREFIX = 'xg.simulatorStudio.form.';

/**
 * A questionnaire next to the photo, as in the simulator: pick one of the
 * brand/application's forms, fill it in, and score it with core's form
 * engine (POST /core/form-engine/survey/:code/evaluate) as a dry run, with
 * the customer's details — nothing is stored. The score is shown with the
 * colour and face results (FormResult); `run` is the current one and
 * `restartKey` changes when "Isi ulang" there asks for a fresh form.
 */
export function FormCard({ getEndpoint, customer, run, onRun, restartKey }: {
  getEndpoint: GetEndpoint;
  customer: StudioCustomer;
  run: FormRun | null;
  onRun: (run: FormRun | null) => void;
  restartKey: number;
}) {
  const [open, setOpen] = usePersistentState<boolean>(PREFIX + 'open', false);
  const [brandId, setBrandId] = usePersistentState<string>(PREFIX + 'brand', '');
  const [applicationId, setApplicationId] = usePersistentState<string>(PREFIX + 'application', '');
  const [code, setCode] = usePersistentState<string>(PREFIX + 'code', '');
  const [forms, setForms] = useState<QuestionnaireItem[]>([]);
  const [listError, setListError] = useState<string | null>(null);
  const [scoring, setScoring] = useState(false);

  const tenantSet = !!brandId && !!applicationId;
  useEffect(() => {
    if (!tenantSet) return;
    let alive = true;
    listQuestionnaires(brandId, applicationId)
      .then((list) => {
        if (!alive) return;
        setForms(list);
        setListError(null);
      })
      .catch((e: unknown) => {
        if (!alive) return;
        setForms([]);
        setListError(e instanceof Error ? e.message : 'Daftar form tidak bisa dimuat.');
      });
    return () => {
      alive = false;
    };
  }, [tenantSet, brandId, applicationId]);
  const shownForms = tenantSet ? forms : [];
  const known = shownForms.some((f) => f.code === code);

  const evaluate = async (payload: QuestionnaireRunnerPayload) => {
    setScoring(true);
    try {
      const res = await fetch(getEndpoint('form', `/survey/${encodeURIComponent(code)}/evaluate`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', [DRY_RUN_HEADER]: 'true' },
        body: JSON.stringify({ brand_id: brandId, application_id: applicationId, ...customerFields(customer), data: payload.answers }),
      });
      const body = (await res.json().catch(() => ({ error: `HTTP ${res.status}` }))) as FormEvaluation;
      onRun({ code, status: res.status, body });
    } catch (e) {
      onRun({ code, status: 0, body: { error: e instanceof Error ? e.message : String(e) } });
    } finally {
      setScoring(false);
    }
  };

  const submitted = !!run && run.code === code;

  return (
    <div className="rounded-2xl border border-border bg-card shadow-xs">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 p-4 text-left"
      >
        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <ClipboardList className="h-3.5 w-3.5" />
          Form (opsional)
        </span>
        <span className="text-[11px] text-muted-foreground">{code && known ? code : open ? 'Tutup' : 'Pilih form'}</span>
      </button>

      {open && (
        <div className="space-y-3 border-t border-border p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <BrandSelect value={brandId} onChange={(v) => { setBrandId(v); setCode(''); onRun(null); }} includeUniversal={false} label="Brand" />
            <ApplicationSelect value={applicationId} onChange={(v) => { setApplicationId(v); setCode(''); onRun(null); }} includeUniversal={false} label="Aplikasi" />
          </div>

          {!tenantSet ? (
            <p className="text-[11px] text-muted-foreground">Pilih brand dan aplikasi untuk melihat form-nya.</p>
          ) : listError ? (
            <p className="text-[11px] text-destructive">{listError}</p>
          ) : shownForms.length === 0 ? (
            <p className="text-[11px] text-muted-foreground">Brand dan aplikasi ini belum punya form.</p>
          ) : (
            <label className="flex flex-col gap-1">
              <span className="text-[11px] text-muted-foreground">Form</span>
              <select
                value={known ? code : ''}
                onChange={(e) => { setCode(e.target.value); onRun(null); }}
                className="h-9 rounded-md border border-border bg-background px-2.5 text-xs text-foreground outline-none focus:border-ring"
              >
                <option value="">— pilih form —</option>
                {shownForms.map((f) => (
                  <option key={f.code} value={f.code}>{f.name || f.code}</option>
                ))}
              </select>
            </label>
          )}

          {tenantSet && known && !submitted && (
            <div className="rounded-xl border border-border bg-background p-2">
              <QuestionnaireRunner
                key={`${code}-${restartKey}`}
                questionnaireCode={code}
                brandId={brandId}
                applicationId={applicationId}
                onComplete={evaluate}
              />
              {scoring && <p className="px-2 pb-2 text-[11px] text-muted-foreground">Menilai…</p>}
            </div>
          )}

          {submitted && (
            <p className="text-[11px] text-muted-foreground">Sudah dinilai — lihat tab <b>Form</b> di hasil.</p>
          )}
        </div>
      )}
    </div>
  );
}
