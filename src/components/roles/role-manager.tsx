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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { IconPencil, IconTrash, IconPlus, IconCheck, IconX } from '@tabler/icons-react';
import { createRole, updateRole, deleteRole } from '@/server/roles';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type Role = {
  id: string;
  name: string;
  isGlobal: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count: { requirements: number };
};

export function RoleManager({ roles }: { roles: Role[] }) {
  const router = useRouter();
  const [newName, setNewName] = useState('');
  const [newIsGlobal, setNewIsGlobal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      setIsCreating(true);
      await createRole({ name: newName, isGlobal: newIsGlobal });
      setNewName('');
      setNewIsGlobal(false);
      toast.success('Role created');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create role');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    try {
      await updateRole(id, { name: editName });
      setEditingId(null);
      toast.success('Role updated');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update role');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRole(id);
      toast.success('Role deleted');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete role');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Roles</CardTitle>
        <CardDescription>
          Manage user types impacted by requirements. Mark a role as &ldquo;Global&rdquo; to indicate it applies to all users.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='flex gap-2 mb-4'>
          <Input
            placeholder='New role name...'
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <div className='flex items-center gap-2'>
            <Checkbox
              id='isGlobal'
              checked={newIsGlobal}
              onCheckedChange={(checked) => setNewIsGlobal(checked === true)}
            />
            <Label htmlFor='isGlobal' className='text-sm whitespace-nowrap'>
              Global
            </Label>
          </div>
          <Button onClick={handleCreate} disabled={isCreating || !newName.trim()}>
            <IconPlus className='size-4 mr-1' />
            Add
          </Button>
        </div>
        <div className='space-y-2'>
          {roles.map((role) => (
            <div
              key={role.id}
              className='flex items-center justify-between rounded-md border p-3'
            >
              {editingId === role.id ? (
                <div className='flex items-center gap-2 flex-1'>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdate(role.id)}
                    className='h-8'
                  />
                  <Button size='icon' variant='ghost' onClick={() => handleUpdate(role.id)}>
                    <IconCheck className='size-4' />
                  </Button>
                  <Button size='icon' variant='ghost' onClick={() => setEditingId(null)}>
                    <IconX className='size-4' />
                  </Button>
                </div>
              ) : (
                <>
                  <div className='flex items-center gap-2'>
                    <span className='font-medium'>{role.name}</span>
                    {role.isGlobal && <Badge>Global</Badge>}
                    <Badge variant='secondary'>{role._count.requirements} requirements</Badge>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Button
                      size='icon'
                      variant='ghost'
                      onClick={() => {
                        setEditingId(role.id);
                        setEditName(role.name);
                      }}
                    >
                      <IconPencil className='size-4' />
                    </Button>
                    <Button
                      size='icon'
                      variant='ghost'
                      onClick={() => handleDelete(role.id)}
                      disabled={role._count.requirements > 0}
                    >
                      <IconTrash className='size-4' />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
          {roles.length === 0 && (
            <p className='text-muted-foreground text-sm text-center py-4'>
              No roles yet. Create your first role above.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
