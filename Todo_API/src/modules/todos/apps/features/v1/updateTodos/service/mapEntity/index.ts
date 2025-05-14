import { UpdateTodosRequestDTO } from '@/modules/todos/apps/contracts/features/v1/updateTodos/index.Contract';
import { sealed } from '@/shared/utils/decorators/sealed';
import { ResultError, ResultExceptionFactory } from '@/shared/utils/exceptions/results';
import { IServiceHandlerAsync } from '@/shared/utils/helpers/services';
import { StatusEnum, ToDoEntity } from '@kishornaik/todo-db-library';
import { StatusCodes } from 'http-status-codes';
import { Ok, Result } from 'neverthrow';
import { Service } from 'typedi';

export interface IUpdateTodoMapEntityServiceParameter {
	request: UpdateTodosRequestDTO;
}

export interface IUpdateTodoMapEntityService
	extends IServiceHandlerAsync<IUpdateTodoMapEntityServiceParameter, ToDoEntity> {}

@sealed
@Service()
export class UpdateTodoMapEntityService implements IUpdateTodoMapEntityService {
	public async handleAsync(
		params: IUpdateTodoMapEntityServiceParameter
	): Promise<Result<ToDoEntity, ResultError>> {
		try {
			if (!params)
				return ResultExceptionFactory.error(StatusCodes.BAD_REQUEST, 'Invalid Params');

			if (!params.request)
				return ResultExceptionFactory.error(StatusCodes.BAD_REQUEST, 'Invalid Request');

			const request: UpdateTodosRequestDTO = params.request;
			const todoEntity: ToDoEntity = new ToDoEntity();
			todoEntity.identifier = request.identifier;
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
