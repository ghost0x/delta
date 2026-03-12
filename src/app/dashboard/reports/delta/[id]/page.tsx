import { notFound } from 'next/navigation';
import { generateDeltaReport, exportDeltaMarkdown } from '@/server/reports';
import { getRoles } from '@/server/roles';
import { DeltaReportView } from '@/components/reports/delta-report';
import { ExportButton } from '@/components/reports/export-button';

export default async function DeltaReportPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let report;
  let markdown;
  let roles;
  try {
    [report, markdown, roles] = await Promise.all([
      generateDeltaReport(id),
      exportDeltaMarkdown(id),
      getRoles()
    ]);
  } catch {
    notFound();
  }

  return (
    <div className='flex flex-1 flex-col'>
      <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
        <div className='flex flex-col justify-between gap-4 px-4 sm:flex-row sm:items-center lg:px-6'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>
              Change Report: {report.releaseName}
            </h1>
            {report.publishedAt && (
              <p className='text-muted-foreground mt-1'>
                Published {new Date(report.publishedAt).toLocaleDateString()}
              </p>
            )}
          </div>
          <ExportButton
            content={markdown}
            filename={`delta-${report.releaseName.replace(/\s+/g, '-').toLowerCase()}.md`}
          />
        </div>
        <div className='px-4 lg:px-6'>
          <DeltaReportView report={report} totalRoleCount={roles.length} />
        </div>
      </div>
    </div>
  );
}
