import { NextRequest, NextResponse } from 'next/server';
import { badRequest } from '@/lib/api-auth';
import * as domainService from '@/services/domains';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    if (!body.name && body.description === undefined)
      return badRequest('No fields to update');
    const data = await domainService.updateDomain(id, body);
    return NextResponse.json({ data });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : 'Failed to update domain');
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await domainService.deleteDomain(id);
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete domain';
    const status = message.includes('Cannot delete') ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
