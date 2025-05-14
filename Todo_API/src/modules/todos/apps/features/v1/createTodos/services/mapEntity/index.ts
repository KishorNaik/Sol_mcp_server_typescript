import { CreateTodosRequestDTO } from '@/modules/todos/apps/contracts/features/v1/createTodos/index.Contract';
import { sealed } from '@/shared/utils/decorators/sealed';
import { ResultError, ResultExceptionFactory } from '@/shared/utils/exceptions/results';
import { IServiceHandlerAsync } from '@/shared/utils/helpers/services';
import { StatusEnum, ToDoEntity } from '@kishornaik/todo-db-library';
import { Guid } from 'guid-typescript';
import { StatusCodes } from 'http-status-codes';
import { Err, Ok, Result } from 'neverthrow';
import { Service } from 'typedi';

export interface ICreateTodoMapEntityServiceParameters {
	request: CreateTodosRequestDTO;
}

export interface ICreateTodoMapEntityService
	extends IServiceHandlerAsync<ICreateTodoMapEntityServiceParameters, ToDoEntity> {}

@sealed
@Service()
export class CreateTodoMapEntityService implements ICreateTodoMapEntityService {
	public async handleAsync(
		params: ICreateTodoMapEntityServiceParameters
	): Promise<Result<ToDoEntity, ResultError>> {
		try {
			if (!params)
				return ResultExceptionFactory.error(StatusCodes.BAD_REQUEST, 'parameter is null');

			if (!params.request)
				return ResultExceptionFactory.error(StatusCodes.BAD_REQUEST, 'request is null');

			const request: CreateTodosRequestDTO = params.request;
			const todoEntity: ToDoEntity = new ToDoEntity();
			todoEntity.identifier = Guid.create().toString();
			todoEntity.title = request.title;
			todoEntity.description = request.description;
			todoEntity.status = StatusEnum.ACTIVE;
			todoEntity.created_date = new Date();
			todoEntity.modified_date = new Date();

			return new Ok(todoEntity);
		} catch (ex) {
			const error = ex as Error;
			return ResultExceptionFactory.error(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
		}
	}
}
