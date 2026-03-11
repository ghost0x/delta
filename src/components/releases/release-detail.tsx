'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { publishRelease, deleteRelease } from '@/server/releases';
import { unassignRevisionFromRelease } from '@/server/revisions';
import { toast } from 'sonner';
import { IconTrash, IconSend, IconX } from '@tabler/icons-react';
import Link from 'next/link';

type ReleaseDetailProps = {
  release: {
    id: string;
    name: string;
    description: string | null;
    status: string;
    publishedAt: Date | null;
    createdAt: Date;
    createdBy: { id: string; name: string };
    revisions: {
      id: string;
      type: string;
      content: string;
      createdAt: Date;
      createdBy: { id: string; name: string };
      requirement: {
        id: string;
        title: string;
        domain: { id: string; name: string };
        roles: { role: { id: string; name: string; isGlobal: boolean } }[];
      };
    }[];
  };
};

export function ReleaseDetail({ release }: ReleaseDetailProps) {
  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const isDraft = release.status === 'draft';

  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      await publishRelease(release.id);
      toast.success('Release published! Baseline updated.');
      setPublishDialogOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to publish release'
      );
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteRelease(release.id);
      toast.success('Release deleted');
      router.push('/dashboard/releases');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete release'
      );
    }
  };

  const handleRemoveRevision = async (revisionId: string) => {
    try {
      await unassignRevisionFromRelease(revisionId);
      toast.success('Revision removed from release');
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to remove revision'
      );
    }
  };

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <div className='flex items-start justify-between'>
            <div>
              <CardTitle className='text-xl'>{release.name}</CardTitle>
              {release.description && (
                <p className='text-muted-foreground mt-1'>{release.description}</p>
              )}
              <div className='flex items-center gap-2 mt-2'>
                <Badge variant={isDraft ? 'secondary' : 'default'}>
                  {release.status}
                </Badge>
                <span className='text-muted-foreground text-sm'>
                  {release.publishedAt
                    ? `Published ${new Date(release.publishedAt).toLocaleDateString()}`
                    : `Created ${new Date(release.createdAt).toLocaleDateString()}`}
                </span>
                <span className='text-muted-foreground text-sm'>
                  by {release.createdBy.name}
                </span>
              </div>
            </div>
            {isDraft && (
              <div className='flex gap-2'>
                <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
                  <DialogTrigger asChild>
                    <Button disabled={release.revisions.length === 0}>
                      <IconSend className='size-4 mr-1' />
                      Publish
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Publish Release</DialogTitle>
                      <DialogDescription>
                        Publishing this release will update the system baseline. This
                        action cannot be undone. All {release.revisions.length}{' '}
                        revision(s) will become the new baseline.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant='outline'
                        onClick={() => setPublishDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handlePublish} disabled={isPublishing}>
                        {isPublishing ? 'Publishing...' : 'Confirm Publish'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button variant='destructive' size='icon' onClick={handleDelete}>
                  <IconTrash className='size-4' />
                </Button>
              </div>
            )}
            {!isDraft && (
              <Button asChild variant='outline'>
                <Link href={`/dashboard/reports/delta/${release.id}`}>
                  View Change Report
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>
            Revisions ({release.revisions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {release.revisions.length === 0 ? (
            <p className='text-muted-foreground text-sm text-center py-4'>
              No revisions assigned to this release yet. Create revisions from
              individual requirement pages.
            </p>
          ) : (
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Requirement</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Author</TableHead>
                    {isDraft && <TableHead></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {release.revisions.map((rev) => (
                    <TableRow key={rev.id}>
                      <TableCell>
                        <Link
                          href={`/dashboard/requirements/${rev.requirement.id}`}
                          className='font-medium hover:underline'
                        >
                          {rev.requirement.title}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant='secondary'>
                          {rev.requirement.domain.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            rev.type === 'deprecation'
                              ? 'destructive'
                              : rev.type === 'change'
                                ? 'outline'
                                : 'default'
                          }
                        >
                          {rev.type}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-muted-foreground text-sm'>
                        {rev.createdBy.name}
                      </TableCell>
                      {isDraft && (
                        <TableCell>
                          <Button
                            size='icon'
                            variant='ghost'
                            onClick={() => handleRemoveRevision(rev.id)}
                          >
                            <IconX className='size-4' />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
