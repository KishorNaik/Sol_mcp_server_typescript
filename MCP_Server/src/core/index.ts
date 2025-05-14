import 'reflect-metadata';
import { todosModuleServices } from './modules/todos/index.js';
import { startMcpServer } from './shared/mcp/index.js';
import { MCP_SERVER_NAME } from './config/env/index.js';

console.log('MCP SERVER STARTED');

const mcpServer = startMcpServer({
	name: String(MCP_SERVER_NAME),
	version: '1.0.0',
  instructions:`
  `,
});

todosModuleServices(mcpServer);

mcpServer.start({
	transportType: 'stdio',
});
