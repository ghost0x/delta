import prisma from '@/lib/prisma';

export async function getRoles() {
  return prisma.businessRole.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { requirements: true } } }
  });
}

export async function createRole(data: { name: string; description?: string }) {
  return prisma.businessRole.create({
    data: {
      name: data.name.trim(),
      description: data.description?.trim() || null,
    }
  });
}

export async function updateRole(
  id: string,
  data: { name?: string; description?: string }
) {
  return prisma.businessRole.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name.trim() }),
      ...(data.description !== undefined && { description: data.description?.trim() || null }),
    }
  });
}

export async function deleteRole(id: string) {
  const count = await prisma.requirementRole.count({ where: { roleId: id } });
  if (count > 0) {
    throw new Error('Cannot delete role assigned to requirements');
  }

  return prisma.businessRole.delete({ where: { id } });
}
