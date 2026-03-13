import prisma from '@/lib/prisma';

export async function getReleases(filters?: { status?: string }) {
  const where: Record<string, unknown> = {};
  if (filters?.status) where.status = filters.status;

  return prisma.release.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { revisions: true } }
    }
  });
}

export async function getRelease(id: string) {
  return prisma.release.findUnique({
    where: { id },
    include: {
      revisions: {
        include: {
          requirement: {
            include: {
              domain: true
            }
          },
          roles: { include: { role: true } },
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });
}

export async function createRelease(userId: string | undefined, data: {
  name: string;
  description?: string;
}) {
  return prisma.release.create({
    data: {
      name: data.name.trim(),
      description: data.description?.trim() ?? null,
      createdById: userId
    }
  });
}

export async function updateRelease(
  id: string,
  data: { name?: string; description?: string }
) {
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
  const release = await prisma.release.findUnique({
    where: { id },
    include: {
      revisions: {
        include: { roles: true },
      }
    }
  });

  if (!release) throw new Error('Release not found');
  if (release.status !== 'draft') throw new Error('Release is already published');
  if (release.revisions.length === 0) {
    throw new Error('Cannot publish a release with no revisions');
  }

  const unverified = release.revisions.filter((r) => r.status !== 'verified');
  if (unverified.length > 0) {
    throw new Error(
      `Cannot publish: ${unverified.length} revision(s) are not verified`
    );
  }

  const published = await prisma.release.update({
    where: { id },
    data: {
      status: 'published',
      publishedAt: new Date()
    }
  });

  for (const revision of release.revisions) {
    const revisionStatus = revision.type === 'deprecation' ? 'deprecated' : 'published';
    await prisma.revision.update({
      where: { id: revision.id },
      data: { status: revisionStatus }
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

  return published;
}

export async function getOrCreateBaselineRelease(userId: string | undefined) {
  const existing = await prisma.release.findFirst({
    where: { name: 'Baseline', status: 'published' }
  });
  if (existing) return existing;

  return prisma.release.create({
    data: {
      name: 'Baseline',
      description: 'Pre-existing requirements baseline',
      status: 'published',
      publishedAt: new Date(0),
      createdById: userId
    }
  });
}

export async function deleteRelease(id: string) {
  const release = await prisma.release.findUnique({ where: { id } });
  if (!release) throw new Error('Release not found');
  if (release.status !== 'draft') {
    throw new Error('Cannot delete a published release');
  }

  await prisma.revision.updateMany({
    where: { releaseId: id },
    data: { releaseId: null }
  });

  return prisma.release.delete({ where: { id } });
}
