'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  deleteRevision,
  assignRevisionToRelease,
  unassignRevisionFromRelease,
  assignRevisionToBaseline
} from '@/server/revisions';
import { toast } from 'sonner';

type Release = { id: string; name: string; status: string };
type Role = { id: string; name: string };

type Revision = {
  id: string;
  type: string;
  title: string;
  content: string;
  createdAt: Date;
  release: { id: string; name: string; status: string; publishedAt: Date | null } | null;
  roles: { role: { id: string; name: string } }[];
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

function isPublished(revision: Revision) {
  return revision.release?.status === 'published';
}

function isDraft(revision: Revision) {
  return !revision.release || revision.release.status === 'draft';
}

function ReleaseSelector({
  revision,
  draftReleases
}: {
  revision: Revision;
  draftReleases: Release[];
}) {
  const router = useRouter();
  const [assigning, setAssigning] = useState(false);

  const currentValue = revision.release?.id ?? 'unassigned';

  const handleChange = async (value: string) => {
    try {
      setAssigning(true);
      if (value === 'baseline') {
        await assignRevisionToBaseline(revision.id);
        toast.success('Revision assigned to Baseline');
      } else if (value === 'unassigned') {
        await unassignRevisionFromRelease(revision.id);
        toast.success('Revision unassigned from release');
      } else {
        await assignRevisionToRelease(revision.id, value);
        toast.success('Revision assigned to release');
      }
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to assign release');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Select value={currentValue} onValueChange={handleChange} disabled={assigning}>
      <SelectTrigger className='h-7 w-[160px] text-xs'>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='unassigned'>Unassigned</SelectItem>
        <SelectItem value='baseline'>Baseline</SelectItem>
        {draftReleases.map((r) => (
          <SelectItem key={r.id} value={r.id}>
            {r.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function RevisionCard({
  revision,
  allRoles,
  draftReleases,
  onEdit
}: {
  revision: Revision;
  allRoles: Role[];
  draftReleases: Release[];
  onEdit: (revision: Revision) => void;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const draft = isDraft(revision);
  const published = isPublished(revision);

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

  return (
    <Card>
      <CardHeader className='py-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <RevisionTypeBadge type={revision.type} />
            {published ? (
              <Badge variant='default'>
                {revision.release!.name} (published)
              </Badge>
            ) : (
              <ReleaseSelector revision={revision} draftReleases={draftReleases} />
            )}
          </div>
          <div className='flex items-center gap-2'>
            {draft && (
              <>
                <Button variant='ghost' size='sm' onClick={() => onEdit(revision)}>
                  Edit
                </Button>
                <Button variant='ghost' size='sm' onClick={handleDelete} disabled={deleting}>
                  {deleting ? 'Deleting...' : 'Delete'}
                </Button>
              </>
            )}
            <CardTitle className='text-xs font-normal text-muted-foreground'>
              {new Date(revision.createdAt).toLocaleDateString()}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className='py-3 pt-0'>
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
      </CardContent>
    </Card>
  );
}

export function RevisionTimeline({
  revisions,
  roles,
  draftReleases,
  onEdit
}: {
  revisions: Revision[];
  roles: Role[];
  draftReleases: Release[];
  onEdit: (revision: Revision) => void;
}) {
  if (revisions.length === 0) {
    return (
      <p className='text-muted-foreground text-sm'>No revisions yet.</p>
    );
  }

  return (
    <div className='space-y-4'>
      {revisions.map((revision) => (
        <RevisionCard
          key={revision.id}
          revision={revision}
          allRoles={roles}
          draftReleases={draftReleases}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
