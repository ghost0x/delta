'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { RoleSelector } from '@/components/shared/role-selector';
import { updateRequirement } from '@/server/requirements';
import { toast } from 'sonner';

type Domain = { id: string; name: string };
type Role = { id: string; name: string; isGlobal: boolean };

export function RequirementEditForm({
  requirementId,
  currentTitle,
  currentDomainId,
  currentRoleIds,
  domains,
  roles,
  onCancel
}: {
  requirementId: string;
  currentTitle: string;
  currentDomainId: string;
  currentRoleIds: string[];
  domains: Domain[];
  roles: Role[];
  onCancel: () => void;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(currentTitle);
  const [domainId, setDomainId] = useState(currentDomainId);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>(currentRoleIds);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !domainId) {
      toast.error('Title and Domain are required');
      return;
    }

    try {
      setIsSubmitting(true);
      await updateRequirement(requirementId, {
        title,
        domainId,
        roleIds: selectedRoleIds
      });
      toast.success('Requirement updated');
      onCancel();
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update requirement'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='edit-title'>Title *</Label>
        <Input
          id='edit-title'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className='space-y-2'>
        <Label>Domain *</Label>
        <Select value={domainId} onValueChange={setDomainId}>
          <SelectTrigger>
            <SelectValue placeholder='Select a domain' />
          </SelectTrigger>
          <SelectContent>
            {domains.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <RoleSelector
        roles={roles}
        selectedRoleIds={selectedRoleIds}
        onRoleIdsChange={setSelectedRoleIds}
        idPrefix='edit-'
      />

      <div className='flex gap-2'>
        <Button type='submit' size='sm' disabled={isSubmitting || !title.trim() || !domainId}>
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
        <Button type='button' size='sm' variant='outline' onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
