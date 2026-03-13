'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RevisionTimeline } from '@/components/requirements/revision-timeline';
import { RevisionFormSheet } from '@/components/requirements/revision-form-sheet';

type Release = { id: string; name: string; status: string };
type Role = { id: string; name: string };
type Revision = {
  id: string;
  type: string;
  status: string;
  title: string;
  content: string;
  createdAt: Date;
  release: { id: string; name: string; status: string; publishedAt: Date | null } | null;
  roles: { role: { id: string; name: string } }[];
};

export function RequirementDetailClient({
  requirementId,
  revisions,
  draftReleases,
  currentTitle,
  currentContent,
  currentRoleIds,
  roles
}: {
  requirementId: string;
  revisions: Revision[];
  draftReleases: Release[];
  currentTitle: string;
  currentContent: string;
  currentRoleIds: string[];
  roles: Role[];
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingRevision, setEditingRevision] = useState<Revision | null>(null);

  const handleNewRevision = () => {
    setEditingRevision(null);
    setSheetOpen(true);
  };

  const handleEditRevision = (revision: Revision) => {
    setEditingRevision(revision);
    setSheetOpen(true);
  };

  return (
    <>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-lg font-semibold'>Revision History</h2>
        <Button onClick={handleNewRevision}>+ New Revision</Button>
      </div>
      <RevisionTimeline
        revisions={revisions}
        roles={roles}
        draftReleases={draftReleases}
        onEdit={handleEditRevision}
      />
      <RevisionFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        requirementId={requirementId}
        draftReleases={draftReleases}
        currentTitle={currentTitle}
        currentContent={currentContent}
        currentRoleIds={currentRoleIds}
        roles={roles}
        editingRevision={editingRevision}
      />
    </>
  );
}
