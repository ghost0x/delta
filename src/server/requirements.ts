'use server';

import prisma from '@/lib/prisma';
import { isAuthenticated } from '@/server/user';

export async function getRequirements(filters?: {
  domainId?: string;
  roleId?: string;
  search?: string;
}) {
  const where: Record<string, unknown> = {};

  if (filters?.domainId) {
    where.domainId = filters.domainId;
  }
  if (filters?.roleId) {
    where.roles = { some: { roleId: filters.roleId } };
  }
  if (filters?.search) {
    where.title = { contains: filters.search, mode: 'insensitive' };
  }

  const requirements = await prisma.requirement.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    include: {
      domain: true,
      roles: { include: { role: true } },
      createdBy: { select: { id: true, name: true } },
      revisions: {
        include: {
          release: { select: { id: true, status: true, publishedAt: true } }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  return requirements.map((req) => {
    const baselineRevision = req.revisions.find(
      (r) => r.release?.status === 'published'
    );
    const hasDraft = req.revisions.some((r) => !r.release || r.release.status === 'draft');
    const isDeprecated =
      baselineRevision?.type === 'deprecation';

    return {
      ...req,
      currentBaseline: baselineRevision ?? null,
      hasDraft,
      isDeprecated
    };
  });
}

export async function getRequirement(id: string) {
  const requirement = await prisma.requirement.findUnique({
    where: { id },
    include: {
      domain: true,
      roles: { include: { role: true } },
      createdBy: { select: { id: true, name: true } },
      revisions: {
        include: {
          release: {
            select: { id: true, name: true, status: true, publishedAt: true }
          },
          createdBy: { select: { id: true, name: true } },
          roles: { include: { role: true } }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!requirement) return null;

  const baselineRevision = requirement.revisions.find(
    (r) => r.release?.status === 'published'
  );

  return {
    ...requirement,
    currentBaseline: baselineRevision ?? null,
    isDeprecated: baselineRevision?.type === 'deprecation'
  };
}

export async function createRequirement(data: {
  title: string;
  domainId: string;
  roleIds: string[];
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
      throw new Error('Can only assign to draft releases');
    }
  }

  return prisma.requirement.create({
    data: {
      title: data.title.trim(),
      domainId: data.domainId,
      createdById: session.user.id,
      roles: {
        create: data.roleIds.map((roleId) => ({ roleId }))
      },
      revisions: {
        create: {
          type: 'baseline',
          title: data.title.trim(),
          content: data.content,
          releaseId: data.releaseId ?? null,
          createdById: session.user.id,
          roles: {
            create: data.roleIds.map((roleId) => ({ roleId }))
          }
        }
      }
    },
    include: {
      domain: true,
      roles: { include: { role: true } },
      revisions: true
    }
  });
}

export async function deleteRequirement(id: string) {
  const session = await isAuthenticated();
  if (!session) throw new Error('Unauthorized');

  await prisma.requirement.delete({ where: { id } });
}

export async function updateRequirement(
  id: string,
  data: { title?: string; domainId?: string; roleIds?: string[] }
) {
  const session = await isAuthenticated();
  if (!session) throw new Error('Unauthorized');

  const updateData: Record<string, unknown> = {};
  if (data.title) updateData.title = data.title.trim();
  if (data.domainId) updateData.domainId = data.domainId;

  if (data.roleIds) {
    await prisma.requirementRole.deleteMany({ where: { requirementId: id } });
    await prisma.requirementRole.createMany({
      data: data.roleIds.map((roleId) => ({ requirementId: id, roleId }))
    });
  }

  return prisma.requirement.update({
    where: { id },
    data: updateData,
    include: {
      domain: true,
      roles: { include: { role: true } }
    }
  });
}
