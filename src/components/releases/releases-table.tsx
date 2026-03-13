'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

type ReleaseRow = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  publishedAt: Date | null;
  createdAt: Date;
  _count: { revisions: number };
};

export function ReleasesTable({ releases }: { releases: ReleaseRow[] }) {
  if (releases.length === 0) {
    return (
      <div className='text-center py-12'>
        <p className='text-muted-foreground'>No releases found.</p>
        <p className='text-muted-foreground text-sm mt-1'>
          Create your first release to start bundling revisions.
        </p>
      </div>
    );
  }

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Revisions</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {releases.map((release) => (
            <TableRow key={release.id}>
              <TableCell>
                <Link
                  href={`/dashboard/releases/${release.id}`}
                  className='font-medium hover:underline'
                >
                  {release.name}
                </Link>
                {release.description && (
                  <p className='text-muted-foreground text-sm mt-0.5'>
                    {release.description}
                  </p>
                )}
              </TableCell>
              <TableCell>
                <Badge
                  variant={release.status === 'published' ? 'default' : 'secondary'}
                >
                  {release.status}
                </Badge>
              </TableCell>
              <TableCell>{release._count.revisions}</TableCell>
              <TableCell className='text-muted-foreground text-sm'>
                {release.name === 'Baseline'
                  ? '—'
                  : release.publishedAt
                    ? new Date(release.publishedAt).toLocaleDateString()
                    : new Date(release.createdAt).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
