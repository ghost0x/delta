import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { DeltaClient } from '../client.js';

export function register(server: McpServer, client: DeltaClient) {
  server.tool(
    'list_roles',
    'List all roles with requirement counts',
    {},
    async () => {
      try {
        const data = await client.get('/api/v1/roles');
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return { content: [{ type: 'text', text: (e as Error).message }], isError: true };
      }
    }
  );

  server.tool(
    'create_role',
    'Create a new role',
    {
      name: z.string().describe('Role name'),
      description: z.string().optional().describe('Role description providing context about the role'),
    },
    async (params) => {
      try {
        const data = await client.post('/api/v1/roles', params);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return { content: [{ type: 'text', text: (e as Error).message }], isError: true };
      }
    }
  );

  server.tool(
    'update_role',
    'Update a role',
    {
      id: z.string().describe('Role ID'),
      name: z.string().optional().describe('New role name'),
      description: z.string().optional().describe('Role description providing context about the role'),
    },
    async ({ id, ...body }) => {
      try {
        const data = await client.put(`/api/v1/roles/${id}`, body);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return { content: [{ type: 'text', text: (e as Error).message }], isError: true };
      }
    }
  );

  server.tool(
    'delete_role',
    'Delete a role. Fails if role is assigned to requirements.',
    { id: z.string().describe('Role ID') },
    async ({ id }) => {
      try {
        const data = await client.delete(`/api/v1/roles/${id}`);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return { content: [{ type: 'text', text: (e as Error).message }], isError: true };
      }
    }
  );
}
