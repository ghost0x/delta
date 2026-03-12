import { getReleases } from '@/server/releases';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { IconFileText, IconHistory } from '@tabler/icons-react';

export default async function ReportsPage() {
  const allReleases = await getReleases();
  const releases = allReleases.filter((r) => r.name !== 'Baseline');

  const draftReleases = releases.filter((r) => r.status === 'draft');
  const publishedReleases = releases.filter((r) => r.status === 'published');

  return (
    <div className='flex flex-1 flex-col'>
      <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
        <div className='px-4 lg:px-6'>
          <h1 className='text-2xl font-bold tracking-tight'>Reports</h1>
          <p className='text-muted-foreground mt-1'>
            Generate system documentation and change reports.
          </p>
        </div>
        <div className='grid grid-cols-1 gap-4 px-4 md:grid-cols-2 lg:px-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconFileText className='size-5' />
                System Baseline
              </CardTitle>
              <CardDescription>
                A complete snapshot of all active requirements &mdash; the current
                state of truth for how the business operates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href='/dashboard/reports/baseline'>
                  View Baseline Report
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconHistory className='size-5' />
                Release Change Reports
              </CardTitle>
              <CardDescription>
                View what changed in a specific release (Delta View).
              </CardDescription>
            </CardHeader>
            <CardContent>
              {releases.length === 0 ? (
                <p className='text-muted-foreground text-sm'>
                  No releases yet.
                </p>
              ) : (
                <div className='space-y-2'>
                  {draftReleases.map((r) => (
                    <div key={r.id} className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <span className='text-sm font-medium'>{r.name}</span>
                        <Badge variant='outline'>
                          {r._count.revisions} changes
                        </Badge>
                        <Badge variant='secondary'>Draft</Badge>
                      </div>
                      <Button asChild variant='outline' size='sm'>
                        <Link href={`/dashboard/reports/delta/${r.id}`}>
                          Preview
                        </Link>
                      </Button>
                    </div>
                  ))}
                  {publishedReleases.map((r) => (
                    <div key={r.id} className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <span className='text-sm font-medium'>{r.name}</span>
                        <Badge variant='secondary'>
                          {r._count.revisions} changes
                        </Badge>
                      </div>
                      <Button asChild variant='outline' size='sm'>
                        <Link href={`/dashboard/reports/delta/${r.id}`}>
                          View
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
