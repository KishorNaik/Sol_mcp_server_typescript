import { RemoveTodosRequestDto } from '@/modules/todos/apps/contracts/features/v1/removeTodos/index.Contracts';
import { sealed } from '@/shared/utils/decorators/sealed';
import { ResultError, ResultExceptionFactory } from '@/shared/utils/exceptions/results';
import { IServiceHandlerAsync } from '@/shared/utils/helpers/services';
import { StatusEnum, ToDoEntity } from '@kishornaik/todo-db-library';
import { StatusCodes } from 'http-status-codes';
import { Ok, Result } from 'neverthrow';
import { Service } from 'typedi';

export interface IRemoveTodoMapEntityServiceParameters {
	request: RemoveTodosRequestDto;
}

export interface IRemoveTodoMapEntityService
	extends IServiceHandlerAsync<IRemoveTodoMapEntityServiceParameters, ToDoEntity> {}

@sealed
@Service()
export class RemoveTodoMapEntityService implements IRemoveTodoMapEntityService {
	public async handleAsync(
		params: IRemoveTodoMapEntityServiceParameters
	): Promise<Result<ToDoEntity, ResultError>> {
		try {
			if (!params)
				return ResultExceptionFactory.error(StatusCodes.BAD_REQUEST, 'parameter is null');

			if (!params.request)
				return ResultExceptionFactory.error(StatusCodes.BAD_REQUEST, 'request is null');

			const request: RemoveTodosRequestDto = params.request;

			const todoEntity: ToDoEntity = new ToDoEntity();
			todoEntity.identifier = request.identifier;
			todoEntity.status = StatusEnum.INACTIVE;

			return new Ok(todoEntity);
		} catch (ex) {
			const error = ex as Error;
			return ResultExceptionFactory.error(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
		}
	}
}
