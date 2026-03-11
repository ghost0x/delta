'use server';

import prisma from '@/lib/prisma';
import { isAuthenticated } from '@/server/user';

export async function getDomains() {
  return prisma.domain.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { requirements: true } } }
  });
}

export async function createDomain(data: { name: string }) {
  const session = await isAuthenticated();
  if (!session) throw new Error('Unauthorized');

  return prisma.domain.create({
    data: { name: data.name.trim() }
  });
}

export async function updateDomain(id: string, data: { name: string }) {
  const session = await isAuthenticated();
  if (!session) throw new Error('Unauthorized');

  return prisma.domain.update({
    where: { id },
    data: { name: data.name.trim() }
  });
}

export async function deleteDomain(id: string) {
  const session = await isAuthenticated();
  if (!session) throw new Error('Unauthorized');

  const count = await prisma.requirement.count({ where: { domainId: id } });
  if (count > 0) {
    throw new Error('Cannot delete domain with existing requirements');
  }

  return prisma.domain.delete({ where: { id } });
}
