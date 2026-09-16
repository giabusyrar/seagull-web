'use client';

import React from 'react';
import Link from 'next/link';
import { AssessmentRecordsView } from '@/features/assessments';

export default function AssessmentsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="p-3 bg-white border-b border-border flex items-center justify-between">
        <span className="text-xs font-bold text-emerald-600">📊 Diagnostic Assessments Standalone View</span>
        <Link href="/" className="text-xs text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 border border-border px-3 py-1 rounded transition">
          ← Back to Gateway Console
        </Link>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <AssessmentRecordsView />
      </div>
    </div>
  );
}

