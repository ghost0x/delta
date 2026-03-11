'use server';

import prisma from '@/lib/prisma';
import { isAuthenticated } from '@/server/user';

export async function createRevision(data: {
  requirementId: string;
  type: 'baseline' | 'change' | 'deprecation';
  content: string;
  releaseId?: string;
}) {
  const session = await isAuthenticated();
  if (!session) throw new Error('Unauthorized');

  if (data.releaseId) {
    const release = await prisma.release.findUnique({
      where: { id: data.releaseId }
    });
    if (!release || release.status !== 'draft') {
      throw new Error('Can only assign revisions to draft releases');
    }
  }

  return prisma.revision.create({
    data: {
      requirementId: data.requirementId,
      type: data.type,
      content: data.content,
      releaseId: data.releaseId ?? null,
      createdById: session.user.id
    },
    include: {
      requirement: { select: { id: true, title: true } },
      release: { select: { id: true, name: true, status: true } },
      createdBy: { select: { id: true, name: true } }
    }
  });
}

export async function getRevisionHistory(requirementId: string) {
  return prisma.revision.findMany({
    where: { requirementId },
    orderBy: { createdAt: 'desc' },
    include: {
      release: {
        select: { id: true, name: true, status: true, publishedAt: true }
      },
      createdBy: { select: { id: true, name: true } }
    }
  });
}

export async function getCurrentBaseline(requirementId: string) {
  return prisma.revision.findFirst({
    where: {
      requirementId,
      release: { status: 'published' }
    },
    orderBy: { release: { publishedAt: 'desc' } },
    include: {
      release: {
        select: { id: true, name: true, publishedAt: true }
      },
      createdBy: { select: { id: true, name: true } }
    }
  });
}

export async function assignRevisionToRelease(
  revisionId: string,
  releaseId: string
) {
  const session = await isAuthenticated();
  if (!session) throw new Error('Unauthorized');

  const release = await prisma.release.findUnique({
    where: { id: releaseId }
  });
  if (!release || release.status !== 'draft') {
    throw new Error('Can only assign revisions to draft releases');
  }

  return prisma.revision.update({
    where: { id: revisionId },
    data: { releaseId }
  });
}

export async function unassignRevisionFromRelease(revisionId: string) {
  const session = await isAuthenticated();
  if (!session) throw new Error('Unauthorized');

  const revision = await prisma.revision.findUnique({
    where: { id: revisionId },
    include: { release: true }
  });
  if (revision?.release?.status === 'published') {
    throw new Error('Cannot unassign revisions from published releases');
  }

  return prisma.revision.update({
    where: { id: revisionId },
    data: { releaseId: null }
  });
}
