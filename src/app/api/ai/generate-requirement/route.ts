import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
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
You will be given a list of existing domains with their descriptions. Use the descriptions to understand the scope and purpose of each domain. Prefer selecting from existing domains. Only set isNew to true and suggest a new domain name if none of the existing domains are a reasonable fit.

## Category Selection
You will be given a list of existing categories grouped by domain, with descriptions where available. Categories group related requirements within a domain (e.g., "Credits", "Invoicing" within "Finance"). Use category descriptions to understand what belongs in each category. Prefer selecting from existing categories for the chosen domain. Only set isNew to true and suggest a new category name if none of the existing categories fit.

## Role Selection
You will be given a list of existing roles with their descriptions. Use the descriptions to understand each role's responsibilities and determine which roles are relevant to this requirement. Use the exact names provided.

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
  const { description, domains, roles } = await request.json();

  const client = new Anthropic();

  type DomainInput = { name: string; description: string | null; categories: { name: string; description: string | null }[] };
  type RoleInput = { name: string; description: string | null };

  const domainCategoryList = domains.length > 0
    ? (domains as DomainInput[]).map((d) => {
        const domainDesc = d.description ? ` — ${d.description}` : '';
        const cats = d.categories.length > 0
          ? d.categories.map((c) => {
              const catDesc = c.description ? ` (${c.description})` : '';
              return `${c.name}${catDesc}`;
            }).join(', ')
          : '(no categories)';
        return `- ${d.name}${domainDesc}: ${cats}`;
      }).join('\n')
    : '(none)';

  const roleList = (roles as RoleInput[]).length > 0
    ? (roles as RoleInput[]).map((r) => {
        const roleDesc = r.description ? ` — ${r.description}` : '';
        return `- ${r.name}${roleDesc}`;
      }).join('\n')
    : '(none)';

  const userMessage = `## Existing Domains & Categories
${domainCategoryList}

## Existing Roles
${roleList}

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
