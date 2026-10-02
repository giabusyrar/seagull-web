'use client';

import { useState } from 'react';
import {
  QuestionnaireRunner,
  type QuestionnaireRunnerPayload,
} from '@gateway-experience/studio/form';

// Demo harness for the consumer-facing QuestionnaireRunner.
// Point `code` at any saved questionnaire; the payload lands in the panel below.
export default function RunnerDemoPage() {
  const [code, setCode] = useState('pixie_omg_skin_analyzer');
  const [runKey, setRunKey] = useState(0);
  const [payload, setPayload] = useState<QuestionnaireRunnerPayload | null>(null);

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="mx-auto max-w-xl space-y-5">
        <div className="flex items-end gap-2">
          <label className="flex-1 space-y-1">
            <span className="text-xs font-semibold text-muted-foreground">
              Questionnaire code
            </span>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-9 rounded-md border border-border bg-muted/30 px-3 text-sm outline-none focus:border-primary"
            />
          </label>
          <button
            type="button"
            onClick={() => {
              setPayload(null);
              setRunKey((k) => k + 1);
            }}
            className="h-9 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            Load
          </button>
        </div>

        <QuestionnaireRunner
          key={runKey}
          questionnaireCode={code}
          customerId="demo-customer-123"
          brandId="wardah"
          applicationId="skinverse"
          onComplete={(p) => setPayload(p)}
        />

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