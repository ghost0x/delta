'use server';

import * as requirementService from '@/services/requirements';

export async function getRequirements(filters?: {
  domainId?: string;
  categoryId?: string;
  roleId?: string;
  search?: string;
  domainName?: string;
  categoryName?: string;
  status?: string;
}) {
  return requirementService.getRequirements(filters);
}

export async function getRequirement(id: string) {
  return requirementService.getRequirement(id);
}

export async function createRequirement(data: {
  title: string;
  domainId: string;
  categoryId: string;
  roleIds: string[];
  content: string;
  releaseId?: string;
}) {
  return requirementService.createRequirement(undefined, data);
}

export async function updateRequirement(
  id: string,
  data: { title?: string; domainId?: string; categoryId?: string; status?: string }
) {
  return requirementService.updateRequirement(id, data);
}

export async function deleteRequirement(id: string) {
  return requirementService.deleteRequirement(id);
}
