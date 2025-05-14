import { FastMCP, ServerOptions } from 'fastmcp';

export const startMcpServer=(options:ServerOptions<undefined>):FastMCP=>{
  const mcpServer = new FastMCP(options);
  return mcpServer;
}
