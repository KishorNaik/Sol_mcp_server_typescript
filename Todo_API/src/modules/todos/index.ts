import {
	GetByIdentifierTodoService,
	GetTodoService,
	GetTodosRowVersionService,
	ToDoEntity,
} from '@kishornaik/todo-db-library';
import Container from 'typedi';
import { CreateTodosController } from './apps/features/v1/createTodos';
import { UpdateTodosController } from './apps/features/v1/updateTodos';
import { RemoveTodosController } from './apps/features/v1/removeTodos';
import { GetTodosByIdentifierController } from './apps/features/v1/getTodosByIdentifier';
import { GetByIdentifierService } from '@kishornaik/todo-db-library/dist/core/shared/services/db/getByIdentifer';
import { GetTodosController } from './apps/features/v1/getTodos';

Container.set<GetByIdentifierTodoService>(
	GetByIdentifierTodoService,
	new GetByIdentifierTodoService()
);
Container.set<GetTodoService>(GetTodoService, new GetTodoService());
Container.set<GetTodosRowVersionService>(
	GetTodosRowVersionService,
	new GetTodosRowVersionService()
);

export const todosModule: Function[] = [
	CreateTodosController,
	UpdateTodosController,
	RemoveTodosController,
	GetTodosByIdentifierController,
	GetTodosController,
];
