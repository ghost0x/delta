import { NextRequest, NextResponse } from 'next/server';
import { badRequest } from '@/lib/api-auth';
import * as releaseService from '@/services/releases';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const filters = {
      status: searchParams.get('status') ?? undefined,
    };
    const data = await releaseService.getReleases(filters);
    return NextResponse.json({ data });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : 'Failed to fetch releases');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name) return badRequest('Missing required field: name');
    const data = await releaseService.createRelease(undefined, body);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : 'Failed to create release');
  }
}
