'use client';

import { useState } from 'react';
import { IconSparkles } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { AiRequirementOutput } from '@/lib/ai/requirement-schema';

type Domain = { id: string; name: string };
type Role = { id: string; name: string; isGlobal: boolean };

export function AiGenerateDialog({
  domains,
  roles,
  onGenerated,
}: {
  domains: Domain[];
  roles: Role[];
  onGenerated: (data: AiRequirementOutput) => void;
}) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-requirement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          domains: domains.map((d) => d.name),
          roles: roles.map((r) => r.name),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate requirement');
      }

      const data: AiRequirementOutput = await response.json();
      onGenerated(data);
      setOpen(false);
      setDescription('');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to generate requirement'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' size='icon' title='Generate with AI'>
          <IconSparkles className='size-4' />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Requirement with AI</DialogTitle>
          <DialogDescription>
            Describe the requirement in plain language and AI will generate a
            structured business requirement.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          placeholder='e.g., Instructors on continuous programs should be able to archive rosters manually, while academic year programs stay automated'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          disabled={isGenerating}
        />
        <DialogFooter>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !description.trim()}
          >
            {isGenerating ? 'Generating...' : 'Generate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
