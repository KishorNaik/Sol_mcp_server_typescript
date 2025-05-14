import { UpdateTodosRequestDTO } from '@/modules/todos/apps/contracts/features/v1/updateTodos/index.Contract';
import { sealed } from '@/shared/utils/decorators/sealed';
import { ResultError, ResultExceptionFactory } from '@/shared/utils/exceptions/results';
import { IServiceHandlerAsync } from '@/shared/utils/helpers/services';
import {
	StatusEnum,
	ToDoEntity,
	UpdateTodosService,
	QueryRunner,
} from '@kishornaik/todo-db-library';
import { StatusCodes } from 'http-status-codes';
import { Err, Ok, Result } from 'neverthrow';
import Container, { Service } from 'typedi';

Container.set<UpdateTodosService>(UpdateTodosService, new UpdateTodosService());

@sealed
@Service()
export class UpdateTodoDbService extends UpdateTodosService {
	public constructor() {
		super();
	}
}
