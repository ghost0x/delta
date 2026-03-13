import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { DeltaClient } from '../client.js';

export function register(server: McpServer, client: DeltaClient) {
  server.tool(
    'list_releases',
    'List all releases with optional status filter',
    {
      status: z.string().optional().describe('Filter by status: draft or published'),
    },
    async (params) => {
      try {
        const qs = params.status ? `?status=${params.status}` : '';
        const data = await client.get(`/api/v1/releases${qs}`);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return { content: [{ type: 'text', text: (e as Error).message }], isError: true };
      }
    }
  );

  server.tool(
    'get_release',
    'Get a single release by ID with its revisions',
    { id: z.string().describe('Release ID') },
    async ({ id }) => {
      try {
        const data = await client.get(`/api/v1/releases/${id}`);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return { content: [{ type: 'text', text: (e as Error).message }], isError: true };
      }
    }
  );

  server.tool(
    'create_release',
    'Create a new draft release',
    {
      name: z.string().describe('Release name'),
      description: z.string().optional().describe('Release description'),
    },
    async (params) => {
      try {
        const data = await client.post('/api/v1/releases', params);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return { content: [{ type: 'text', text: (e as Error).message }], isError: true };
      }
    }
  );

  server.tool(
    'update_release',
    'Update a draft release',
    {
      id: z.string().describe('Release ID'),
      name: z.string().optional().describe('New release name'),
      description: z.string().optional().describe('New description'),
    },
    async ({ id, ...body }) => {
      try {
        const data = await client.put(`/api/v1/releases/${id}`, body);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return { content: [{ type: 'text', text: (e as Error).message }], isError: true };
      }
    }
  );

  server.tool(
    'publish_release',
    'Publish a release, syncing all revisions to their requirements',
    { id: z.string().describe('Release ID') },
    async ({ id }) => {
      try {
        const data = await client.post(`/api/v1/releases/${id}/publish`);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return { content: [{ type: 'text', text: (e as Error).message }], isError: true };
      }
    }
  );
}
