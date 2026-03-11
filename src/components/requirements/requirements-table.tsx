'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/requirements/status-badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

type RequirementRow = {
  id: string;
  title: string;
  domain: { id: string; name: string };
  roles: { role: { id: string; name: string; isGlobal: boolean } }[];
  currentBaseline: { content: string; type: string } | null;
  hasDraft: boolean;
  isDeprecated: boolean;
  updatedAt: Date;
};

export function RequirementsTable({
  requirements
}: {
  requirements: RequirementRow[];
}) {
  if (requirements.length === 0) {
    return (
      <div className='text-center py-12'>
        <p className='text-muted-foreground'>No requirements found.</p>
        <p className='text-muted-foreground text-sm mt-1'>
          Create your first requirement to get started.
        </p>
      </div>
    );
  }

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Domain</TableHead>
            <TableHead>Roles</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requirements.map((req) => (
            <TableRow key={req.id}>
              <TableCell>
                <Link
                  href={`/dashboard/requirements/${req.id}`}
                  className='font-medium hover:underline'
                >
                  {req.title}
                </Link>
              </TableCell>
              <TableCell>
                <Badge variant='secondary'>{req.domain.name}</Badge>
              </TableCell>
              <TableCell>
                <div className='flex flex-wrap gap-1'>
                  {req.roles.map((r) => (
                    <Badge key={r.role.id} variant='outline'>
                      {r.role.isGlobal ? 'All Roles' : r.role.name}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge
                  isDeprecated={req.isDeprecated}
                  hasDraft={req.hasDraft}
                  hasBaseline={!!req.currentBaseline}
                />
              </TableCell>
              <TableCell className='text-muted-foreground text-sm'>
                {new Date(req.updatedAt).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
