import { getDomains } from '@/server/domains';
import { DomainManager } from '@/components/domains/domain-manager';

export default async function DomainsPage() {
  const domains = await getDomains();

  return (
    <div className='flex flex-1 flex-col'>
      <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
        <div className='px-4 lg:px-6'>
          <h1 className='text-2xl font-bold tracking-tight'>Domains</h1>
          <p className='text-muted-foreground mt-1'>
            Manage functional areas of your business.
          </p>
        </div>
        <div className='px-4 lg:px-6'>
          <DomainManager domains={domains} />
        </div>
      </div>
    </div>
  );
}
