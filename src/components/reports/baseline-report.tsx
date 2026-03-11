import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { BaselineReport } from '@/server/reports';

export function BaselineReportView({ report }: { report: BaselineReport }) {
  const domains = Object.keys(report.items).sort();

  if (domains.length === 0) {
    return (
      <p className='text-muted-foreground text-center py-8'>
        No published requirements yet. Publish a release to establish the baseline.
      </p>
    );
  }

  return (
    <div className='space-y-6'>
      {domains.map((domain) => (
        <div key={domain}>
          <h2 className='text-xl font-semibold mb-3'>{domain}</h2>
          <div className='space-y-4'>
            {report.items[domain].map((item) => (
              <Card key={item.requirementId}>
                <CardHeader className='py-3'>
                  <div className='flex items-center gap-2'>
                    <CardTitle className='text-base'>
                      {item.requirementTitle}
                    </CardTitle>
                    {item.roles.map((role) => (
                      <Badge key={role} variant='outline'>
                        {role}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className='py-3 pt-0'>
                  <div className='prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap'>
                    {item.content}
                  </div>
                  <p className='text-xs text-muted-foreground mt-2'>
                    Last updated in: {item.releaseName}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
