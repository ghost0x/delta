import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Revision = {
  id: string;
  type: string;
  content: string;
  createdAt: Date;
  createdBy: { id: string; name: string };
  release: { id: string; name: string; status: string; publishedAt: Date | null } | null;
};

function RevisionTypeBadge({ type }: { type: string }) {
  switch (type) {
    case 'baseline':
      return <Badge variant='default'>Baseline</Badge>;
    case 'change':
      return <Badge variant='outline'>Change</Badge>;
    case 'deprecation':
      return <Badge variant='destructive'>Deprecation</Badge>;
    default:
      return <Badge variant='secondary'>{type}</Badge>;
  }
}

export function RevisionTimeline({ revisions }: { revisions: Revision[] }) {
  if (revisions.length === 0) {
    return (
      <p className='text-muted-foreground text-sm'>No revisions yet.</p>
    );
  }

  return (
    <div className='space-y-4'>
      {revisions.map((revision, index) => (
        <Card key={revision.id} className={index === 0 ? 'border-primary' : ''}>
          <CardHeader className='py-3'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <RevisionTypeBadge type={revision.type} />
                {revision.release ? (
                  <Badge variant={revision.release.status === 'published' ? 'default' : 'secondary'}>
                    {revision.release.name} ({revision.release.status})
                  </Badge>
                ) : (
                  <Badge variant='outline'>Unassigned</Badge>
                )}
              </div>
              <CardTitle className='text-xs font-normal text-muted-foreground'>
                {revision.createdBy.name} &middot;{' '}
                {new Date(revision.createdAt).toLocaleDateString()}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className='py-3 pt-0'>
            <div className='prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap'>
              {revision.content || <span className='text-muted-foreground italic'>No content</span>}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
