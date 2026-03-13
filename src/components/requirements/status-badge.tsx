import { Badge } from '@/components/ui/badge';

type StatusBadgeProps = {
  status: string;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case 'deprecated':
      return <Badge variant='destructive'>Deprecated</Badge>;
    case 'published':
      return <Badge variant='default'>Published</Badge>;
    case 'verified':
      return (
        <Badge className='bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900'>
          Verified
        </Badge>
      );
    default:
      return (
        <Badge className='bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900'>
          Unverified
        </Badge>
      );
  }
}
