import prisma from '@/lib/prisma';
import { getOrCreateBaselineRelease } from '@/services/releases';

const revisionRolesInclude = { roles: { include: { role: true } } };

export async function createRevision(userId: string | undefined, data: {
  requirementId: string;
  type: 'baseline' | 'change' | 'deprecation';
  title: string;
  content: string;
  roleIds: string[];
  releaseId?: string;
}) {
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
      createdById: userId,
      roles: {
        create: data.roleIds.map((roleId) => ({ roleId }))
      }
    },
    include: {
      requirement: { select: { id: true, title: true } },
      release: { select: { id: true, name: true, status: true } },
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
      ...revisionRolesInclude
    }
  });
}

export async function getCurrentBaseline(requirementId: string) {
  return prisma.revision.findFirst({
    where: {
      requirementId,
      status: { in: ['published', 'deprecated'] }
    },
    orderBy: { createdAt: 'desc' },
    include: {
      release: {
        select: { id: true, name: true, publishedAt: true }
      },
      ...revisionRolesInclude
    }
  });
}

export async function assignRevisionToRelease(
  revisionId: string,
  releaseId: string
) {
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
  const revision = await prisma.revision.findUnique({
    where: { id: revisionId },
    include: { release: true }
  });
  if (!revision) throw new Error('Revision not found');
  if (revision.status === 'published' || revision.status === 'deprecated') {
    throw new Error('Cannot edit published or deprecated revisions');
  }

  if (data.roleIds) {
    await prisma.revisionRole.deleteMany({ where: { revisionId } });
    await prisma.revisionRole.createMany({
      data: data.roleIds.map((roleId) => ({ revisionId, roleId }))
    });
  }

  // Reset verified revision to unverified after edit
  const newStatus = revision.status === 'verified' ? 'unverified' : revision.status;

  return prisma.revision.update({
    where: { id: revisionId },
    data: {
      content: data.content,
      ...(data.title !== undefined && { title: data.title }),
      status: newStatus
    },
    include: {
      requirement: { select: { id: true, title: true } },
      release: { select: { id: true, name: true, status: true } },
      ...revisionRolesInclude
    }
  });
}

export async function deleteRevision(revisionId: string) {
  const revision = await prisma.revision.findUnique({
    where: { id: revisionId },
    include: { release: true }
  });
  if (!revision) throw new Error('Revision not found');
  if (revision.status === 'published' || revision.status === 'deprecated') {
    throw new Error('Cannot delete published or deprecated revisions');
  }

  return prisma.revision.delete({ where: { id: revisionId } });
}

export async function verifyRevision(revisionId: string) {
  const revision = await prisma.revision.findUnique({
    where: { id: revisionId },
    include: { release: true }
  });
  if (!revision) throw new Error('Revision not found');
  if (revision.status !== 'unverified') {
    throw new Error('Only unverified revisions can be verified');
  }

  // Baseline-assigned revisions auto-publish
  const isBaseline = revision.release?.name === 'Baseline' && revision.release?.status === 'published';
  const newStatus = isBaseline ? 'published' : 'verified';

  return prisma.revision.update({
    where: { id: revisionId },
    data: { status: newStatus },
    include: {
      requirement: { select: { id: true, title: true } },
      release: { select: { id: true, name: true, status: true } },
      ...revisionRolesInclude
    }
  });
}

export async function unverifyRevision(revisionId: string) {
  const revision = await prisma.revision.findUnique({
    where: { id: revisionId }
  });
  if (!revision) throw new Error('Revision not found');
  if (revision.status !== 'verified') {
    throw new Error('Only verified revisions can be unverified');
  }

  return prisma.revision.update({
    where: { id: revisionId },
    data: { status: 'unverified' },
    include: {
      requirement: { select: { id: true, title: true } },
      release: { select: { id: true, name: true, status: true } },
      ...revisionRolesInclude
    }
  });
}

export async function assignRevisionToBaseline(userId: string | undefined, revisionId: string) {
  const baseline = await getOrCreateBaselineRelease(userId);

  const revision = await prisma.revision.findUnique({
    where: { id: revisionId },
    include: { release: true, roles: true }
  });
  if (!revision) throw new Error('Revision not found');
  if (revision.status === 'published' || revision.status === 'deprecated') {
    throw new Error('Revision is already published or deprecated');
  }

  await prisma.revision.update({
    where: { id: revisionId },
    data: { releaseId: baseline.id, status: 'published' }
  });

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
  const revision = await prisma.revision.findUnique({
    where: { id: revisionId },
    include: { release: true }
  });
  if (revision?.status === 'published' || revision?.status === 'deprecated') {
    throw new Error('Cannot unassign published or deprecated revisions');
  }

  return prisma.revision.update({
    where: { id: revisionId },
    data: { releaseId: null }
  });
}
