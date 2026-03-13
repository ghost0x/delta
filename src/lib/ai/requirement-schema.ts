import { z } from 'zod';

export const aiRequirementSchema = z.object({
  title: z.string(),
  domain: z.object({
    name: z.string(),
    isNew: z.boolean(),
  }),
  category: z.object({
    name: z.string(),
    isNew: z.boolean(),
  }),
  roleNames: z.array(z.string()),
  description: z.string(),
});

export type AiRequirementOutput = z.infer<typeof aiRequirementSchema>;
