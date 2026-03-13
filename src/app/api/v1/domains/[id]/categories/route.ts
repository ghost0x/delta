import { NextRequest, NextResponse } from 'next/server';
import { badRequest } from '@/lib/api-auth';
import * as categoryService from '@/services/categories';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await categoryService.getCategories(id);
    return NextResponse.json({ data });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : 'Failed to fetch categories');
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    if (!body.name) return badRequest('Missing required field: name');
    const data = await categoryService.createCategory({ name: body.name, description: body.description, domainId: id });
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : 'Failed to create category');
  }
}
