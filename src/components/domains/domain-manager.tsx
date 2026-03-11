'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IconPencil, IconTrash, IconPlus, IconCheck, IconX } from '@tabler/icons-react';
import { createDomain, updateDomain, deleteDomain } from '@/server/domains';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type Domain = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  _count: { requirements: number };
};

export function DomainManager({ domains }: { domains: Domain[] }) {
  const router = useRouter();
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      setIsCreating(true);
      await createDomain({ name: newName });
      setNewName('');
      toast.success('Domain created');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create domain');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    try {
      await updateDomain(id, { name: editName });
      setEditingId(null);
      toast.success('Domain updated');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update domain');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDomain(id);
      toast.success('Domain deleted');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete domain');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Domains</CardTitle>
        <CardDescription>
          Manage the functional areas of your business.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='flex gap-2 mb-4'>
          <Input
            placeholder='New domain name...'
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <Button onClick={handleCreate} disabled={isCreating || !newName.trim()}>
            <IconPlus className='size-4 mr-1' />
            Add
          </Button>
        </div>
        <div className='space-y-2'>
          {domains.map((domain) => (
            <div
              key={domain.id}
              className='flex items-center justify-between rounded-md border p-3'
            >
              {editingId === domain.id ? (
                <div className='flex items-center gap-2 flex-1'>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdate(domain.id)}
                    className='h-8'
                  />
                  <Button size='icon' variant='ghost' onClick={() => handleUpdate(domain.id)}>
                    <IconCheck className='size-4' />
                  </Button>
                  <Button size='icon' variant='ghost' onClick={() => setEditingId(null)}>
                    <IconX className='size-4' />
                  </Button>
                </div>
              ) : (
                <>
                  <div className='flex items-center gap-2'>
                    <span className='font-medium'>{domain.name}</span>
                    <Badge variant='secondary'>{domain._count.requirements} requirements</Badge>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Button
                      size='icon'
                      variant='ghost'
                      onClick={() => {
                        setEditingId(domain.id);
                        setEditName(domain.name);
                      }}
                    >
                      <IconPencil className='size-4' />
                    </Button>
                    <Button
                      size='icon'
                      variant='ghost'
                      onClick={() => handleDelete(domain.id)}
                      disabled={domain._count.requirements > 0}
                    >
                      <IconTrash className='size-4' />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
          {domains.length === 0 && (
            <p className='text-muted-foreground text-sm text-center py-4'>
              No domains yet. Create your first domain above.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
