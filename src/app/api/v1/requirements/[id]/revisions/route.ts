import { NextRequest, NextResponse } from 'next/server';
import { badRequest } from '@/lib/api-auth';
import * as revisionService from '@/services/revisions';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await revisionService.getRevisionHistory(id);
    return NextResponse.json({ data });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : 'Failed to fetch revisions');
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = await revisionService.createRevision(undefined, {
      requirementId: id,
      ...body,
    });
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : 'Failed to create revision');
  }
}
