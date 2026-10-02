import { NextResponse } from 'next/server';
import { executeAssessmentPipeline, AssessmentPayload } from '@gateway-experience/studio/orchestrator';

export async function POST(req: Request) {
  try {
    const body: AssessmentPayload = await req.json();
    // The pipeline calls back through this app (match engine, skin conditions)
    // using paths that are relative in the browser. On the server there is no
    // page to be relative to, so hand it this request's origin.
    const response = await executeAssessmentPipeline({
      ...body,
      baseUrl: body.baseUrl || new URL(req.url).origin,
    });
    return NextResponse.json(response);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Pipeline execution failed' },
      { status: 500 }
    );
  }
}
