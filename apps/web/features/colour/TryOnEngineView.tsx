'use client';

import Link from 'next/link';
import { ExternalLink, Palette } from 'lucide-react';
import { PageHeader } from '@gateway-experience/shared';
import { SimulatorStudio } from './SimulatorStudio';

/**
 * Simulator Studio: the simulator itself inside the API Workbench — the same
 * screens as the simulator app (@gateway-experience/simulator-kit), reaching
 * the services through the dashboard's gateway proxy. Formerly the Try-On
 * Engine, then the Vision Engine. /colour-analysis shows it full screen.
 */
export function TryOnEngineView() {
  return (
    <div className="flex-1 min-w-0 h-full overflow-hidden bg-background text-foreground flex flex-col">
      <PageHeader
        icon={<Palette className="h-5 w-5 text-primary" />}
        breadcrumbs={[{ label: 'Workbench', href: '/' }, { label: 'Core Engines' }, { label: 'Simulator Studio' }]}
        title="Simulator Studio"
        description="The simulator: customer, questionnaire with the live advisor, photo, then colour, face, skin and try-on results. Every call is a dry run. The same view runs full screen at /colour-analysis."
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
      <div className="flex-1 min-h-0 overflow-auto">
        <SimulatorStudio />
      </div>
    </div>
  );
}
