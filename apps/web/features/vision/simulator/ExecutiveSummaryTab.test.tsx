import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ExecutiveSummaryTab } from './ExecutiveSummaryTab';
import type { VisionAnalysisResult, StructuredWarning } from './types';

const captureContext: VisionAnalysisResult['captureContext'] = {
  captureMode: 'SINGLE_ANGLE',
  inputCount: 1,
  providedAngles: ['FRONT'],
  coverageCompleteness: 'PARTIAL',
  processedImages: [{ angle: 'FRONT', fileName: 'a.jpg', landmarkDetected: true }],
};

const executionMetrics: VisionAnalysisResult['executionMetrics'] = {
  totalLatencyMs: 10,
  executedModels: [],
  executedModelsCount: 0,
  skippedModelsCount: 0,
};

function render(score: number | null, warnings: StructuredWarning[] = []) {
  const result: VisionAnalysisResult = {
    analysisId: 'a1',
    brandId: 'b1',
    applicationId: 'app1',
    status: 'COMPLETED',
    captureContext,
    globalAggregation: { overallSkinHealthScore: score, dimensions: {}, skinConditions: {} },
    zoneBreakdown: [],
    warnings,
    executionMetrics,
  };
  return renderToStaticMarkup(<ExecutiveSummaryTab result={result} />);
}

describe('the overall skin health score', () => {
  // core-engine sends null when nothing was scored — no face, or no model for
  // the requested capabilities. It used to send 0.0, which reads as measured.
  it('says it was not measured instead of throwing on null', () => {
    const html = render(null);
    expect(html).toContain('Not measured');
    expect(html).not.toContain('/ 100');
  });

  it('points at the warnings for the reason', () => {
    expect(render(null)).toMatch(/warnings/i);
  });

  it('still renders a real score', () => {
    const html = render(72.45);
    expect(html).toContain('72.5');
    expect(html).toContain('/ 100');
    expect(html).not.toContain('Not measured');
  });

  it('shows a measured zero as a zero, not as missing', () => {
    const html = render(0);
    expect(html).toContain('0.0');
    expect(html).not.toContain('Not measured');
  });
});
