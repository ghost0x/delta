import { NextRequest, NextResponse } from 'next/server';
import { notFound, badRequest } from '@/lib/api-auth';
import * as requirementService from '@/services/requirements';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await requirementService.getRequirement(id);
    if (!data) return notFound('Requirement');
    return NextResponse.json({ data });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : 'Failed to fetch requirement');
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = await requirementService.updateRequirement(id, body);
    return NextResponse.json({ data });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : 'Failed to update requirement');
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requirementService.deleteRequirement(id);
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : 'Failed to delete requirement');
  }
}
