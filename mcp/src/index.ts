import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { DeltaClient } from './client.js';
import { register as registerRequirements } from './tools/requirements.js';
import { register as registerDomains } from './tools/domains.js';
import { register as registerCategories } from './tools/categories.js';
import { register as registerRoles } from './tools/roles.js';
import { register as registerReleases } from './tools/releases.js';
import { register as registerRevisions } from './tools/revisions.js';
import { register as registerReports } from './tools/reports.js';

const server = new McpServer({
  name: 'delta',
  version: '1.0.0',
});

const client = new DeltaClient(process.env.DELTA_BASE_URL);

registerRequirements(server, client);
registerDomains(server, client);
registerCategories(server, client);
registerRoles(server, client);
registerReleases(server, client);
registerRevisions(server, client);
registerReports(server, client);

const transport = new StdioServerTransport();
await server.connect(transport);
