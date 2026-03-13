import { notFound } from 'next/navigation';
import { getRequirement } from '@/server/requirements';
import { getReleases } from '@/server/releases';
import { getDomains } from '@/server/domains';
import { getRoles } from '@/server/roles';
import { RequirementHeader } from '@/components/requirements/requirement-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RequirementDetailClient } from './detail-client';

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

  const rolesList = roles.map((r) => ({ id: r.id, name: r.name }));

  const baselineRoles = requirement.currentBaseline
    ? (requirement.currentBaseline as { roles: { role: { id: string; name: string } }[] }).roles ?? []
    : requirement.roles;

  const currentRoleIds = baselineRoles.map((r: { role: { id: string } }) => r.role.id);

  return (
    <div className='flex flex-1 flex-col'>
      <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
        <div className='px-4 lg:px-6'>
          <RequirementHeader
            requirement={{
              id: requirement.id,
              title: requirement.title,
              derivedStatus: requirement.derivedStatus,
              domain: requirement.domain,
              category: requirement.category,
              createdAt: requirement.createdAt
            }}
            domains={domains.map((d) => ({
              id: d.id,
              name: d.name,
              categories: d.categories.map((c) => ({ id: c.id, name: c.name, domainId: c.domainId }))
            }))}
            roles={rolesList}
            baselineRoles={baselineRoles}
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

        <div className='px-4 lg:px-6'>
          <RequirementDetailClient
            requirementId={requirement.id}
            revisions={requirement.revisions}
            draftReleases={draftReleases}
            currentTitle={requirement.title}
            currentContent={requirement.currentBaseline?.content ?? ''}
            currentRoleIds={currentRoleIds}
            roles={rolesList}
          />
        </div>
      </div>
    </div>
  );
}
