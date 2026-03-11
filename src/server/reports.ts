'use server';

import prisma from '@/lib/prisma';

interface DeltaReportItem {
  requirementId: string;
  requirementTitle: string;
  domain: string;
  roles: string[];
  revisionType: string;
  fromContent: string | null;
  toContent: string;
}

interface BaselineReportItem {
  requirementId: string;
  requirementTitle: string;
  domain: string;
  roles: string[];
  content: string;
  publishedAt: Date;
  releaseName: string;
}

export interface DeltaReport {
  releaseName: string;
  publishedAt: Date | null;
  items: Record<string, DeltaReportItem[]>;
}

export interface BaselineReport {
  generatedAt: Date;
  items: Record<string, BaselineReportItem[]>;
}

export async function generateDeltaReport(
  releaseId: string
): Promise<DeltaReport> {
  const release = await prisma.release.findUnique({
    where: { id: releaseId },
    include: {
      revisions: {
        include: {
          requirement: {
            include: {
              domain: true,
              roles: { include: { role: true } }
            }
          }
        }
      }
    }
  });

  if (!release) throw new Error('Release not found');

  const items: Record<string, DeltaReportItem[]> = {};

  for (const revision of release.revisions) {
    // Find the previous baseline for this requirement
    const previousBaseline = await prisma.revision.findFirst({
      where: {
        requirementId: revision.requirementId,
        release: {
          status: 'published',
          publishedAt: release.publishedAt
            ? { lt: release.publishedAt }
            : undefined
        }
      },
      orderBy: { release: { publishedAt: 'desc' } }
    });

    const domainName = revision.requirement.domain.name;
    if (!items[domainName]) items[domainName] = [];

    items[domainName].push({
      requirementId: revision.requirementId,
      requirementTitle: revision.requirement.title,
      domain: domainName,
      roles: revision.requirement.roles.map((r) => r.role.name),
      revisionType: revision.type,
      fromContent: previousBaseline?.content ?? null,
      toContent: revision.content
    });
  }

  return {
    releaseName: release.name,
    publishedAt: release.publishedAt,
    items
  };
}

export async function generateBaselineReport(): Promise<BaselineReport> {
  // Get all requirements with their most recent published revision
  const requirements = await prisma.requirement.findMany({
    include: {
      domain: true,
      roles: { include: { role: true } },
      revisions: {
        where: { release: { status: 'published' } },
        orderBy: { release: { publishedAt: 'desc' } },
        take: 1,
        include: {
          release: { select: { name: true, publishedAt: true } }
        }
      }
    }
  });

  const items: Record<string, BaselineReportItem[]> = {};

  for (const req of requirements) {
    const latestRevision = req.revisions[0];
    if (!latestRevision) continue;
    // Skip deprecated requirements
    if (latestRevision.type === 'deprecation') continue;

    const domainName = req.domain.name;
    if (!items[domainName]) items[domainName] = [];

    items[domainName].push({
      requirementId: req.id,
      requirementTitle: req.title,
      domain: domainName,
      roles: req.roles.map((r) => r.role.name),
      content: latestRevision.content,
      publishedAt: latestRevision.release!.publishedAt!,
      releaseName: latestRevision.release!.name
    });
  }

  return { generatedAt: new Date(), items };
}

export async function exportDeltaMarkdown(releaseId: string): Promise<string> {
  const report = await generateDeltaReport(releaseId);
  const lines: string[] = [];

  lines.push(`# Release Change Report: ${report.releaseName}`);
  if (report.publishedAt) {
    lines.push(
      `*Published: ${report.publishedAt.toLocaleDateString()}*`
    );
  }
  lines.push('');

  const domains = Object.keys(report.items).sort();
  for (const domain of domains) {
    lines.push(`## ${domain}`);
    lines.push('');

    for (const item of report.items[domain]) {
      const rolesStr = item.roles.length > 0 ? ` (${item.roles.join(', ')})` : '';
      lines.push(`### ${item.requirementTitle}${rolesStr}`);
      lines.push('');

      if (item.revisionType === 'deprecation') {
        lines.push('**Status:** DEPRECATED');
        lines.push('');
      }

      if (item.fromContent) {
        lines.push('**From:**');
        lines.push(item.fromContent);
        lines.push('');
      } else {
        lines.push('**From:** *(New requirement)*');
        lines.push('');
      }

      lines.push('**To:**');
      lines.push(item.toContent);
      lines.push('');
      lines.push('---');
      lines.push('');
    }
  }

  return lines.join('\n');
}

export async function exportBaselineMarkdown(): Promise<string> {
  const report = await generateBaselineReport();
  const lines: string[] = [];

  lines.push('# System Baseline');
  lines.push(
    `*Generated: ${report.generatedAt.toLocaleDateString()}*`
  );
  lines.push('');

  const domains = Object.keys(report.items).sort();
  for (const domain of domains) {
    lines.push(`## ${domain}`);
    lines.push('');

    for (const item of report.items[domain]) {
      const rolesStr = item.roles.length > 0 ? ` (${item.roles.join(', ')})` : '';
      lines.push(`### ${item.requirementTitle}${rolesStr}`);
      lines.push('');
      lines.push(item.content);
      lines.push('');
      lines.push(
        `*Last updated in: ${item.releaseName}*`
      );
      lines.push('');
      lines.push('---');
      lines.push('');
    }
  }

  return lines.join('\n');
}
