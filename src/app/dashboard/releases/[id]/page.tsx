import { notFound } from 'next/navigation';
import { getRelease } from '@/server/releases';
import { ReleaseDetail } from '@/components/releases/release-detail';

export default async function ReleaseDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const release = await getRelease(id);

  if (!release) notFound();

  return (
    <div className='flex flex-1 flex-col'>
      <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
        <div className='px-4 lg:px-6'>
          <ReleaseDetail release={release} />
        </div>
      </div>
    </div>
  );
}
