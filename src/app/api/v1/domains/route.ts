import { NextRequest, NextResponse } from 'next/server';
import { badRequest } from '@/lib/api-auth';
import * as domainService from '@/services/domains';

export async function GET() {
  try {
    const data = await domainService.getDomains();
    return NextResponse.json({ data });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : 'Failed to fetch domains');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name) return badRequest('Missing required field: name');
    const data = await domainService.createDomain(body);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : 'Failed to create domain');
  }
}
