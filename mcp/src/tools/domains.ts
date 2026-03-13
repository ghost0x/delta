import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { DeltaClient } from '../client.js';

export function register(server: McpServer, client: DeltaClient) {
  server.tool(
    'list_domains',
    'List all domains with their categories and requirement counts',
    {},
    async () => {
      try {
        const data = await client.get('/api/v1/domains');
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return { content: [{ type: 'text', text: (e as Error).message }], isError: true };
      }
    }
  );

  server.tool(
    'create_domain',
    'Create a new domain',
    {
      name: z.string().describe('Domain name'),
      description: z.string().optional().describe('Domain description'),
    },
    async (params) => {
      try {
        const data = await client.post('/api/v1/domains', params);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return { content: [{ type: 'text', text: (e as Error).message }], isError: true };
      }
    }
  );

  server.tool(
    'update_domain',
    'Update a domain',
    {
      id: z.string().describe('Domain ID'),
      name: z.string().optional().describe('New domain name'),
      description: z.string().optional().describe('Domain description'),
    },
    async ({ id, ...body }) => {
      try {
        const data = await client.put(`/api/v1/domains/${id}`, body);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return { content: [{ type: 'text', text: (e as Error).message }], isError: true };
      }
    }
  );

  server.tool(
    'delete_domain',
    'Delete a domain. Fails if domain has requirements.',
    { id: z.string().describe('Domain ID') },
    async ({ id }) => {
      try {
        const data = await client.delete(`/api/v1/domains/${id}`);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return { content: [{ type: 'text', text: (e as Error).message }], isError: true };
      }
    }
  );
}
