'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IconSparkles } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet';
import { RoleSelector } from '@/components/shared/role-selector';
import { createRevision, updateRevision } from '@/server/revisions';
import { toast } from 'sonner';
import type { AiRevisionOutput } from '@/lib/ai/revision-schema';

type Release = { id: string; name: string; status: string };
type Role = { id: string; name: string };

type Revision = {
  id: string;
  type: string;
  title: string;
  content: string;
  release: { id: string; name: string; status: string; publishedAt: Date | null } | null;
  roles: { role: { id: string; name: string } }[];
};

export function RevisionFormSheet({
  open,
  onOpenChange,
  requirementId,
  draftReleases,
  currentTitle,
  currentContent,
  currentRoleIds,
  roles,
  editingRevision
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requirementId: string;
  draftReleases: Release[];
  currentTitle: string;
  currentContent: string;
  currentRoleIds: string[];
  roles: Role[];
  editingRevision?: Revision | null;
}) {
  const router = useRouter();
  const isEditing = !!editingRevision;

  const [type, setType] = useState<'change' | 'deprecation'>('change');
  const [title, setTitle] = useState(currentTitle);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>(currentRoleIds);
  const [content, setContent] = useState('');
  const [releaseId, setReleaseId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [changeDescription, setChangeDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (editingRevision) {
      setType(editingRevision.type as 'change' | 'deprecation');
      setTitle(editingRevision.title);
      setSelectedRoleIds(editingRevision.roles.map((r) => r.role.id));
      setContent(editingRevision.content);
      setReleaseId(editingRevision.release?.id ?? '');
    } else {
      setType('change');
      setTitle(currentTitle);
      setSelectedRoleIds(currentRoleIds);
      setContent('');
      setReleaseId('');
      setChangeDescription('');
    }
  }, [editingRevision, currentTitle, currentRoleIds]);

  const handleGenerate = async () => {
    if (!changeDescription.trim()) {
      toast.error('Please describe the change you want to make');
      return;
    }

    setIsGenerating(true);
    try {
      const currentRoleNames = roles
        .filter((r) => currentRoleIds.includes(r.id))
        .map((r) => r.name);

      const response = await fetch('/api/ai/generate-revision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalTitle: currentTitle,
          originalContent: currentContent,
          originalRoles: currentRoleNames,
          changeDescription,
          roles: roles.map((r) => r.name),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate revision');
      }

      const data: AiRevisionOutput = await response.json();
      setTitle(data.title);
      setContent(data.content);
      const matchedRoleIds = roles
        .filter((r) => data.roleNames.includes(r.name))
        .map((r) => r.id);
      if (matchedRoleIds.length > 0) {
        setSelectedRoleIds(matchedRoleIds);
      }
      toast.success('Revision generated — review and submit when ready');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to generate revision'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (isEditing) {
        await updateRevision(editingRevision.id, {
          content,
          title,
          roleIds: selectedRoleIds
        });
        toast.success('Revision updated');
      } else {
        await createRevision({
          requirementId,
          type,
          title,
          content,
          roleIds: selectedRoleIds,
          releaseId: releaseId || undefined
        });
        toast.success('Revision created');
      }
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : `Failed to ${isEditing ? 'update' : 'create'} revision`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side='right' className='sm:max-w-lg overflow-y-auto'>
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Edit Revision' : 'New Revision'}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? 'Update this draft revision.'
              : 'Create a new revision for this requirement.'}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className='space-y-4 p-4 pt-0'>
          {!isEditing && (
            <div className='space-y-2'>
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as 'change' | 'deprecation')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='change'>Change</SelectItem>
                  <SelectItem value='deprecation'>Deprecation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {!isEditing && (
            <div className='space-y-2'>
              <Label>Describe your change</Label>
              <Textarea
                placeholder='e.g., Add a requirement that instructors must complete training before accessing the roster...'
                value={changeDescription}
                onChange={(e) => setChangeDescription(e.target.value)}
                rows={3}
                disabled={isGenerating}
              />
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={handleGenerate}
                disabled={isGenerating || !changeDescription.trim()}
                className='gap-1.5'
              >
                <IconSparkles className='size-4' />
                {isGenerating ? 'Generating...' : 'Generate with AI'}
              </Button>
            </div>
          )}

          <div className='space-y-2'>
            <Label htmlFor='sheet-rev-title'>Title</Label>
            <Input
              id='sheet-rev-title'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <RoleSelector
            roles={roles}
            selectedRoleIds={selectedRoleIds}
            onRoleIdsChange={setSelectedRoleIds}
            idPrefix='sheet-rev-'
          />

          <div className='space-y-2'>
            <Label>Content (Markdown)</Label>
            <Textarea
              placeholder={
                type === 'deprecation'
                  ? 'Explain why this requirement is being deprecated...'
                  : 'Describe the proposed change...'
              }
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
            />
          </div>

          {!isEditing && (
            <div className='space-y-2'>
              <Label>Assign to Release (optional)</Label>
              <Select value={releaseId} onValueChange={setReleaseId}>
                <SelectTrigger>
                  <SelectValue placeholder='Unassigned' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='none'>Unassigned</SelectItem>
                  {draftReleases.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button type='submit' className='w-full' disabled={isSubmitting || isGenerating}>
            {isSubmitting
              ? isEditing ? 'Saving...' : 'Creating...'
              : isEditing ? 'Save Changes' : 'Create Revision'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
