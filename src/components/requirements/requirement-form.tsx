'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { createRequirement } from '@/server/requirements';
import { toast } from 'sonner';

type Domain = { id: string; name: string };
type Role = { id: string; name: string; isGlobal: boolean };

export function RequirementForm({
  domains,
  roles
}: {
  domains: Domain[];
  roles: Role[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [domainId, setDomainId] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleRole = (roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId) ? prev.filter((r) => r !== roleId) : [...prev, roleId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !domainId) {
      toast.error('Title and Domain are required');
      return;
    }

    try {
      setIsSubmitting(true);
      await createRequirement({
        title,
        domainId,
        roleIds: selectedRoles,
        content
      });
      toast.success('Requirement created');
      router.push('/dashboard');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create requirement'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>New Requirement</CardTitle>
          <CardDescription>
            Create a new business rule. Only Title and Domain are required.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='title'>Title *</Label>
            <Input
              id='title'
              placeholder='e.g., Instructors can archive rosters'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='domain'>Domain *</Label>
            <Select value={domainId} onValueChange={setDomainId}>
              <SelectTrigger>
                <SelectValue placeholder='Select a domain' />
              </SelectTrigger>
              <SelectContent>
                {domains.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {domains.length === 0 && (
              <p className='text-sm text-muted-foreground'>
                No domains yet.{' '}
                <a href='/dashboard/domains' className='underline'>
                  Create one first
                </a>
                .
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <Label>Roles</Label>
            <div className='grid grid-cols-2 gap-2 sm:grid-cols-3'>
              {roles.map((role) => (
                <div key={role.id} className='flex items-center gap-2'>
                  <Checkbox
                    id={`role-${role.id}`}
                    checked={selectedRoles.includes(role.id)}
                    onCheckedChange={() => toggleRole(role.id)}
                  />
                  <Label htmlFor={`role-${role.id}`} className='text-sm font-normal'>
                    {role.isGlobal ? `${role.name} (All)` : role.name}
                  </Label>
                </div>
              ))}
            </div>
            {roles.length === 0 && (
              <p className='text-sm text-muted-foreground'>
                No roles yet.{' '}
                <a href='/dashboard/roles' className='underline'>
                  Create some first
                </a>
                .
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='content'>Description (Markdown)</Label>
            <Textarea
              id='content'
              placeholder='Describe the business rule in detail. Markdown is supported.'
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
            />
          </div>

          <div className='flex gap-2 pt-2'>
            <Button type='submit' disabled={isSubmitting || !title.trim() || !domainId}>
              {isSubmitting ? 'Creating...' : 'Create Requirement'}
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
