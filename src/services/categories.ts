import prisma from '@/lib/prisma';

export async function getCategories(domainId?: string) {
  return prisma.category.findMany({
    where: domainId ? { domainId } : undefined,
    orderBy: { name: 'asc' },
    include: { _count: { select: { requirements: true } } }
  });
}

export async function createCategory(data: { name: string; description?: string; domainId: string }) {
  return prisma.category.create({
    data: {
      name: data.name.trim(),
      description: data.description?.trim() || null,
      domainId: data.domainId,
    }
  });
}

export async function updateCategory(id: string, data: { name?: string; description?: string }) {
  return prisma.category.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name.trim() }),
      ...(data.description !== undefined && { description: data.description?.trim() || null }),
    }
  });
}

export async function deleteCategory(id: string) {
  const count = await prisma.requirement.count({ where: { categoryId: id } });
  if (count > 0) {
    throw new Error('Cannot delete category with existing requirements');
  }

  return prisma.category.delete({ where: { id } });
}
