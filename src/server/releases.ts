'use server';

import * as releaseService from '@/services/releases';

export async function getReleases(filters?: { status?: string }) {
  return releaseService.getReleases(filters);
}

export async function getRelease(id: string) {
  return releaseService.getRelease(id);
}

export async function createRelease(data: {
  name: string;
  description?: string;
}) {
  return releaseService.createRelease(undefined, data);
}

export async function updateRelease(
  id: string,
  data: { name?: string; description?: string }
) {
  return releaseService.updateRelease(id, data);
}

export async function publishRelease(id: string) {
  return releaseService.publishRelease(id);
}

export async function getOrCreateBaselineRelease() {
  return releaseService.getOrCreateBaselineRelease(undefined);
}

export async function deleteRelease(id: string) {
  return releaseService.deleteRelease(id);
}
