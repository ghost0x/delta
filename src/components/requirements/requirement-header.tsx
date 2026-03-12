'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { StatusBadge } from '@/components/requirements/status-badge';
import { updateRequirement, deleteRequirement } from '@/server/requirements';
import { toast } from 'sonner';

type Domain = { id: string; name: string };
type Role = { id: string; name: string; isGlobal: boolean };

export function RequirementHeader({
  requirement,
  domains,
  roles,
  baselineRoles
}: {
  requirement: {
    id: string;
    title: string;
    domain: { id: string; name: string };
    createdBy: { name: string };
    createdAt: Date;
    isDeprecated: boolean;
    hasDraft: boolean;
    hasBaseline: boolean;
  };
  domains: Domain[];
  roles: Role[];
  baselineRoles: { role: { id: string; name: string; isGlobal: boolean } }[];
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  // Inline title editing
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(requirement.title);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Inline domain editing
  const [editingDomain, setEditingDomain] = useState(false);

  useEffect(() => {
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [editingTitle]);

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

  async function saveTitle() {
    const trimmed = titleValue.trim();
    if (!trimmed) {
      setTitleValue(requirement.title);
      setEditingTitle(false);
      return;
    }
    if (trimmed === requirement.title) {
      setEditingTitle(false);
      return;
    }
    try {
      await updateRequirement(requirement.id, { title: trimmed });
      toast.success('Title updated');
      setEditingTitle(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update title');
      setTitleValue(requirement.title);
      setEditingTitle(false);
    }
  }

  async function saveDomain(domainId: string) {
    if (domainId === requirement.domain.id) {
      setEditingDomain(false);
      return;
    }
    try {
      await updateRequirement(requirement.id, { domainId });
      toast.success('Domain updated');
      setEditingDomain(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update domain');
      setEditingDomain(false);
    }
  }

  const displayRoles = baselineRoles.length > 0 ? baselineRoles : [];

  return (
    <div className='flex items-start justify-between'>
      <div>
        {editingTitle ? (
          <input
            ref={titleInputRef}
            className='text-2xl font-bold tracking-tight bg-transparent border-b-2 border-primary outline-none w-full'
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveTitle();
              if (e.key === 'Escape') {
                setTitleValue(requirement.title);
                setEditingTitle(false);
              }
            }}
          />
        ) : (
          <h1
            className='text-2xl font-bold tracking-tight cursor-pointer hover:text-primary/80 transition-colors'
            onClick={() => setEditingTitle(true)}
            title='Click to edit'
          >
            {requirement.title}
          </h1>
        )}
        <div className='flex items-center gap-2 mt-2'>
          {editingDomain ? (
            <Select
              defaultValue={requirement.domain.id}
              onValueChange={(v) => saveDomain(v)}
            >
              <SelectTrigger className='w-auto h-7 text-xs'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {domains.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Badge
              variant='secondary'
              className='cursor-pointer hover:bg-secondary/80 transition-colors'
              onClick={() => setEditingDomain(true)}
              title='Click to change domain'
            >
              {requirement.domain.name}
            </Badge>
          )}
          {roles.length > 0 && displayRoles.length >= roles.length ? (
            <Badge variant='outline'>All Roles</Badge>
          ) : (
            displayRoles.map((r) => (
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
      </div>
    </div>
  );
}
