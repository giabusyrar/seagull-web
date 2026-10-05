import { NextResponse } from 'next/server';
import {
  executeAssessmentPipeline,
  PipelineInputError,
  type AssessmentPayload,
} from '@gateway-experience/studio/orchestrator';
import { STUDIO_HOST_ROUTES } from '@/lib/host-routes';

export async function POST(req: Request) {
  try {
    const body: AssessmentPayload = await req.json();
    // The pipeline calls back through this app (score and match engines,
    // skin conditions) using paths that are relative in the browser. On the
    // server there is no page to be relative to, so hand it this request's
    // origin — always this app's own, never one from the body: the server
    // sends its gateway key to these calls.
    const response = await executeAssessmentPipeline(
      {
        ...body,
        baseUrl: new URL(req.url).origin,
      },
      { routes: STUDIO_HOST_ROUTES },
    );
    return NextResponse.json(response);
  } catch (err: unknown) {
    // No tenant or ruleset: the caller's mistake, named, not a server fault.
    if (err instanceof PipelineInputError || (err as Error)?.name === 'PipelineInputError') {
      const e = err as PipelineInputError;
      return NextResponse.json({ success: false, error: e.message, missing: e.missing }, { status: 400 });
    }
    return NextResponse.json(
      { success: false, error: (err instanceof Error && err.message) || 'Pipeline execution failed' },
      { status: 500 },
    );
  }
}
