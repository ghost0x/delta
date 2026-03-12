'use server';

import prisma from '@/lib/prisma';
import { isAuthenticated } from '@/server/user';

const revisionRolesInclude = { roles: { include: { role: true } } };

export async function createRevision(data: {
  requirementId: string;
  type: 'baseline' | 'change' | 'deprecation';
  title: string;
  content: string;
  roleIds: string[];
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
      title: data.title,
      content: data.content,
      releaseId: data.releaseId ?? null,
      createdById: session.user.id,
      roles: {
        create: data.roleIds.map((roleId) => ({ roleId }))
      }
    },
    include: {
      requirement: { select: { id: true, title: true } },
      release: { select: { id: true, name: true, status: true } },
      createdBy: { select: { id: true, name: true } },
      ...revisionRolesInclude
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
      createdBy: { select: { id: true, name: true } },
      ...revisionRolesInclude
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
      createdBy: { select: { id: true, name: true } },
      ...revisionRolesInclude
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

export async function updateRevision(
  revisionId: string,
  data: { content: string; title?: string; roleIds?: string[] }
) {
  const session = await isAuthenticated();
  if (!session) throw new Error('Unauthorized');

  const revision = await prisma.revision.findUnique({
    where: { id: revisionId },
    include: { release: true }
  });
  if (!revision) throw new Error('Revision not found');
  if (revision.release?.status === 'published') {
    throw new Error('Cannot edit revisions in published releases');
  }

  if (data.roleIds) {
    await prisma.revisionRole.deleteMany({ where: { revisionId } });
    await prisma.revisionRole.createMany({
      data: data.roleIds.map((roleId) => ({ revisionId, roleId }))
    });
  }

  return prisma.revision.update({
    where: { id: revisionId },
    data: {
      content: data.content,
      ...(data.title !== undefined && { title: data.title })
    },
    include: {
      requirement: { select: { id: true, title: true } },
      release: { select: { id: true, name: true, status: true } },
      createdBy: { select: { id: true, name: true } },
      ...revisionRolesInclude
    }
  });
}

export async function deleteRevision(revisionId: string) {
  const session = await isAuthenticated();
  if (!session) throw new Error('Unauthorized');

  const revision = await prisma.revision.findUnique({
    where: { id: revisionId },
    include: { release: true }
  });
  if (!revision) throw new Error('Revision not found');
  if (revision.release?.status === 'published') {
    throw new Error('Cannot delete revisions in published releases');
  }

  return prisma.revision.delete({ where: { id: revisionId } });
}

export async function assignRevisionToBaseline(revisionId: string) {
  const session = await isAuthenticated();
  if (!session) throw new Error('Unauthorized');

  const { getOrCreateBaselineRelease } = await import('@/server/releases');
  const baseline = await getOrCreateBaselineRelease();

  const revision = await prisma.revision.findUnique({
    where: { id: revisionId },
    include: { release: true, roles: true }
  });
  if (!revision) throw new Error('Revision not found');
  if (revision.release?.status === 'published') {
    throw new Error('Revision is already in a published release');
  }

  await prisma.revision.update({
    where: { id: revisionId },
    data: { releaseId: baseline.id }
  });

  // Sync requirement title and roles from this revision (same as publishRelease)
  await prisma.requirementRole.deleteMany({
    where: { requirementId: revision.requirementId }
  });
  await prisma.requirement.update({
    where: { id: revision.requirementId },
    data: {
      title: revision.title,
      roles: {
        create: revision.roles.map((r) => ({ roleId: r.roleId }))
      }
    }
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
