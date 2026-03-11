import { notFound } from 'next/navigation';
import { getRequirement } from '@/server/requirements';
import { getReleases } from '@/server/releases';
import { RevisionTimeline } from '@/components/requirements/revision-timeline';
import { RevisionForm } from '@/components/requirements/revision-form';
import { StatusBadge } from '@/components/requirements/status-badge';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default async function RequirementDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [requirement, releases] = await Promise.all([
    getRequirement(id),
    getReleases({ status: 'draft' })
  ]);

  if (!requirement) notFound();

  const draftReleases = releases.map((r) => ({
    id: r.id,
    name: r.name,
    status: r.status
  }));

  return (
    <div className='flex flex-1 flex-col'>
      <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
        <div className='px-4 lg:px-6'>
          <div className='flex items-start justify-between'>
            <div>
              <h1 className='text-2xl font-bold tracking-tight'>
                {requirement.title}
              </h1>
              <div className='flex items-center gap-2 mt-2'>
                <Badge variant='secondary'>{requirement.domain.name}</Badge>
                {requirement.roles.map((r) => (
                  <Badge key={r.role.id} variant='outline'>
                    {r.role.isGlobal ? 'All Roles' : r.role.name}
                  </Badge>
                ))}
                <StatusBadge
                  isDeprecated={requirement.isDeprecated}
                  hasDraft={requirement.revisions.some(
                    (r) => !r.release || r.release.status === 'draft'
                  )}
                  hasBaseline={!!requirement.currentBaseline}
                />
              </div>
              <p className='text-muted-foreground text-sm mt-1'>
                Created by {requirement.createdBy.name} on{' '}
                {new Date(requirement.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {requirement.currentBaseline && (
          <div className='px-4 lg:px-6'>
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Current Baseline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap'>
                  {requirement.currentBaseline.content}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className='px-4 lg:px-6'>
          <Separator />
        </div>

        <div className='grid grid-cols-1 gap-6 px-4 lg:grid-cols-2 lg:px-6'>
          <div>
            <h2 className='text-lg font-semibold mb-4'>Revision History</h2>
            <RevisionTimeline revisions={requirement.revisions} />
          </div>
          <div>
            <RevisionForm
              requirementId={requirement.id}
              draftReleases={draftReleases}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
