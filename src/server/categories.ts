'use server';

import * as categoryService from '@/services/categories';

export async function getCategories(domainId?: string) {
  return categoryService.getCategories(domainId);
}

export async function createCategory(data: { name: string; description?: string; domainId: string }) {
  return categoryService.createCategory(data);
}

export async function updateCategory(id: string, data: { name?: string; description?: string }) {
  return categoryService.updateCategory(id, data);
}

export async function deleteCategory(id: string) {
  return categoryService.deleteCategory(id);
}
