import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { DeltaClient } from '../client.js';

export function register(server: McpServer, client: DeltaClient) {
  server.tool(
    'list_revisions',
    'List revision history for a requirement',
    { requirementId: z.string().describe('Requirement ID') },
    async ({ requirementId }) => {
      try {
        const data = await client.get(`/api/v1/requirements/${requirementId}/revisions`);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return { content: [{ type: 'text', text: (e as Error).message }], isError: true };
      }
    }
  );

  server.tool(
    'create_revision',
    'Create a new revision for a requirement',
    {
      requirementId: z.string().describe('Requirement ID'),
      type: z.enum(['baseline', 'change', 'deprecation']).describe('Revision type'),
      title: z.string().optional().describe('Revision title'),
      content: z.string().describe('Revision content'),
      roleIds: z.array(z.string()).optional().describe('Role IDs for this revision'),
    },
    async ({ requirementId, ...body }) => {
      try {
        const data = await client.post(`/api/v1/requirements/${requirementId}/revisions`, body);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return { content: [{ type: 'text', text: (e as Error).message }], isError: true };
      }
    }
  );

  server.tool(
    'update_revision',
    'Update a revision. Cannot update revisions in published releases.',
    {
      id: z.string().describe('Revision ID'),
      content: z.string().describe('New content'),
      title: z.string().optional().describe('New title'),
      roleIds: z.array(z.string()).optional().describe('New role IDs'),
    },
    async ({ id, ...body }) => {
      try {
        const data = await client.put(`/api/v1/revisions/${id}`, body);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return { content: [{ type: 'text', text: (e as Error).message }], isError: true };
      }
    }
  );

  server.tool(
    'delete_revision',
    'Delete a revision. Cannot delete revisions in published releases.',
    { id: z.string().describe('Revision ID') },
    async ({ id }) => {
      try {
        const data = await client.delete(`/api/v1/revisions/${id}`);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return { content: [{ type: 'text', text: (e as Error).message }], isError: true };
      }
    }
  );

  server.tool(
    'assign_revision',
    'Assign a revision to a draft release',
    {
      id: z.string().describe('Revision ID'),
      releaseId: z.string().describe('Release ID to assign to'),
    },
    async ({ id, releaseId }) => {
      try {
        const data = await client.post(`/api/v1/revisions/${id}/assign`, { releaseId });
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return { content: [{ type: 'text', text: (e as Error).message }], isError: true };
      }
    }
  );

  server.tool(
    'unassign_revision',
    'Remove a revision from its release',
    { id: z.string().describe('Revision ID') },
    async ({ id }) => {
      try {
        const data = await client.post(`/api/v1/revisions/${id}/unassign`);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return { content: [{ type: 'text', text: (e as Error).message }], isError: true };
      }
    }
  );

  server.tool(
    'baseline_revision',
    'Assign a revision to the baseline',
    { id: z.string().describe('Revision ID') },
    async ({ id }) => {
      try {
        const data = await client.post(`/api/v1/revisions/${id}/baseline`);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return { content: [{ type: 'text', text: (e as Error).message }], isError: true };
      }
    }
  );
}
