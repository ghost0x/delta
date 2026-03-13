import { NextResponse } from 'next/server';
import { badRequest } from '@/lib/api-auth';
import * as reportService from '@/services/reports';

export async function GET() {
  try {
    const markdown = await reportService.exportBaselineMarkdown();
    return new NextResponse(markdown, {
      headers: {
        'Content-Type': 'text/markdown',
        'Content-Disposition': 'attachment; filename="baseline-report.md"',
      },
    });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : 'Failed to export baseline report');
  }
}
