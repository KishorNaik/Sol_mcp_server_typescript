import { FastMCP } from "fastmcp";
import {Container} from "typedi";
import { RemoveTodosApiService } from "./services/index.js";
import { z } from "zod";

const removeTodosApiService=Container.get(RemoveTodosApiService);

export const removeTodosTool=(mcpServer:FastMCP)=>{
  mcpServer.addTool({
      name: `remove_todos`,
      description: `
      This tool enables the AI to remove a specific to-do item from the list. Before using this tool,
      the AI MUST first utilize the 'search_todos' tool to locate the target to-do item and obtain its unique identifier.
      Once the 'search_todos' tool returns a JSON response containing the 'identifier' of the to-do to be deleted, this 'remove_todos' tool can be invoked with that 'identifier'.
      The AI should use this tool when the user explicitly requests to delete a to-do item.
      It is critical that the AI provides the correct 'identifier' obtained from the search results to ensure the intended to-do is removed and to prevent accidental deletion of other items.
      If the AI does not know the 'identifier', it MUST first call the 'search_todos' tool to find the relevant to-do item.
      `,
      parameters: z.object({
        identifier:z.string().describe(`The unique identifier of the to-do item to be removed.`),
      }),
      execute: async (args) => {
        const { identifier } = args;

        const addTodosApiServiceResult = await removeTodosApiService.handleAsync({
          identifier:identifier,
        });

        if (addTodosApiServiceResult.isErr())
          return String(`something went wrong. ${addTodosApiServiceResult.error.message}`);

        return `Successfully requested to removed a todo item".`;
      },
    });
}
