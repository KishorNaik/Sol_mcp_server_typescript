import { FastMCP } from 'fastmcp';
import { addTodosTool } from './apps/features/v1/addTodos/index.js';
import { searchTodoTool } from './apps/features/v1/searchTodos/index.js';
import { updateTodosTool } from './apps/features/v1/updateTodos/index.js';
import { removeTodosTool } from './apps/features/v1/removeTodos/index.js';

export const todosModuleServices = (mcpServer:FastMCP) => {
	addTodosTool(mcpServer);
  searchTodoTool(mcpServer);
  updateTodosTool(mcpServer);
  removeTodosTool(mcpServer);
};
