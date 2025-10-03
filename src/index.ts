#!/usr/bin/env node

import { BRANDING } from './constants/branding';

import { McpServer } from './server';
import { McpServerConfig } from './types';

export { McpServer } from './server';
export { BaseTool } from './tools';
export { type McpTool, type McpToolResult, type McpResource, type McpServerConfig } from './types';

if (require.main === module) {
  const port = parseInt(process.env.PRINCIPLE_MCP_PORT || process.env.PORT || '3044');
  const config: McpServerConfig = {
    name: BRANDING.MCP_SERVER_NAME,
    version: BRANDING.MCP_VERSION,
    bridgePort: port,
    bridgeHost: process.env.PRINCIPLE_MCP_HOST || 'localhost',
    bridgePath: process.env.PRINCIPLE_MCP_PATH || '',
  };

  const server = new McpServer(config);

  process.on('SIGINT', async () => {
    console.error('\nShutting down MCP server...');
    await server.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.error('\nShutting down MCP server...');
    await server.stop();
    process.exit(0);
  });

  server.start().catch(error => {
    console.error('❌ Failed to start MCP server:', error);
    process.exit(1);
  });
}
