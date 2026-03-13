'use server';

import * as domainService from '@/services/domains';

export async function getDomains() {
  return domainService.getDomains();
}

export async function createDomain(data: { name: string; description?: string }) {
  return domainService.createDomain(data);
}

export async function updateDomain(id: string, data: { name?: string; description?: string }) {
  return domainService.updateDomain(id, data);
}

export async function deleteDomain(id: string) {
  return domainService.deleteDomain(id);
}
