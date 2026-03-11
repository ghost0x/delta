'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { createRelease } from '@/server/releases';
import { toast } from 'sonner';

export function ReleaseForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      const release = await createRelease({ name, description: description || undefined });
      toast.success('Release created');
      router.push(`/dashboard/releases/${release.id}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create release'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>New Release</CardTitle>
          <CardDescription>
            Create a release to bundle revisions together. Publishing a release updates the system baseline.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='name'>Name *</Label>
            <Input
              id='name'
              placeholder='e.g., Spring 2026 Update'
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='description'>Description</Label>
            <Textarea
              id='description'
              placeholder='Describe the purpose of this release...'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className='flex gap-2 pt-2'>
            <Button type='submit' disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? 'Creating...' : 'Create Release'}
            </Button>
            <Button type='button' variant='outline' onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
