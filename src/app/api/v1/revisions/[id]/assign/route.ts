import { NextRequest, NextResponse } from 'next/server';
import { badRequest } from '@/lib/api-auth';
import * as revisionService from '@/services/revisions';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    if (!body.releaseId) return badRequest('Missing required field: releaseId');
    const data = await revisionService.assignRevisionToRelease(id, body.releaseId);
    return NextResponse.json({ data });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : 'Failed to assign revision');
  }
}
