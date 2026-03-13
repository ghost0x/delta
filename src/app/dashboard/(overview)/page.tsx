import { getRequirements } from '@/server/requirements';
import { getRoles } from '@/server/roles';
import { getDomains } from '@/server/domains';
import { RequirementsTable } from '@/components/requirements/requirements-table';
import { RequirementsFilter } from '@/components/requirements/requirements-filter';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { IconPlus } from '@tabler/icons-react';

export default async function DashboardPage({
  searchParams
}: {
  searchParams: Promise<{ domainId?: string; categoryId?: string; roleId?: string; search?: string; status?: string }>;
}) {
  const params = await searchParams;
  const filters = {
    domainId: params.domainId || undefined,
    categoryId: params.categoryId || undefined,
    roleId: params.roleId || undefined,
    search: params.search || undefined,
    status: params.status || undefined,
  };

  const [requirementsResult, roles, domains] = await Promise.all([
    getRequirements({ ...filters, pageSize: 0 }),
    getRoles(),
    getDomains()
  ]);
  const requirements = requirementsResult.data;

  return (
    <div className='flex flex-1 flex-col'>
      <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
        <div className='flex flex-col justify-between gap-4 px-4 sm:flex-row sm:items-center lg:px-6'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Requirements</h1>
            <p className='text-muted-foreground mt-1'>
              Manage your business rules and requirements.
            </p>
          </div>
          <Button asChild>
            <Link href='/dashboard/requirements/new'>
              <IconPlus className='size-4 mr-1' />
              New Requirement
            </Link>
          </Button>
        </div>
        <div className='px-4 lg:px-6'>
          <RequirementsFilter domains={domains} roles={roles} />
        </div>
        <div className='px-4 lg:px-6'>
          <RequirementsTable requirements={requirements} totalRoleCount={roles.length} />
        </div>
      </div>
    </div>
  );
}
