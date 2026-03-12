'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/requirements/status-badge';
import { RequirementEditForm } from '@/components/requirements/requirement-edit-form';
import { deleteRequirement } from '@/server/requirements';

type Domain = { id: string; name: string };
type Role = { id: string; name: string; isGlobal: boolean };

export function RequirementHeader({
  requirement,
  domains,
  roles
}: {
  requirement: {
    id: string;
    title: string;
    domain: { id: string; name: string };
    roles: { role: { id: string; name: string; isGlobal: boolean } }[];
    createdBy: { name: string };
    createdAt: Date;
    isDeprecated: boolean;
    hasDraft: boolean;
    hasBaseline: boolean;
  };
  domains: Domain[];
  roles: Role[];
}) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this requirement and all its revisions? This cannot be undone.')) {
      return;
    }
    setDeleting(true);
    try {
      await deleteRequirement(requirement.id);
      router.push('/dashboard/requirements');
    } catch {
      setDeleting(false);
      alert('Failed to delete requirement.');
    }
  }

  if (editing) {
    return (
      <RequirementEditForm
        requirementId={requirement.id}
        currentTitle={requirement.title}
        currentDomainId={requirement.domain.id}
        currentRoleIds={requirement.roles.map((r) => r.role.id)}
        domains={domains}
        roles={roles}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <div className='flex items-start justify-between'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>
          {requirement.title}
        </h1>
        <div className='flex items-center gap-2 mt-2'>
          <Badge variant='secondary'>{requirement.domain.name}</Badge>
          {roles.length > 0 && requirement.roles.length >= roles.length ? (
            <Badge variant='outline'>All Roles</Badge>
          ) : (
            requirement.roles.map((r) => (
              <Badge key={r.role.id} variant='outline'>
                {r.role.name}
              </Badge>
            ))
          )}
          <StatusBadge
            isDeprecated={requirement.isDeprecated}
            hasDraft={requirement.hasDraft}
            hasBaseline={requirement.hasBaseline}
          />
        </div>
        <p className='text-muted-foreground text-sm mt-1'>
          Created by {requirement.createdBy.name} on{' '}
          {new Date(requirement.createdAt).toLocaleDateString()}
        </p>
      </div>
      <div className='flex gap-2'>
        <Button
          variant='destructive'
          size='sm'
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? 'Deleting...' : 'Delete'}
        </Button>
        <Button variant='outline' size='sm' onClick={() => setEditing(true)}>
          Edit
        </Button>
      </div>
    </div>
  );
}
