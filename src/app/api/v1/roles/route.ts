import { NextRequest, NextResponse } from 'next/server';
import { badRequest } from '@/lib/api-auth';
import * as roleService from '@/services/roles';

export async function GET() {
  try {
    const data = await roleService.getRoles();
    return NextResponse.json({ data });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : 'Failed to fetch roles');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name) return badRequest('Missing required field: name');
    const data = await roleService.createRole(body);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : 'Failed to create role');
  }
}
