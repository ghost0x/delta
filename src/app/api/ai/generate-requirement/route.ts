import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { auth } from '@/lib/auth';
import { aiRequirementSchema } from '@/lib/ai/requirement-schema';

const SYSTEM_PROMPT = `You are an Expert Business Systems Analyst. Your job is to take a plain-language description of a business requirement and produce a structured output.

## Formatting Rules for the description field
Write the description in Hybrid Declarative Style using Markdown:
- Use IF/THEN for conditional logic
- Use EXCEPT for exclusions
- Use MUST or SHALL for mandatory behavior
- Use bullet points for lists of conditions or steps
- Be precise and unambiguous
- Keep it concise but complete

## Domain Selection
You will be given a list of existing domain names. Prefer selecting from these. Only set isNew to true and suggest a new domain name if none of the existing domains are a reasonable fit.

## Role Selection
You will be given a list of existing role names. Select the roles that are relevant to this requirement. Use the exact names provided.

## Title
Use the format: [Entity] : [Condition/Action]

This ensures requirements naturally group together and are instantly searchable in long lists. Keep it short and scannable.

Examples:
- "Academic Rosters : Auto-Hide Logic"
- "Continuous Rosters : Manual Archiving"
- "Invoices : Late Fee Calculation"
- "Instructors : SSO Enforcement"
- "School Programs : Association Rules"`;

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { description, domains, roles } = await request.json();

  const client = new Anthropic();

  const userMessage = `## Existing Domains
${domains.length > 0 ? domains.join(', ') : '(none)'}

## Existing Roles
${roles.length > 0 ? roles.join(', ') : '(none)'}

## Requirement Description
${description}`;

  const message = await client.messages.parse({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
    output_config: {
      format: zodOutputFormat(aiRequirementSchema),
    },
  });

  return NextResponse.json(message.parsed_output);
}
