'use client';

import { Button } from '@/components/ui/button';
import { IconDownload } from '@tabler/icons-react';

export function ExportButton({
  content,
  filename
}: {
  content: string;
  filename: string;
}) {
  const handleExport = () => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Button variant='outline' onClick={handleExport}>
      <IconDownload className='size-4 mr-1' />
      Export Markdown
    </Button>
  );
}
