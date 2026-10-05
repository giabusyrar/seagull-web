'use client';

import { Suspense, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ApplicationSelect, BrandSelect } from '@gateway-experience/shared';
import {
  QuestionnaireRunner,
  listQuestionnaires,
  type QuestionnaireItem,
  type QuestionnaireRunnerPayload,
} from '@gateway-experience/studio/form';

// Demo harness for the consumer-facing QuestionnaireRunner.
// The tenant and questionnaire come from the URL (?brand=&app=&code=) or the
// pickers below — there is no default form, so nothing runs until all three
// are chosen.
export default function RunnerDemoPage() {
  return (
    <Suspense fallback={null}>
      <RunnerDemo />
    </Suspense>
  );
}

function RunnerDemo() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const brandId = params.get('brand') ?? '';
  const applicationId = params.get('app') ?? '';
  const code = params.get('code') ?? '';

  const [loadedQuestionnaires, setQuestionnaires] = useState<QuestionnaireItem[]>([]);
  const [loadError, setListError] = useState<string | null>(null);
  const [runKey, setRunKey] = useState(0);
  const [payload, setPayload] = useState<QuestionnaireRunnerPayload | null>(null);

  const setParam = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
    setPayload(null);
  };

  useEffect(() => {
    if (!brandId || !applicationId) return;
    let alive = true;
    listQuestionnaires(brandId, applicationId)
      .then((list) => {
        if (!alive) return;
        setListError(null);
        setQuestionnaires(list);
      })
      .catch((e: unknown) => {
        if (!alive) return;
        setQuestionnaires([]);
        setListError(e instanceof Error ? e.message : 'Could not list questionnaires.');
      });
    return () => {
      alive = false;
    };
  }, [brandId, applicationId]);

  // Without a tenant nothing is listed, whatever was loaded for the last one.
  const tenantSet = Boolean(brandId && applicationId);
  const questionnaires = tenantSet ? loadedQuestionnaires : [];
  const listError = tenantSet ? loadError : null;
  const ready = Boolean(tenantSet && code);

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="mx-auto max-w-xl space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <BrandSelect
            value={brandId}
            includeUniversal={false}
            label="Brand"
            onChange={(v) => setParam({ brand: v, code: '' })}
          />
          <ApplicationSelect
            value={applicationId}
            includeUniversal={false}
            label="Application"
            onChange={(v) => setParam({ app: v, code: '' })}
          />
        </div>

        <div className="flex items-end gap-2">
          <label className="flex-1 space-y-1">
            <span className="text-xs font-semibold text-muted-foreground">Questionnaire</span>
            <select
              value={code}
              disabled={!brandId || !applicationId}
              onChange={(e) => setParam({ code: e.target.value })}
              className="w-full h-9 rounded-md border border-border bg-muted/30 px-3 text-sm outline-none focus:border-primary disabled:opacity-50"
            >
              <option value="">
                {!brandId || !applicationId ? 'Choose a brand and application first' : 'Choose a form…'}
              </option>
              {code && !questionnaires.some((q) => q.code === code) && (
                <option value={code}>{code}</option>
              )}
              {questionnaires.map((q) => (
                <option key={q.code} value={q.code}>
                  {q.name || q.code} ({q.code})
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            disabled={!ready}
            onClick={() => {
              setPayload(null);
              setRunKey((k) => k + 1);
            }}
            className="h-9 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            Reload
          </button>
        </div>

        {listError && <p className="text-xs text-destructive">{listError}</p>}

        {ready ? (
          <QuestionnaireRunner
            key={`${brandId}/${applicationId}/${code}/${runKey}`}
            questionnaireCode={code}
            brandId={brandId}
            applicationId={applicationId}
            onComplete={(p) => setPayload(p)}
          />
        ) : (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <p className="text-sm font-semibold">Choose a form</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Pick a brand, an application and a questionnaire to run it here.
            </p>
          </div>
        )}

        {payload && (
          <div className="rounded-xl border border-border bg-card p-4 space-y-2">
            <h3 className="text-xs font-bold">onComplete payload</h3>
            <pre className="text-[11px] leading-relaxed text-muted-foreground whitespace-pre-wrap break-all font-mono">
              {JSON.stringify(payload, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
