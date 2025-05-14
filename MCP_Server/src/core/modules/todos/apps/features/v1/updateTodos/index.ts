import { FastMCP } from "fastmcp";
import {Container} from "typedi";
import { UpdateTodosApiService } from "./services/index.js";
import { z } from "zod";

const updateTodosApiService=Container.get(UpdateTodosApiService)

export const updateTodosTool=(mcpServer:FastMCP)=>{
  mcpServer.addTool({
      name: `update_todos`,
      description: `
      This tool allows the AI to modify an existing to-do item.
      Before using this tool, the AI should first use the 'search_todos' tool to find the specific to-do item by its title or relevant keywords and obtain its unique identifier.
      Once the identifier of the target to-do is known, this tool can be invoked to update its title and/or description.
      The AI should use this tool when the user requests to edit a to-do, correct information in an existing task, or add more details to a previously created item.
      It's crucial that the AI has the correct 'identifier' of the to-do to ensure the intended item is updated.
      If the 'identifier' is unknown, the 'search_todos' tool must be used first to retrieve it.
      `,
      parameters: z.object({
        identifier:z.string().describe(`The unique identifier of the to-do item to be updated.`),
        title: z
          .string()
          .describe(
            'The concise name or heading of the to-do item. This should be a brief summary of the task or item to be added to the list.'
          ),
        description: z
          .string()
          .describe(
            'A more detailed explanation or notes about the to-do item. This can include specific details, context, or any additional information relevant to the task.'
          ),
      }),
      execute: async (args) => {
        const { identifier, title, description } = args;

        const updateTodosApiServiceResult = await updateTodosApiService.handleAsync({
          title: title,
          description: description,
          identifier:identifier
        });

        if (updateTodosApiServiceResult.isErr())
          return String(`something went wrong. ${updateTodosApiServiceResult.error.message}`);

        return `Successfully requested to update a new todo item with title "${title}" and description "${description}".`;
      },
    });
}
