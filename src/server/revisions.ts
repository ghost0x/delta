'use server';

import * as revisionService from '@/services/revisions';

export async function createRevision(data: {
  requirementId: string;
  type: 'baseline' | 'change' | 'deprecation';
  title: string;
  content: string;
  roleIds: string[];
  releaseId?: string;
}) {
  return revisionService.createRevision(undefined, data);
}

export async function getRevisionHistory(requirementId: string) {
  return revisionService.getRevisionHistory(requirementId);
}

export async function getCurrentBaseline(requirementId: string) {
  return revisionService.getCurrentBaseline(requirementId);
}

export async function assignRevisionToRelease(
  revisionId: string,
  releaseId: string
) {
  return revisionService.assignRevisionToRelease(revisionId, releaseId);
}

export async function updateRevision(
  revisionId: string,
  data: { content: string; title?: string; roleIds?: string[] }
) {
  return revisionService.updateRevision(revisionId, data);
}

export async function deleteRevision(revisionId: string) {
  return revisionService.deleteRevision(revisionId);
}

export async function assignRevisionToBaseline(revisionId: string) {
  return revisionService.assignRevisionToBaseline(undefined, revisionId);
}

export async function unassignRevisionFromRelease(revisionId: string) {
  return revisionService.unassignRevisionFromRelease(revisionId);
}
