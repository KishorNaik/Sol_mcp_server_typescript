import { GetTodosByIdentifierRequestDto } from '@/modules/todos/apps/contracts/features/v1/getTodosByIdentifier/index.Contract';
import { TodosSharedCacheService } from '@/modules/todos/apps/shared/cache';
import { sealed } from '@/shared/utils/decorators/sealed';
import { ResultError, ResultExceptionFactory } from '@/shared/utils/exceptions/results';
import { IServiceHandlerAsync } from '@/shared/utils/helpers/services';
import { StatusEnum, ToDoEntity } from '@kishornaik/todo-db-library';
import { StatusCodes } from 'http-status-codes';
import { Ok, Result } from 'neverthrow';
import { Service } from 'typedi';

export interface IGetTodosByIdentifierDbServiceParameters {
	request: GetTodosByIdentifierRequestDto;
	status: StatusEnum;
}

export interface IGetTodosByIdentifierDbService
	extends IServiceHandlerAsync<IGetTodosByIdentifierDbServiceParameters, ToDoEntity> {}

@sealed
@Service()
export class GetTodosByIdentifierDbService implements IGetTodosByIdentifierDbService {
	private readonly _todosSharedCacheService: TodosSharedCacheService;

	public constructor(todosSharedCacheService: TodosSharedCacheService) {
		this._todosSharedCacheService = todosSharedCacheService;
	}

	public async handleAsync(
		params: IGetTodosByIdentifierDbServiceParameters
	): Promise<Result<ToDoEntity, ResultError>> {
		let todoEntityResult: ToDoEntity;
		try {
			if (!params)
				return ResultExceptionFactory.error(StatusCodes.BAD_REQUEST, 'Invalid parameters');

			if (!params.request)
				return ResultExceptionFactory.error(StatusCodes.BAD_REQUEST, 'Invalid request');

			const { request, status } = params;
			console.log(`GetTodosByIdentifierDbService.handleAsync: ${JSON.stringify(request)}`);
			console.log(`status: ${status}`);

			const todoEntity: ToDoEntity = new ToDoEntity();
			todoEntity.identifier = request.identifier;
			todoEntity.status = status;

			const getTodosByIdentifierResult = await this._todosSharedCacheService.handleAsync({
				identifier: request.identifier,
				status: status,
			});
			if (getTodosByIdentifierResult.isErr()) {
				const fallback: ToDoEntity = getTodosByIdentifierResult.error
					?.fallbackObject as ToDoEntity;
				if (!fallback)
					return ResultExceptionFactory.error(StatusCodes.NOT_FOUND, 'Todo not found');
				todoEntityResult = fallback;
			} else {
				todoEntityResult = getTodosByIdentifierResult.value.entity;
			}

			if (!todoEntityResult)
				return ResultExceptionFactory.error(StatusCodes.NOT_FOUND, 'Todo not found');

			return new Ok(todoEntityResult);
		} catch (ex) {
			const error = ex as Error;
			return ResultExceptionFactory.error(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
		}
	}
}
