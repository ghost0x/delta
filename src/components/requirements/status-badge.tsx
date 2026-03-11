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
