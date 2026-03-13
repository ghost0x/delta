import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { DeltaClient } from '../client.js';

export function register(server: McpServer, client: DeltaClient) {
  server.tool(
    'get_baseline_report',
    'Generate a baseline report showing the current published state of all requirements',
    {},
    async () => {
      try {
        const data = await client.get('/api/v1/reports/baseline');
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return { content: [{ type: 'text', text: (e as Error).message }], isError: true };
      }
    }
  );

  server.tool(
    'export_baseline_markdown',
    'Export the baseline report as formatted markdown',
    {},
    async () => {
      try {
        const text = await client.getText('/api/v1/reports/baseline/export');
        return { content: [{ type: 'text', text }] };
      } catch (e) {
        return { content: [{ type: 'text', text: (e as Error).message }], isError: true };
      }
    }
  );

  server.tool(
    'get_delta_report',
    'Generate a delta report comparing a release to the previous baseline',
    { releaseId: z.string().describe('Release ID to generate delta for') },
    async ({ releaseId }) => {
      try {
        const data = await client.get(`/api/v1/reports/delta/${releaseId}`);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      } catch (e) {
        return { content: [{ type: 'text', text: (e as Error).message }], isError: true };
      }
    }
  );

  server.tool(
    'export_delta_markdown',
    'Export a delta report as formatted markdown',
    { releaseId: z.string().describe('Release ID to export delta for') },
    async ({ releaseId }) => {
      try {
        const text = await client.getText(`/api/v1/reports/delta/${releaseId}/export`);
        return { content: [{ type: 'text', text }] };
      } catch (e) {
        return { content: [{ type: 'text', text: (e as Error).message }], isError: true };
      }
    }
  );
}
