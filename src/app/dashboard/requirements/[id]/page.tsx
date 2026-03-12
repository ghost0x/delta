import { notFound } from 'next/navigation';
import { getRequirement } from '@/server/requirements';
import { getReleases } from '@/server/releases';
import { getDomains } from '@/server/domains';
import { getRoles } from '@/server/roles';
import { RevisionTimeline } from '@/components/requirements/revision-timeline';
import { RevisionForm } from '@/components/requirements/revision-form';
import { RequirementHeader } from '@/components/requirements/requirement-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default async function RequirementDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [requirement, releases, domains, roles] = await Promise.all([
    getRequirement(id),
    getReleases({ status: 'draft' }),
    getDomains(),
    getRoles()
  ]);

  if (!requirement) notFound();

  const draftReleases = releases.map((r) => ({
    id: r.id,
    name: r.name,
    status: r.status
  }));

  const rolesList = roles.map((r) => ({ id: r.id, name: r.name, isGlobal: r.isGlobal }));

  const hasDraft = requirement.revisions.some(
    (r) => !r.release || r.release.status === 'draft'
  );

  const currentRoleIds = requirement.roles.map((r) => r.role.id);

  return (
    <div className='flex flex-1 flex-col'>
      <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
        <div className='px-4 lg:px-6'>
          <RequirementHeader
            requirement={{
              id: requirement.id,
              title: requirement.title,
              domain: requirement.domain,
              roles: requirement.roles,
              createdBy: requirement.createdBy,
              createdAt: requirement.createdAt,
              isDeprecated: requirement.isDeprecated ?? false,
              hasDraft,
              hasBaseline: !!requirement.currentBaseline
            }}
            domains={domains.map((d) => ({ id: d.id, name: d.name }))}
            roles={rolesList}
          />
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
            <RevisionTimeline revisions={requirement.revisions} roles={rolesList} />
          </div>
          <div>
            <RevisionForm
              requirementId={requirement.id}
              draftReleases={draftReleases}
              currentTitle={requirement.title}
              currentRoleIds={currentRoleIds}
              roles={rolesList}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
