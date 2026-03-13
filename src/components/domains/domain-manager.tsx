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
import { createDomain, updateDomain, deleteDomain } from '@/server/domains';
import { createCategory, updateCategory, deleteCategory } from '@/server/categories';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type Category = {
  id: string;
  name: string;
  description: string | null;
  domainId: string;
  _count: { requirements: number };
};

type Domain = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count: { requirements: number };
  categories: Category[];
};

type SheetMode =
  | { type: 'domain'; editing: Domain | null }
  | { type: 'category'; domainId: string; domainName: string; editing: Category | null };

export function DomainManager({ domains }: { domains: Domain[] }) {
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<SheetMode | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const openSheet = (mode: SheetMode) => {
    setSheetMode(mode);
    if (mode.type === 'domain') {
      setFormName(mode.editing?.name ?? '');
      setFormDescription(mode.editing?.description ?? '');
    } else {
      setFormName(mode.editing?.name ?? '');
      setFormDescription(mode.editing?.description ?? '');
    }
    setSheetOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim() || !sheetMode) return;
    try {
      setIsSaving(true);
      if (sheetMode.type === 'domain') {
        if (sheetMode.editing) {
          await updateDomain(sheetMode.editing.id, { name: formName, description: formDescription });
          toast.success('Domain updated');
        } else {
          await createDomain({ name: formName, description: formDescription });
          toast.success('Domain created');
        }
      } else {
        if (sheetMode.editing) {
          await updateCategory(sheetMode.editing.id, { name: formName, description: formDescription });
          toast.success('Category updated');
        } else {
          await createCategory({ name: formName, description: formDescription, domainId: sheetMode.domainId });
          toast.success('Category created');
        }
      }
      setSheetOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDomain = async (id: string) => {
    try {
      await deleteDomain(id);
      toast.success('Domain deleted');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete domain');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id);
      toast.success('Category deleted');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete category');
    }
  };

  const sheetTitle = sheetMode?.type === 'domain'
    ? (sheetMode.editing ? 'Edit Domain' : 'New Domain')
    : sheetMode?.type === 'category'
      ? (sheetMode.editing ? 'Edit Category' : 'New Category')
      : '';

  const sheetDesc = sheetMode?.type === 'domain'
    ? (sheetMode.editing ? 'Update the domain details below.' : 'Define a new functional area for your business requirements.')
    : sheetMode?.type === 'category'
      ? (sheetMode.editing
        ? `Update the category in ${sheetMode.domainName}.`
        : `Add a new category to ${sheetMode.domainName}.`)
      : '';

  const saveLabel = sheetMode?.type === 'domain'
    ? (sheetMode.editing ? 'Update Domain' : 'Create Domain')
    : sheetMode?.type === 'category'
      ? (sheetMode.editing ? 'Update Category' : 'Create Category')
      : 'Save';

  return (
    <>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle>Domains & Categories</CardTitle>
              <CardDescription>
                Manage the functional areas and categories of your business.
              </CardDescription>
            </div>
            <Button onClick={() => openSheet({ type: 'domain', editing: null })}>
              <IconPlus className='size-4 mr-1' />
              Add Domain
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {domains.map((domain) => (
              <div key={domain.id} className='rounded-md border'>
                <div className='flex items-center justify-between p-3'>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2'>
                      <span className='font-medium'>{domain.name}</span>
                      <Badge variant='secondary'>{domain._count.requirements} requirements</Badge>
                    </div>
                    {domain.description && (
                      <p className='text-sm text-muted-foreground mt-1 truncate'>{domain.description}</p>
                    )}
                  </div>
                  <div className='flex items-center gap-1 ml-2'>
                    <Button
                      size='icon'
                      variant='ghost'
                      onClick={() => openSheet({ type: 'domain', editing: domain })}
                    >
                      <IconPencil className='size-4' />
                    </Button>
                    <Button
                      size='icon'
                      variant='ghost'
                      onClick={() => handleDeleteDomain(domain.id)}
                      disabled={domain._count.requirements > 0}
                    >
                      <IconTrash className='size-4' />
                    </Button>
                  </div>
                </div>

                <div className='border-t px-3 py-2 bg-muted/30'>
                  <div className='flex items-center justify-between mb-2'>
                    <p className='text-xs font-medium text-muted-foreground'>Categories</p>
                    <Button
                      size='sm'
                      variant='outline'
                      className='h-6 text-xs'
                      onClick={() => openSheet({ type: 'category', domainId: domain.id, domainName: domain.name, editing: null })}
                    >
                      <IconPlus className='size-3 mr-1' />
                      Add
                    </Button>
                  </div>
                  <div className='space-y-1'>
                    {domain.categories.map((cat) => (
                      <div key={cat.id} className='flex items-center justify-between py-1 pl-4'>
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center gap-2'>
                            <span className='text-sm'>{cat.name}</span>
                            <Badge variant='outline' className='text-xs'>{cat._count.requirements}</Badge>
                          </div>
                          {cat.description && (
                            <p className='text-xs text-muted-foreground mt-0.5 truncate'>{cat.description}</p>
                          )}
                        </div>
                        <div className='flex items-center gap-1 ml-2'>
                          <Button
                            size='icon'
                            variant='ghost'
                            className='h-7 w-7'
                            onClick={() => openSheet({ type: 'category', domainId: domain.id, domainName: domain.name, editing: cat })}
                          >
                            <IconPencil className='size-3' />
                          </Button>
                          <Button
                            size='icon'
                            variant='ghost'
                            className='h-7 w-7'
                            onClick={() => handleDeleteCategory(cat.id)}
                            disabled={cat._count.requirements > 0}
                          >
                            <IconTrash className='size-3' />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {domain.categories.length === 0 && (
                      <p className='text-xs text-muted-foreground pl-4 py-1'>No categories yet.</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {domains.length === 0 && (
              <p className='text-muted-foreground text-sm text-center py-4'>
                No domains yet. Click &ldquo;Add Domain&rdquo; to create your first domain.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{sheetTitle}</SheetTitle>
            <SheetDescription>{sheetDesc}</SheetDescription>
          </SheetHeader>
          <div className='space-y-4 px-4 mt-6'>
            <div className='space-y-2'>
              <Label htmlFor='item-name'>Name</Label>
              <Input
                id='item-name'
                placeholder={sheetMode?.type === 'domain' ? 'e.g. Operations, Training, Safety...' : 'e.g. Scheduling, Compliance...'}
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='item-description'>Description</Label>
              <Textarea
                id='item-description'
                placeholder={sheetMode?.type === 'domain'
                  ? 'Describe this functional area...'
                  : 'Describe this category...'}
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
              {isSaving ? 'Saving...' : saveLabel}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
