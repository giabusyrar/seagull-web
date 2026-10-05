'use client';

import React from 'react';
import Link from 'next/link';
import { SimulatorStudio } from '@/features/colour/SimulatorStudio';

export default function ColourAnalysisPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="p-3 bg-white border-b border-border flex items-center justify-between">
        <span className="text-xs font-semibold">Simulator Studio</span>
        <Link href="/" className="text-xs text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 border border-border px-3 py-1 rounded transition">
          ← Back to Gateway Console
        </Link>
      </div>
      <div className="flex-1 overflow-auto">
        <SimulatorStudio />
      </div>
    </div>
  );
}
