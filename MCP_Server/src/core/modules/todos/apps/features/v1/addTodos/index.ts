import { z } from 'zod';
import { Container } from 'typedi';
import { AddTodosApiService } from './services/index.js';
import { FastMCP } from 'fastmcp';

const addTodosApiService = Container.get(AddTodosApiService);

export const addTodosTool = (mcpServer:FastMCP) => {
	mcpServer.addTool({
		name: `add_todos`,
		description: `This tool allows the AI to create a new entry in a to-do list.
    When invoked, it will add a new item with a specified title and a detailed description.
    This is useful for the AI to manage tasks, reminders, or any list of items that need to be tracked.
    The AI should use this tool whenever the user requests to add something to a to-do list or when the AI itself needs to record a task or action.
    `,
		parameters: z.object({
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
			const { title, description } = args;

			const addTodosApiServiceResult = await addTodosApiService.handleAsync({
				title: title,
				description: description,
			});

			if (addTodosApiServiceResult.isErr())
				return String(`something went wrong. ${addTodosApiServiceResult.error.message}`);

			return `Successfully requested to add a new todo item with title "${title}" and description "${description}".`;
		},
	});
};
