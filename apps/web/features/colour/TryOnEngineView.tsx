'use client';

import Link from 'next/link';
import { ExternalLink, Palette } from 'lucide-react';
import { PageHeader } from '@gateway-experience/shared';
import { ColourStudioView } from './ColourStudioView';

/**
 * Simulator Studio: the simulator's flow inside the API Workbench — the
 * customer, an optional form, and colour analysis, try-on and face
 * architecture from one photo (localhost:3000, next to Form, Score and
 * Matching). Formerly the Try-On Engine, then the Vision Engine. It is
 * the same view as the standalone page /colour-analysis, which stays for
 * full-screen and phone-width testing.
 */
export function TryOnEngineView() {
  return (
    <div className="flex-1 min-w-0 h-full overflow-hidden bg-background text-foreground flex flex-col">
      <PageHeader
        icon={<Palette className="h-5 w-5 text-primary" />}
        breadcrumbs={[{ label: 'Workbench', href: '/' }, { label: 'Core Engines' }, { label: 'Simulator Studio' }]}
        title="Simulator Studio"
        description="The simulator flow: customer, an optional form, then colour analysis (WCPA), makeup try-on and face architecture from one photo. Every call is a dry run. The same view runs full screen at /colour-analysis."
      >
        <Link
          href="/colour-analysis"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 border border-border px-3 py-1 rounded transition"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Open full page
        </Link>
      </PageHeader>
      <div className="flex-1 min-h-0 flex">
        <ColourStudioView />
      </div>
    </div>
  );
}
