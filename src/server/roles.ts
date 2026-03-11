'use server';

import prisma from '@/lib/prisma';
import { isAuthenticated } from '@/server/user';

export async function getRoles() {
  return prisma.businessRole.findMany({
    orderBy: [{ isGlobal: 'desc' }, { name: 'asc' }],
    include: { _count: { select: { requirements: true } } }
  });
}

export async function createRole(data: { name: string; isGlobal?: boolean }) {
  const session = await isAuthenticated();
  if (!session) throw new Error('Unauthorized');

  return prisma.businessRole.create({
    data: { name: data.name.trim(), isGlobal: data.isGlobal ?? false }
  });
}

export async function updateRole(
  id: string,
  data: { name: string; isGlobal?: boolean }
) {
  const session = await isAuthenticated();
  if (!session) throw new Error('Unauthorized');

  return prisma.businessRole.update({
    where: { id },
    data: { name: data.name.trim(), isGlobal: data.isGlobal }
  });
}

export async function deleteRole(id: string) {
  const session = await isAuthenticated();
  if (!session) throw new Error('Unauthorized');

  const count = await prisma.requirementRole.count({ where: { roleId: id } });
  if (count > 0) {
    throw new Error('Cannot delete role assigned to requirements');
  }

  return prisma.businessRole.delete({ where: { id } });
}
