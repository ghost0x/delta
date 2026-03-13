import { NextRequest, NextResponse } from 'next/server';
import { badRequest } from '@/lib/api-auth';
import * as requirementService from '@/services/requirements';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const filters = {
      domainId: searchParams.get('domainId') ?? undefined,
      categoryId: searchParams.get('categoryId') ?? undefined,
      roleId: searchParams.get('roleId') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      domainName: searchParams.get('domainName') ?? undefined,
      categoryName: searchParams.get('categoryName') ?? undefined,
      status: searchParams.get('status') ?? undefined,
    };
    const data = await requirementService.getRequirements(filters);
    return NextResponse.json({ data });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : 'Failed to fetch requirements');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.title || !body.domainId || !body.categoryId || !body.roleIds || !body.content) {
      return badRequest('Missing required fields: title, domainId, categoryId, roleIds, content');
    }
    const result = await requirementService.createRequirement(undefined, body);
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : 'Failed to create requirement');
  }
}
