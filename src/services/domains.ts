import prisma from '@/lib/prisma';

export async function getDomains() {
  return prisma.domain.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { requirements: true } },
      categories: {
        orderBy: { name: 'asc' },
        include: { _count: { select: { requirements: true } } }
      }
    }
  });
}

export async function createDomain(data: { name: string; description?: string }) {
  return prisma.domain.create({
    data: {
      name: data.name.trim(),
      description: data.description?.trim() || null,
    }
  });
}

export async function updateDomain(id: string, data: { name?: string; description?: string }) {
  return prisma.domain.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name.trim() }),
      ...(data.description !== undefined && { description: data.description?.trim() || null }),
    }
  });
}

export async function deleteDomain(id: string) {
  const count = await prisma.requirement.count({ where: { domainId: id } });
  if (count > 0) {
    throw new Error('Cannot delete domain with existing requirements');
  }

  await prisma.category.deleteMany({ where: { domainId: id } });
  return prisma.domain.delete({ where: { id } });
}
