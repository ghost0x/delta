import { getDomains } from '@/server/domains';
import { getRoles } from '@/server/roles';
import { getReleases } from '@/server/releases';
import { RequirementForm } from '@/components/requirements/requirement-form';

export default async function NewRequirementPage() {
  const [domains, roles, releases] = await Promise.all([
    getDomains(),
    getRoles(),
    getReleases({ status: 'draft' })
  ]);

  const draftReleases = releases.map((r) => ({ id: r.id, name: r.name }));

  return (
    <div className='flex flex-1 flex-col'>
      <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
        <div className='px-4 lg:px-6'>
          <RequirementForm
            domains={domains.map((d) => ({
              id: d.id,
              name: d.name,
              description: d.description,
              categories: d.categories.map((c) => ({ id: c.id, name: c.name, description: c.description, domainId: c.domainId }))
            }))}
            roles={roles.map((r) => ({ id: r.id, name: r.name, description: r.description }))}
            draftReleases={draftReleases}
          />
        </div>
      </div>
    </div>
  );
}
