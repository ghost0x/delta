import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { DeltaClient } from '../client.js';

export function register(server: McpServer, client: DeltaClient) {
  server.tool(
    'list_requirements',
    'List all requirements with optional filters. Supports filtering by domain (ID or name), category (ID or name), role ID, verification status, and keyword search. All filters are combined with AND logic.',
    {
      domainId: z.string().optional().describe('Filter by domain ID'),
      domainName: z.string().optional().describe('Filter by domain name (case-insensitive, alternative to domainId)'),
      categoryId: z.string().optional().describe('Filter by category ID'),
      categoryName: z.string().optional().describe('Filter by category name (case-insensitive, alternative to categoryId)'),
      roleId: z.string().optional().describe('Filter by role ID'),
      search: z.string().optional().describe('Search by keyword in title (case-insensitive)'),
      status: z.enum(['unverified', 'verified', 'published', 'deprecated']).optional().describe('Filter by derived status (unverified, verified, published, deprecated)'),
    },
    async (params) => {
      try {
        const query = new URLSearchParams();
        if (params.domainId) query.set('domainId', params.domainId);
        if (params.domainName) query.set('domainName', params.domainName);
        if (params.categoryId) query.set('categoryId', params.categoryId);
        if (params.categoryName) query.set('categoryName', params.categoryName);
        if (params.roleId) query.set('roleId', params.roleId);
        if (params.search) query.set('search', params.search);
        if (params.status) query.set('status', params.status);
        const qs = query.toString();
        const data = await client.get(`/api/v1/requirements${qs ? `?${qs}` : ''}`);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return { content: [{ type: 'text', text: (e as Error).message }], isError: true };
      }
    }
  );

  server.tool(
    'get_requirement',
    'Get a single requirement by ID with its revision history',
    { id: z.string().describe('Requirement ID') },
    async ({ id }) => {
      try {
        const data = await client.get(`/api/v1/requirements/${id}`);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return { content: [{ type: 'text', text: (e as Error).message }], isError: true };
      }
    }
  );

  server.tool(
    'create_requirement',
    'Create a new requirement',
    {
      title: z.string().describe('Requirement title'),
      domainId: z.string().describe('Domain ID'),
      categoryId: z.string().describe('Category ID'),
      roleIds: z.array(z.string()).describe('Array of role IDs'),
      content: z.string().describe('Requirement content/description'),
    },
    async (params) => {
      try {
        const data = await client.post('/api/v1/requirements', params);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return { content: [{ type: 'text', text: (e as Error).message }], isError: true };
      }
    }
  );

  server.tool(
    'update_requirement',
    'Update a requirement',
    {
      id: z.string().describe('Requirement ID'),
      title: z.string().optional().describe('New title'),
      domainId: z.string().optional().describe('New domain ID'),
      categoryId: z.string().optional().describe('New category ID'),
    },
    async ({ id, ...body }) => {
      try {
        const data = await client.put(`/api/v1/requirements/${id}`, body);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return { content: [{ type: 'text', text: (e as Error).message }], isError: true };
      }
    }
  );

  server.tool(
    'delete_requirement',
    'Delete a requirement',
    { id: z.string().describe('Requirement ID') },
    async ({ id }) => {
      try {
        const data = await client.delete(`/api/v1/requirements/${id}`);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return { content: [{ type: 'text', text: (e as Error).message }], isError: true };
      }
    }
  );
}
