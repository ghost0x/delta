import { NextResponse } from 'next/server';
import { badRequest } from '@/lib/api-auth';
import * as reportService from '@/services/reports';

export async function GET() {
  try {
    const data = await reportService.generateBaselineReport();
    return NextResponse.json({ data });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : 'Failed to generate baseline report');
  }
}
