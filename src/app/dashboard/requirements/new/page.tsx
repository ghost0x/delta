import { getDomains } from '@/server/domains';
import { getRoles } from '@/server/roles';
import { RequirementForm } from '@/components/requirements/requirement-form';

export default async function NewRequirementPage() {
  const [domains, roles] = await Promise.all([getDomains(), getRoles()]);

  return (
    <div className='flex flex-1 flex-col'>
      <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
        <div className='px-4 lg:px-6'>
          <RequirementForm domains={domains} roles={roles} />
        </div>
      </div>
    </div>
  );
}
