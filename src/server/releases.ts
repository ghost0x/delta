'use server';

import prisma from '@/lib/prisma';
import { isAuthenticated } from '@/server/user';

export async function getReleases(filters?: { status?: string }) {
  const where: Record<string, unknown> = {};
  if (filters?.status) where.status = filters.status;

  return prisma.release.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: { select: { id: true, name: true } },
      _count: { select: { revisions: true } }
    }
  });
}

export async function getRelease(id: string) {
  return prisma.release.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, name: true } },
      revisions: {
        include: {
          requirement: {
            include: {
              domain: true,
              roles: { include: { role: true } }
            }
          },
          createdBy: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });
}

export async function createRelease(data: {
  name: string;
  description?: string;
}) {
  const session = await isAuthenticated();
  if (!session) throw new Error('Unauthorized');

  return prisma.release.create({
    data: {
      name: data.name.trim(),
      description: data.description?.trim() ?? null,
      createdById: session.user.id
    }
  });
}

export async function updateRelease(
  id: string,
  data: { name?: string; description?: string }
) {
  const session = await isAuthenticated();
  if (!session) throw new Error('Unauthorized');

  const release = await prisma.release.findUnique({ where: { id } });
  if (!release || release.status !== 'draft') {
    throw new Error('Can only update draft releases');
  }

  return prisma.release.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name.trim() }),
      ...(data.description !== undefined && {
        description: data.description?.trim() ?? null
      })
    }
  });
}

export async function publishRelease(id: string) {
  const session = await isAuthenticated();
  if (!session) throw new Error('Unauthorized');

  const release = await prisma.release.findUnique({
    where: { id },
    include: { _count: { select: { revisions: true } } }
  });

  if (!release) throw new Error('Release not found');
  if (release.status !== 'draft') throw new Error('Release is already published');
  if (release._count.revisions === 0) {
    throw new Error('Cannot publish a release with no revisions');
  }

  return prisma.release.update({
    where: { id },
    data: {
      status: 'published',
      publishedAt: new Date()
    }
  });
}

export async function deleteRelease(id: string) {
  const session = await isAuthenticated();
  if (!session) throw new Error('Unauthorized');

  const release = await prisma.release.findUnique({ where: { id } });
  if (!release) throw new Error('Release not found');
  if (release.status !== 'draft') {
    throw new Error('Cannot delete a published release');
  }

  // Unassign all revisions from this release before deleting
  await prisma.revision.updateMany({
    where: { releaseId: id },
    data: { releaseId: null }
  });

  return prisma.release.delete({ where: { id } });
}
