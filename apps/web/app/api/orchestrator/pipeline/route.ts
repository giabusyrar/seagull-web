import { NextResponse } from 'next/server';
import { executeAssessmentPipeline, AssessmentPayload } from '@gateway-experience/beauty-sdk/orchestrator';

export async function POST(req: Request) {
  try {
    const body: AssessmentPayload = await req.json();
    const response = await executeAssessmentPipeline(body);
    return NextResponse.json(response);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Pipeline execution failed' },
      { status: 500 }
    );
  }
}
