import { getReleases } from '@/server/releases';
import { ReleasesTable } from '@/components/releases/releases-table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { IconPlus } from '@tabler/icons-react';

export default async function ReleasesPage() {
  const releases = await getReleases();

  return (
    <div className='flex flex-1 flex-col'>
      <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
        <div className='flex flex-col justify-between gap-4 px-4 sm:flex-row sm:items-center lg:px-6'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Releases</h1>
            <p className='text-muted-foreground mt-1'>
              Manage releases to bundle and publish revisions.
            </p>
          </div>
          <Button asChild>
            <Link href='/dashboard/releases/new'>
              <IconPlus className='size-4 mr-1' />
              New Release
            </Link>
          </Button>
        </div>
        <div className='px-4 lg:px-6'>
          <ReleasesTable releases={releases} />
        </div>
      </div>
    </div>
  );
}
