'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { IconPencil, IconTrash, IconPlus } from '@tabler/icons-react';
import { createRole, updateRole, deleteRole } from '@/server/roles';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type Role = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count: { requirements: number };
};

export function RoleManager({ roles }: { roles: Role[] }) {
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const openCreate = () => {
    setEditingRole(null);
    setFormName('');
    setFormDescription('');
    setSheetOpen(true);
  };

  const openEdit = (role: Role) => {
    setEditingRole(role);
    setFormName(role.name);
    setFormDescription(role.description ?? '');
    setSheetOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) return;
    try {
      setIsSaving(true);
      if (editingRole) {
        await updateRole(editingRole.id, {
          name: formName,
          description: formDescription,
        });
        toast.success('Role updated');
      } else {
        await createRole({
          name: formName,
          description: formDescription,
        });
        toast.success('Role created');
      }
      setSheetOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save role');
    } finally {
      setIsSaving(false);
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
    <>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle>Roles</CardTitle>
              <CardDescription>
                Manage user types impacted by requirements.
              </CardDescription>
            </div>
            <Button onClick={openCreate}>
              <IconPlus className='size-4 mr-1' />
              Add Role
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className='space-y-2'>
            {roles.map((role) => (
              <div
                key={role.id}
                className='flex items-center justify-between rounded-md border p-3'
              >
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2'>
                    <span className='font-medium'>{role.name}</span>
                    <Badge variant='secondary'>{role._count.requirements} requirements</Badge>
                  </div>
                  {role.description && (
                    <p className='text-sm text-muted-foreground mt-1 truncate'>{role.description}</p>
                  )}
                </div>
                <div className='flex items-center gap-1 ml-2'>
                  <Button
                    size='icon'
                    variant='ghost'
                    onClick={() => openEdit(role)}
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
              </div>
            ))}
            {roles.length === 0 && (
              <p className='text-muted-foreground text-sm text-center py-4'>
                No roles yet. Click &ldquo;Add Role&rdquo; to create your first role.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{editingRole ? 'Edit Role' : 'New Role'}</SheetTitle>
            <SheetDescription>
              {editingRole
                ? 'Update the role details below.'
                : 'Define a new role that can be assigned to requirements.'}
            </SheetDescription>
          </SheetHeader>
          <div className='space-y-4 px-4 mt-6'>
            <div className='space-y-2'>
              <Label htmlFor='role-name'>Name</Label>
              <Input
                id='role-name'
                placeholder='e.g. Administrator, Instructor, Student...'
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='role-description'>Description</Label>
              <Textarea
                id='role-description'
                placeholder='Describe what this role represents and its responsibilities...'
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
              />
            </div>
            <Button
              className='w-full'
              onClick={handleSave}
              disabled={isSaving || !formName.trim()}
            >
              {isSaving ? 'Saving...' : editingRole ? 'Update Role' : 'Create Role'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
