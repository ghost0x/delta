'use server';

import * as reportService from '@/services/reports';

export type { DeltaReport, BaselineReport } from '@/services/reports';

export async function generateDeltaReport(releaseId: string) {
  return reportService.generateDeltaReport(releaseId);
}

export async function generateBaselineReport() {
  return reportService.generateBaselineReport();
}

export async function exportDeltaMarkdown(releaseId: string) {
  return reportService.exportDeltaMarkdown(releaseId);
}

export async function exportBaselineMarkdown() {
  return reportService.exportBaselineMarkdown();
}
