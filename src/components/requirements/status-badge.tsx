import { Badge } from '@/components/ui/badge';

type StatusBadgeProps = {
  isDeprecated: boolean;
  hasDraft: boolean;
  hasBaseline: boolean;
};

export function StatusBadge({ isDeprecated, hasDraft, hasBaseline }: StatusBadgeProps) {
  if (isDeprecated) {
    return <Badge variant='destructive'>Deprecated</Badge>;
  }
  if (hasDraft) {
    return <Badge variant='outline'>Has Draft</Badge>;
  }
  if (hasBaseline) {
    return <Badge variant='default'>Active</Badge>;
  }
  return <Badge variant='secondary'>New</Badge>;
}

type VerificationBadgeProps = {
  status: string;
};

export function VerificationBadge({ status }: VerificationBadgeProps) {
  if (status === 'verified') {
    return (
      <Badge className='bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900'>
        Verified
      </Badge>
    );
  }
  return (
    <Badge className='bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900'>
      Unverified
    </Badge>
  );
}
