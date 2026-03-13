import { NextRequest, NextResponse } from 'next/server';
import { badRequest } from '@/lib/api-auth';
import * as revisionService from '@/services/revisions';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await revisionService.assignRevisionToBaseline(undefined, id);
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : 'Failed to assign to baseline');
  }
}
