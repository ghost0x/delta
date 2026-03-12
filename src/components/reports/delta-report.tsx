import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DeltaReport } from '@/server/reports';
import { DiffView } from './diff-view';

function rolesChanged(from: string[] | null, to: string[]): boolean {
  if (!from) return false;
  const fromSet = new Set(from);
  const toSet = new Set(to);
  return fromSet.size !== toSet.size || [...fromSet].some((r) => !toSet.has(r));
}

export function DeltaReportView({ report, totalRoleCount }: { report: DeltaReport; totalRoleCount: number }) {
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
                      {item.toTitle}
                    </CardTitle>
                    {totalRoleCount > 0 && item.toRoles.length >= totalRoleCount ? (
                      <Badge variant='outline'>All Roles</Badge>
                    ) : (
                      item.toRoles.map((role) => (
                        <Badge key={role} variant='outline'>
                          {role}
                        </Badge>
                      ))
                    )}
                    {item.revisionType === 'deprecation' && (
                      <Badge variant='destructive'>Deprecated</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className='py-3 pt-0 space-y-3'>
                  {item.fromTitle && item.fromTitle !== item.toTitle && (
                    <div className='text-sm'>
                      <span className='font-medium text-muted-foreground'>Title changed: </span>
                      <span className='line-through text-muted-foreground'>{item.fromTitle}</span>
                      {' → '}
                      <span className='font-medium'>{item.toTitle}</span>
                    </div>
                  )}
                  {rolesChanged(item.fromRoles, item.toRoles) && (
                    <div className='text-sm'>
                      <span className='font-medium text-muted-foreground'>Roles changed: </span>
                      <span className='text-muted-foreground'>
                        {item.fromRoles?.join(', ') || 'none'}
                      </span>
                      {' → '}
                      <span className='font-medium'>
                        {item.toRoles.join(', ') || 'none'}
                      </span>
                    </div>
                  )}
                  <DiffView fromContent={item.fromContent} toContent={item.toContent} />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
