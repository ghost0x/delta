import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { DeltaReport } from '@/server/reports';

export function DeltaReportView({ report }: { report: DeltaReport }) {
  const domains = Object.keys(report.items).sort();

  if (domains.length === 0) {
    return (
      <p className='text-muted-foreground text-center py-8'>
        No changes in this release.
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
                    {item.revisionType === 'deprecation' && (
                      <Badge variant='destructive'>Deprecated</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className='py-3 pt-0 space-y-3'>
                  <div>
                    <p className='text-sm font-medium text-muted-foreground mb-1'>
                      From:
                    </p>
                    <div className='prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap bg-muted/50 rounded-md p-3'>
                      {item.fromContent ?? (
                        <span className='italic text-muted-foreground'>
                          New requirement
                        </span>
                      )}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className='text-sm font-medium text-muted-foreground mb-1'>
                      To:
                    </p>
                    <div className='prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap bg-muted/50 rounded-md p-3'>
                      {item.toContent}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
