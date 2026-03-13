import { NextRequest, NextResponse } from 'next/server';
import { notFound, badRequest } from '@/lib/api-auth';
import * as releaseService from '@/services/releases';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await releaseService.getRelease(id);
    if (!data) return notFound('Release');
    return NextResponse.json({ data });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : 'Failed to fetch release');
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = await releaseService.updateRelease(id, body);
    return NextResponse.json({ data });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : 'Failed to update release');
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await releaseService.deleteRelease(id);
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete release';
    const status = message.includes('Cannot delete') ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
