import { NextRequest, NextResponse } from 'next/server';
import { badRequest } from '@/lib/api-auth';
import * as reportService from '@/services/reports';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ releaseId: string }> }
) {
  try {
    const { releaseId } = await params;
    const markdown = await reportService.exportDeltaMarkdown(releaseId);
    return new NextResponse(markdown, {
      headers: {
        'Content-Type': 'text/markdown',
        'Content-Disposition': `attachment; filename="delta-report-${releaseId}.md"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to export delta report';
    const status = message.includes('not found') ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
