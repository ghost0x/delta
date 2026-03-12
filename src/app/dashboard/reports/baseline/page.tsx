import { generateBaselineReport, exportBaselineMarkdown } from '@/server/reports';
import { getRoles } from '@/server/roles';
import { BaselineReportView } from '@/components/reports/baseline-report';
import { ExportButton } from '@/components/reports/export-button';

export default async function BaselineReportPage() {
  const [report, markdown, roles] = await Promise.all([
    generateBaselineReport(),
    exportBaselineMarkdown(),
    getRoles()
  ]);

  return (
    <div className='flex flex-1 flex-col'>
      <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
        <div className='flex flex-col justify-between gap-4 px-4 sm:flex-row sm:items-center lg:px-6'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>
              System Baseline
            </h1>
            <p className='text-muted-foreground mt-1'>
              Current state of all active requirements as of{' '}
              {new Date(report.generatedAt).toLocaleDateString()}
            </p>
          </div>
          <ExportButton content={markdown} filename='system-baseline.md' />
        </div>
        <div className='px-4 lg:px-6'>
          <BaselineReportView report={report} totalRoleCount={roles.length} />
        </div>
      </div>
    </div>
  );
}
