import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { DeltaClient } from '../client.js';

export function register(server: McpServer, client: DeltaClient) {
  server.tool(
    'list_categories',
    'List categories for a domain',
    { domainId: z.string().describe('Domain ID to list categories for') },
    async ({ domainId }) => {
      try {
        const data = await client.get(`/api/v1/domains/${domainId}/categories`);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return { content: [{ type: 'text', text: (e as Error).message }], isError: true };
      }
    }
  );

  server.tool(
    'create_category',
    'Create a category within a domain',
    {
      domainId: z.string().describe('Domain ID'),
      name: z.string().describe('Category name'),
      description: z.string().optional().describe('Category description'),
    },
    async ({ domainId, name, description }) => {
      try {
        const data = await client.post(`/api/v1/domains/${domainId}/categories`, { name, description });
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return { content: [{ type: 'text', text: (e as Error).message }], isError: true };
      }
    }
  );

  server.tool(
    'update_category',
    'Update a category',
    {
      id: z.string().describe('Category ID'),
      name: z.string().optional().describe('New category name'),
      description: z.string().optional().describe('Category description'),
    },
    async ({ id, ...body }) => {
      try {
        const data = await client.put(`/api/v1/categories/${id}`, body);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return { content: [{ type: 'text', text: (e as Error).message }], isError: true };
      }
    }
  );

  server.tool(
    'delete_category',
    'Delete a category. Fails if category has requirements.',
    { id: z.string().describe('Category ID') },
    async ({ id }) => {
      try {
        const data = await client.delete(`/api/v1/categories/${id}`);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return { content: [{ type: 'text', text: (e as Error).message }], isError: true };
      }
    }
  );
}
