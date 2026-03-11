'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
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
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { createRevision } from '@/server/revisions';
import { toast } from 'sonner';

type Release = { id: string; name: string; status: string };

export function RevisionForm({
  requirementId,
  draftReleases
}: {
  requirementId: string;
  draftReleases: Release[];
}) {
  const router = useRouter();
  const [type, setType] = useState<'change' | 'deprecation'>('change');
  const [content, setContent] = useState('');
  const [releaseId, setReleaseId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await createRevision({
        requirementId,
        type,
        content,
        releaseId: releaseId || undefined
      });
      toast.success('Revision created');
      setContent('');
      setReleaseId('');
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create revision'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>Create Revision</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
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
              rows={6}
            />
          </div>

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

          <Button type='submit' disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Revision'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
