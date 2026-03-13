'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { IconX } from '@tabler/icons-react';

type Domain = {
  id: string;
  name: string;
  categories: { id: string; name: string }[];
};

export function RequirementsFilter({ domains }: { domains: Domain[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const domainId = searchParams.get('domainId') ?? '';
  const categoryId = searchParams.get('categoryId') ?? '';
  const search = searchParams.get('search') ?? '';
  const status = searchParams.get('status') ?? '';

  const [keyword, setKeyword] = useState(search);

  const selectedDomain = domains.find((d) => d.id === domainId);
  const categories = selectedDomain?.categories ?? [];

  const hasFilters = domainId || categoryId || search || status;

  useEffect(() => {
    setKeyword(search);
  }, [search]);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleDomainChange = (value: string) => {
    updateParams({
      domainId: value === 'all' ? null : value,
      categoryId: null
    });
  };

  const handleCategoryChange = (value: string) => {
    updateParams({ categoryId: value === 'all' ? null : value });
  };

  const handleStatusChange = (value: string) => {
    updateParams({ status: value === 'all' ? null : value });
  };

  const handleKeywordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: keyword.trim() || null });
  };

  const clearFilters = () => {
    setKeyword('');
    router.push('?');
  };

  return (
    <form onSubmit={handleKeywordSubmit} className='flex flex-wrap items-center gap-3'>
      <Select value={domainId || 'all'} onValueChange={handleDomainChange}>
        <SelectTrigger className='w-[180px]'>
          <SelectValue placeholder='All Domains' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Domains</SelectItem>
          {domains.map((d) => (
            <SelectItem key={d.id} value={d.id}>
              {d.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={categoryId || 'all'}
        onValueChange={handleCategoryChange}
        disabled={!domainId}
      >
        <SelectTrigger className='w-[180px]'>
          <SelectValue placeholder='All Categories' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Categories</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={status || 'all'} onValueChange={handleStatusChange}>
        <SelectTrigger className='w-[180px]'>
          <SelectValue placeholder='All Statuses' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Statuses</SelectItem>
          <SelectItem value='verified'>Verified</SelectItem>
          <SelectItem value='unverified'>Unverified</SelectItem>
        </SelectContent>
      </Select>

      <Input
        type='text'
        placeholder='Search by keyword...'
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        className='w-[220px]'
      />

      <Button type='submit' variant='secondary' size='sm'>
        Search
      </Button>

      {hasFilters && (
        <Button type='button' variant='ghost' size='sm' onClick={clearFilters}>
          <IconX className='size-4 mr-1' />
          Clear
        </Button>
      )}
    </form>
  );
}
