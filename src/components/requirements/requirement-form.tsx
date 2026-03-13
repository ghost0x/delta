'use client';

import { useState, useMemo } from 'react';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RoleSelector } from '@/components/shared/role-selector';
import { createRequirement } from '@/server/requirements';
import { toast } from 'sonner';
import { AiGenerateDialog } from './ai-generate-dialog';
import type { AiRequirementOutput } from '@/lib/ai/requirement-schema';

type Category = { id: string; name: string; description: string | null; domainId: string };
type Domain = { id: string; name: string; description: string | null; categories: Category[] };
type Role = { id: string; name: string; description: string | null };
type Release = { id: string; name: string };

export function RequirementForm({
  domains,
  roles,
  draftReleases = []
}: {
  domains: Domain[];
  roles: Role[];
  draftReleases?: Release[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [domainId, setDomainId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>(roles.map((r) => r.id));
  const [content, setContent] = useState('');
  const [releaseId, setReleaseId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestedDomain, setSuggestedDomain] = useState<string | null>(null);

  const domainCategories = useMemo(() => {
    const domain = domains.find((d) => d.id === domainId);
    return domain?.categories ?? [];
  }, [domains, domainId]);

  const handleDomainChange = (newDomainId: string) => {
    setDomainId(newDomainId);
    setCategoryId('');
  };

  const handleAiGenerated = (data: AiRequirementOutput) => {
    setTitle(data.title);
    setContent(data.description);

    const matchedDomain = domains.find(
      (d) => d.name.toLowerCase() === data.domain.name.toLowerCase()
    );
    if (matchedDomain) {
      setDomainId(matchedDomain.id);
      setSuggestedDomain(null);

      if (data.category) {
        const matchedCategory = matchedDomain.categories.find(
          (c) => c.name.toLowerCase() === data.category!.name.toLowerCase()
        );
        if (matchedCategory) {
          setCategoryId(matchedCategory.id);
        } else {
          setCategoryId('');
        }
      }
    } else {
      setDomainId('');
      setCategoryId('');
      setSuggestedDomain(data.domain.name);
    }

    const matchedRoleIds = data.roleNames
      .map((name) => roles.find((r) => r.name.toLowerCase() === name.toLowerCase()))
      .filter((r): r is Role => r !== undefined)
      .map((r) => r.id);

    if (matchedRoleIds.length === roles.length && roles.length > 0) {
      setSelectedRoleIds(roles.map((r) => r.id));
    } else if (matchedRoleIds.length > 0) {
      setSelectedRoleIds(matchedRoleIds);
    } else {
      setSelectedRoleIds(roles.map((r) => r.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !domainId || !categoryId) {
      toast.error('Title, Domain, and Category are required');
      return;
    }

    try {
      setIsSubmitting(true);
      await createRequirement({
        title,
        domainId,
        categoryId,
        roleIds: selectedRoleIds,
        content,
        releaseId: releaseId || undefined
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
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle>New Requirement</CardTitle>
              <CardDescription>
                Create a new business rule. Title, Domain, and Category are required.
              </CardDescription>
            </div>
            <AiGenerateDialog
              domains={domains}
              roles={roles}
              onGenerated={handleAiGenerated}
            />
          </div>
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

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='domain'>Domain *</Label>
              <Select value={domainId} onValueChange={handleDomainChange}>
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
              {suggestedDomain && (
                <p className='text-sm text-muted-foreground flex items-center gap-2'>
                  <Badge variant='secondary'>AI Suggested</Badge>
                  <span>
                    &quot;{suggestedDomain}&quot; — please{' '}
                    <a href='/dashboard/domains' className='underline'>
                      create this domain
                    </a>{' '}
                    first, then select it.
                  </span>
                </p>
              )}
              {domains.length === 0 && !suggestedDomain && (
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
              <Label htmlFor='category'>Category *</Label>
              <Select
                value={categoryId}
                onValueChange={setCategoryId}
                disabled={!domainId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={domainId ? 'Select a category' : 'Select a domain first'} />
                </SelectTrigger>
                <SelectContent>
                  {domainCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {domainId && domainCategories.length === 0 && (
                <p className='text-sm text-muted-foreground'>
                  No categories for this domain.{' '}
                  <a href='/dashboard/domains' className='underline'>
                    Create one first
                  </a>
                  .
                </p>
              )}
            </div>
          </div>

          <RoleSelector
            roles={roles}
            selectedRoleIds={selectedRoleIds}
            onRoleIdsChange={setSelectedRoleIds}
          />

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

          {draftReleases.length > 0 && (
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

          <div className='flex gap-2 pt-2'>
            <Button type='submit' disabled={isSubmitting || !title.trim() || !domainId || !categoryId}>
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
