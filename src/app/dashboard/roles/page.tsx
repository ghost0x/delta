import { getRoles } from '@/server/roles';
import { RoleManager } from '@/components/roles/role-manager';

export default async function RolesPage() {
  const roles = await getRoles();

  return (
    <div className='flex flex-1 flex-col'>
      <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
        <div className='px-4 lg:px-6'>
          <h1 className='text-2xl font-bold tracking-tight'>Roles</h1>
          <p className='text-muted-foreground mt-1'>
            Manage user types that are impacted by requirements.
          </p>
        </div>
        <div className='px-4 lg:px-6'>
          <RoleManager roles={roles} />
        </div>
      </div>
    </div>
  );
}
