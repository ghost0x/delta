'use client';

import { diffWords } from 'diff';

export function DiffView({ fromContent, toContent }: { fromContent: string | null; toContent: string }) {
  if (!fromContent) {
    return (
      <div className='grid grid-cols-2 gap-4'>
        <div className='prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap bg-muted/50 rounded-md p-3 text-muted-foreground italic'>
          New requirement
        </div>
        <div className='prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap bg-muted/50 rounded-md p-3'>
          <span className='bg-green-100 dark:bg-green-900/30 rounded px-0.5'>{toContent}</span>
        </div>
      </div>
    );
  }

  const changes = diffWords(fromContent, toContent);

  return (
    <div className='grid grid-cols-2 gap-4'>
      <div className='prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap bg-muted/50 rounded-md p-3'>
        {changes.map((part, i) => {
          if (part.added) return null;
          if (part.removed) {
            return (
              <span key={i} className='bg-red-100 dark:bg-red-900/30 rounded px-0.5'>
                {part.value}
              </span>
            );
          }
          return <span key={i}>{part.value}</span>;
        })}
      </div>
      <div className='prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap bg-muted/50 rounded-md p-3'>
        {changes.map((part, i) => {
          if (part.removed) return null;
          if (part.added) {
            return (
              <span key={i} className='bg-green-100 dark:bg-green-900/30 rounded px-0.5'>
                {part.value}
              </span>
            );
          }
          return <span key={i}>{part.value}</span>;
        })}
      </div>
    </div>
  );
}
