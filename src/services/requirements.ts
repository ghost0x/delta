import prisma from '@/lib/prisma';

type RevisionStatus = 'unverified' | 'verified' | 'published' | 'deprecated';

export function deriveRequirementStatus(
  revisions: { status: string }[]
): RevisionStatus {
  if (revisions.some((r) => r.status === 'deprecated')) return 'deprecated';
  if (revisions.some((r) => r.status === 'published')) return 'published';
  if (revisions.some((r) => r.status === 'verified')) return 'verified';
  return 'unverified';
}

export async function getRequirements(filters?: {
  domainId?: string;
  categoryId?: string;
  roleId?: string;
  search?: string;
  domainName?: string;
  categoryName?: string;
  status?: string;
}) {
  const where: Record<string, unknown> = {};

  if (filters?.domainId) {
    where.domainId = filters.domainId;
  } else if (filters?.domainName) {
    where.domain = { name: { equals: filters.domainName, mode: 'insensitive' } };
  }
  if (filters?.categoryId) {
    where.categoryId = filters.categoryId;
  } else if (filters?.categoryName) {
    where.category = { name: { equals: filters.categoryName, mode: 'insensitive' } };
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
      category: true,
      roles: { include: { role: true } },
      revisions: {
        include: {
          release: { select: { id: true, status: true, publishedAt: true } }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  const mapped = requirements.map((req) => {
    const derivedStatus = deriveRequirementStatus(req.revisions);
    const currentBaseline = req.revisions.find(
      (r) => r.status === 'published' || r.status === 'deprecated'
    ) ?? null;

    return {
      ...req,
      derivedStatus,
      currentBaseline
    };
  });

  if (filters?.status) {
    return mapped.filter((req) => req.derivedStatus === filters.status);
  }

  return mapped;
}

export async function getRequirement(id: string) {
  const requirement = await prisma.requirement.findUnique({
    where: { id },
    include: {
      domain: true,
      category: true,
      roles: { include: { role: true } },
      revisions: {
        include: {
          release: {
            select: { id: true, name: true, status: true, publishedAt: true }
          },
              roles: { include: { role: true } }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!requirement) return null;

  const derivedStatus = deriveRequirementStatus(requirement.revisions);
  const currentBaseline = requirement.revisions.find(
    (r) => r.status === 'published' || r.status === 'deprecated'
  ) ?? null;

  return {
    ...requirement,
    derivedStatus,
    currentBaseline
  };
}

export async function createRequirement(userId: string | undefined, data: {
  title: string;
  domainId: string;
  categoryId: string;
  roleIds: string[];
  content: string;
  releaseId?: string;
}) {
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
      categoryId: data.categoryId,
      createdById: userId,
      roles: {
        create: data.roleIds.map((roleId) => ({ roleId }))
      },
      revisions: {
        create: {
          type: 'baseline',
          title: data.title.trim(),
          content: data.content,
          releaseId: data.releaseId ?? null,
          createdById: userId,
          roles: {
            create: data.roleIds.map((roleId) => ({ roleId }))
          }
        }
      }
    },
    include: {
      domain: true,
      category: true,
      roles: { include: { role: true } },
      revisions: true
    }
  });
}

export async function updateRequirement(
  id: string,
  data: { title?: string; domainId?: string; categoryId?: string }
) {
  const updateData: Record<string, unknown> = {};
  if (data.title) updateData.title = data.title.trim();
  if (data.domainId) updateData.domainId = data.domainId;
  if (data.categoryId) updateData.categoryId = data.categoryId;

  return prisma.requirement.update({
    where: { id },
    data: updateData,
    include: {
      domain: true,
      category: true
    }
  });
}

export async function deleteRequirement(id: string) {
  await prisma.requirement.delete({ where: { id } });
}
