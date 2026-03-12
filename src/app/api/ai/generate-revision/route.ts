import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { auth } from '@/lib/auth';
import { aiRevisionSchema } from '@/lib/ai/revision-schema';

const SYSTEM_PROMPT = `You are an Expert Business Systems Analyst. Your job is to take an existing business requirement and a description of a requested change, then produce a revised version of the requirement.

## Your Task
You will receive:
1. The ORIGINAL business requirement (title, content, and assigned roles)
2. The user's CHANGE REQUEST describing what should be modified

Produce a COMPLETE revised requirement that incorporates the requested changes. The content field must contain the FULL specification text — not just the changes. Start from the original content and modify it to reflect the requested change, keeping all unchanged sections intact.

## Formatting Rules for the content field
Write the content in Hybrid Declarative Style using Markdown:
- Use IF/THEN for conditional logic
- Use EXCEPT for exclusions
- Use MUST or SHALL for mandatory behavior
- Use bullet points for lists of conditions or steps
- Be precise and unambiguous
- Keep it concise but complete

## Role Selection
You will be given a list of existing role names. Select the roles that are relevant to the revised requirement. Use the exact names provided. The original requirement's roles are provided for context — adjust if the change warrants it.

## Title
Use the format: [Entity] : [Condition/Action]
Keep it short and scannable. Update the title if the change significantly alters the requirement's scope.`;

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { originalTitle, originalContent, originalRoles, changeDescription, roles } = await request.json();

  const client = new Anthropic();

  const userMessage = `## Original Requirement
**Title:** ${originalTitle}

**Assigned Roles:** ${originalRoles.length > 0 ? originalRoles.join(', ') : '(none)'}

**Content:**
${originalContent}

## Available Roles
${roles.length > 0 ? roles.join(', ') : '(none)'}

## Requested Change
${changeDescription}`;

  const message = await client.messages.parse({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
    output_config: {
      format: zodOutputFormat(aiRevisionSchema),
    },
  });

  return NextResponse.json(message.parsed_output);
}
