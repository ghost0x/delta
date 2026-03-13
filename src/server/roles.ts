'use server';

import * as roleService from '@/services/roles';

export async function getRoles() {
  return roleService.getRoles();
}

export async function createRole(data: { name: string; description?: string }) {
  return roleService.createRole(data);
}

export async function updateRole(
  id: string,
  data: { name?: string; description?: string }
) {
  return roleService.updateRole(id, data);
}

export async function deleteRole(id: string) {
  return roleService.deleteRole(id);
}
