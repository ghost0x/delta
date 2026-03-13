'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

type Role = { id: string; name: string };

interface RoleSelectorProps {
  roles: Role[];
  selectedRoleIds: string[];
  onRoleIdsChange: (roleIds: string[]) => void;
  idPrefix?: string;
}

export function RoleSelector({
  roles,
  selectedRoleIds,
  onRoleIdsChange,
  idPrefix = ''
}: RoleSelectorProps) {
  const allRoleIds = roles.map((r) => r.id);
  const allSelected = allRoleIds.length > 0 && allRoleIds.every((id) => selectedRoleIds.includes(id));

  const toggleAll = (checked: boolean) => {
    onRoleIdsChange(checked ? allRoleIds : []);
  };

  const toggleRole = (roleId: string) => {
    onRoleIdsChange(
      selectedRoleIds.includes(roleId)
        ? selectedRoleIds.filter((r) => r !== roleId)
        : [...selectedRoleIds, roleId]
    );
  };

  return (
    <div className='space-y-2'>
      <Label>Roles</Label>
      <div className='flex items-center gap-2'>
        <Checkbox
          id={`${idPrefix}all-roles`}
          checked={allSelected}
          onCheckedChange={(checked) => toggleAll(checked === true)}
        />
        <Label htmlFor={`${idPrefix}all-roles`} className='text-sm font-normal'>
          All Roles
        </Label>
      </div>
      {!allSelected && (
        <div className='grid grid-cols-2 gap-2 sm:grid-cols-3'>
          {roles.map((role) => (
            <div key={role.id} className='flex items-center gap-2'>
              <Checkbox
                id={`${idPrefix}role-${role.id}`}
                checked={selectedRoleIds.includes(role.id)}
                onCheckedChange={() => toggleRole(role.id)}
              />
              <Label htmlFor={`${idPrefix}role-${role.id}`} className='text-sm font-normal'>
                {role.name}
              </Label>
            </div>
          ))}
        </div>
      )}
      {roles.length === 0 && (
        <p className='text-sm text-muted-foreground'>
          No roles yet.{' '}
          <a href='/dashboard/roles' className='underline'>
            Create some first
          </a>
          .
        </p>
      )}
    </div>
  );
}
