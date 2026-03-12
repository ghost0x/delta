import { z } from 'zod';

export const aiRevisionSchema = z.object({
  title: z.string(),
  content: z.string(),
  roleNames: z.array(z.string()),
});

export type AiRevisionOutput = z.infer<typeof aiRevisionSchema>;
