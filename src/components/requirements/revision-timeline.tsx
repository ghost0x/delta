'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RoleSelector } from '@/components/shared/role-selector';
import { updateRevision, deleteRevision } from '@/server/revisions';
import { toast } from 'sonner';

type Role = { id: string; name: string; isGlobal: boolean };

type Revision = {
  id: string;
  type: string;
  title: string;
  content: string;
  createdAt: Date;
  createdBy: { id: string; name: string };
  release: { id: string; name: string; status: string; publishedAt: Date | null } | null;
  roles: { role: { id: string; name: string; isGlobal: boolean } }[];
};

function RevisionTypeBadge({ type }: { type: string }) {
  switch (type) {
    case 'baseline':
      return <Badge variant='default'>Baseline</Badge>;
    case 'change':
      return <Badge variant='outline'>Change</Badge>;
    case 'deprecation':
      return <Badge variant='destructive'>Deprecation</Badge>;
    default:
      return <Badge variant='secondary'>{type}</Badge>;
  }
}

function isDraft(revision: Revision) {
  return !revision.release || revision.release.status === 'draft';
}

function RevisionCard({ revision, allRoles }: { revision: Revision; allRoles: Role[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(revision.title);
  const [content, setContent] = useState(revision.content);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>(
    revision.roles.map((r) => r.role.id)
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const draft = isDraft(revision);

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateRevision(revision.id, {
        content,
        title,
        roleIds: selectedRoleIds
      });
      toast.success('Revision updated');
      setEditing(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update revision');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteRevision(revision.id);
      toast.success('Revision deleted');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete revision');
    } finally {
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setTitle(revision.title);
    setContent(revision.content);
    setSelectedRoleIds(revision.roles.map((r) => r.role.id));
  };

  return (
    <Card>
      <CardHeader className='py-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <RevisionTypeBadge type={revision.type} />
            {revision.release ? (
              <Badge variant={revision.release.status === 'published' ? 'default' : 'secondary'}>
                {revision.release.name} ({revision.release.status})
              </Badge>
            ) : (
              <Badge variant='outline'>Unassigned</Badge>
            )}
          </div>
          <div className='flex items-center gap-2'>
            {draft && !editing && (
              <>
                <Button variant='ghost' size='sm' onClick={() => setEditing(true)}>
                  Edit
                </Button>
                <Button variant='ghost' size='sm' onClick={handleDelete} disabled={deleting}>
                  {deleting ? 'Deleting...' : 'Delete'}
                </Button>
              </>
            )}
            <CardTitle className='text-xs font-normal text-muted-foreground'>
              {revision.createdBy.name} &middot;{' '}
              {new Date(revision.createdAt).toLocaleDateString()}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className='py-3 pt-0'>
        {editing ? (
          <div className='space-y-3'>
            <div className='space-y-2'>
              <Label htmlFor={`edit-title-${revision.id}`}>Title</Label>
              <Input
                id={`edit-title-${revision.id}`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <RoleSelector
              roles={allRoles}
              selectedRoleIds={selectedRoleIds}
              onRoleIdsChange={setSelectedRoleIds}
              idPrefix={`edit-${revision.id}-`}
            />
            <div className='space-y-2'>
              <Label>Content</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
              />
            </div>
            <div className='flex gap-2'>
              <Button size='sm' onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button size='sm' variant='outline' onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className='space-y-2'>
            <div className='flex items-center gap-2 flex-wrap'>
              <span className='text-sm font-medium'>{revision.title}</span>
              {allRoles.length > 0 && revision.roles.length >= allRoles.length ? (
                <Badge variant='outline' className='text-xs'>All Roles</Badge>
              ) : (
                revision.roles.map((r) => (
                  <Badge key={r.role.id} variant='outline' className='text-xs'>
                    {r.role.name}
                  </Badge>
                ))
              )}
            </div>
            <div className='prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap'>
              {revision.content || <span className='text-muted-foreground italic'>No content</span>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function RevisionTimeline({
  revisions,
  roles
}: {
  revisions: Revision[];
  roles: Role[];
}) {
  if (revisions.length === 0) {
    return (
      <p className='text-muted-foreground text-sm'>No revisions yet.</p>
    );
  }

  return (
    <div className='space-y-4'>
      {revisions.map((revision) => (
        <RevisionCard key={revision.id} revision={revision} allRoles={roles} />
      ))}
    </div>
  );
}
