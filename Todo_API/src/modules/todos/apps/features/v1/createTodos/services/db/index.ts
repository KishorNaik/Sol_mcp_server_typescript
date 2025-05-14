import Container, { Service } from 'typedi';
import { CreateTodosRequestDTO } from '../../../../../contracts/features/v1/createTodos/index.Contract';
import { AddTodosService, StatusEnum, ToDoEntity, QueryRunner } from '@kishornaik/todo-db-library';
import { IServiceHandlerAsync } from '@/shared/utils/helpers/services';
import { ResultError, ResultExceptionFactory } from '@/shared/utils/exceptions/results';
import { Err, Ok, Result } from 'neverthrow';
import { StatusCodes } from 'http-status-codes';
import { Guid } from 'guid-typescript';
import { sealed } from '@/shared/utils/decorators/sealed';

Container.set<AddTodosService>(AddTodosService, new AddTodosService());

@sealed
@Service()
export class CreateTodoDbService extends AddTodosService {
	public constructor() {
		super();
	}
}
