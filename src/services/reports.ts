import prisma from '@/lib/prisma';

interface DeltaReportItem {
  requirementId: string;
  requirementTitle: string;
  domain: string;
  roles: string[];
  revisionType: string;
  fromContent: string | null;
  toContent: string;
  fromTitle: string | null;
  toTitle: string;
  fromRoles: string[] | null;
  toRoles: string[];
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
            include: { domain: true }
          },
          roles: { include: { role: true } }
        }
      }
    }
  });

  if (!release) throw new Error('Release not found');

  const items: Record<string, DeltaReportItem[]> = {};

  for (const revision of release.revisions) {
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
      orderBy: { release: { publishedAt: 'desc' } },
      include: { roles: { include: { role: true } } }
    });

    const domainName = revision.requirement.domain.name;
    if (!items[domainName]) items[domainName] = [];

    items[domainName].push({
      requirementId: revision.requirementId,
      requirementTitle: revision.title,
      domain: domainName,
      roles: revision.roles.map((r) => r.role.name),
      revisionType: revision.type,
      fromContent: previousBaseline?.content ?? null,
      toContent: revision.content,
      fromTitle: previousBaseline?.title ?? null,
      toTitle: revision.title,
      fromRoles: previousBaseline ? previousBaseline.roles.map((r) => r.role.name) : null,
      toRoles: revision.roles.map((r) => r.role.name)
    });
  }

  return {
    releaseName: release.name,
    publishedAt: release.publishedAt,
    items
  };
}

export async function generateBaselineReport(): Promise<BaselineReport> {
  const requirements = await prisma.requirement.findMany({
    include: {
      domain: true,
      revisions: {
        where: { release: { status: 'published' } },
        orderBy: { release: { publishedAt: 'desc' } },
        take: 1,
        include: {
          release: { select: { name: true, publishedAt: true } },
          roles: { include: { role: true } }
        }
      }
    }
  });

  const items: Record<string, BaselineReportItem[]> = {};

  for (const req of requirements) {
    const latestRevision = req.revisions[0];
    if (!latestRevision) continue;
    if (latestRevision.type === 'deprecation') continue;

    const domainName = req.domain.name;
    if (!items[domainName]) items[domainName] = [];

    items[domainName].push({
      requirementId: req.id,
      requirementTitle: latestRevision.title,
      domain: domainName,
      roles: latestRevision.roles.map((r) => r.role.name),
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
      const rolesStr = item.toRoles.length > 0 ? ` (${item.toRoles.join(', ')})` : '';
      lines.push(`### ${item.toTitle}${rolesStr}`);
      lines.push('');

      if (item.revisionType === 'deprecation') {
        lines.push('**Status:** DEPRECATED');
        lines.push('');
      }

      if (item.fromTitle && item.fromTitle !== item.toTitle) {
        lines.push(`**Title changed:** ${item.fromTitle} → ${item.toTitle}`);
        lines.push('');
      }

      if (item.fromRoles) {
        const fromSet = new Set(item.fromRoles);
        const toSet = new Set(item.toRoles);
        const rolesChanged = fromSet.size !== toSet.size || [...fromSet].some((r) => !toSet.has(r));
        if (rolesChanged) {
          lines.push(`**Roles changed:** ${item.fromRoles.join(', ') || 'none'} → ${item.toRoles.join(', ') || 'none'}`);
          lines.push('');
        }
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
