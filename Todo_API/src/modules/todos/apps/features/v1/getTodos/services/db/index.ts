import { PagedList } from '@kishornaik/todo-db-library/dist/core/shared/utils/miscellaneous/pageList';
import { IServiceHandlerAsync } from '../../../../../../../../shared/utils/helpers/services';
import { GetTodosRequestDto } from '../../../../../contracts/features/v1/getTodos/index.Contract';
import {
	GetTodoService,
	IPageListResult,
	Order,
	StatusEnum,
	ToDoEntity,
} from '@kishornaik/todo-db-library';
import { sealed } from '../../../../../../../../shared/utils/decorators/sealed';
import Container, { Service } from 'typedi';
import { Result, Ok } from 'neverthrow';
import {
	ResultError,
	ResultExceptionFactory,
} from '../../../../../../../../shared/utils/exceptions/results';
import { StatusCodes } from 'http-status-codes';
import {
	getPropertyNameByObject,
	getPropertyNameByType,
} from '../../../../../../../../shared/utils/miscellaneous/getPropertyName';

export interface IGetTodosDbServiceParameters {
	request: GetTodosRequestDto;
}

export interface IGetTodosDbService
	extends IServiceHandlerAsync<IGetTodosDbServiceParameters, IPageListResult<ToDoEntity>> {}

@sealed
@Service()
export class GetTodosDbService implements IGetTodosDbService {
	private readonly _getTodoService: GetTodoService;

	public constructor() {
		this._getTodoService = Container.get(GetTodoService);
	}

	public async handleAsync(
		params: IGetTodosDbServiceParameters
	): Promise<Result<IPageListResult<ToDoEntity>, ResultError>> {
		try {
			if (!params)
				return ResultExceptionFactory.error(StatusCodes.BAD_REQUEST, 'Invalid params');

			if (!params.request)
				return ResultExceptionFactory.error(StatusCodes.BAD_REQUEST, 'Invalid request');

			const request: GetTodosRequestDto = params.request;

			if (!request.pageNumber || !request.pageSize)
				return ResultExceptionFactory.error(
					StatusCodes.BAD_REQUEST,
					'pageNumber and pageSize is required'
				);

			const todoEntity: ToDoEntity = new ToDoEntity();
			todoEntity.status = StatusEnum.ACTIVE;

			let search: { title: string } | undefined;
			if (params.request.title) {
				search = {
					title: params.request.title,
				};
			}

			const todosResult = await this._getTodoService.handleAsync({
				pagination: {
					pageNumber: request.pageNumber,
					pageSize: request.pageSize,
				},
				sort: {
					by: [
						getPropertyNameByType<ToDoEntity>('created_date'),
						getPropertyNameByType<ToDoEntity>('modified_date'),
					],
					direction: Order.DESC,
				},
				search: search,
				queryRunner: undefined,
			});

			if (todosResult.isErr())
				return ResultExceptionFactory.error(
					todosResult.error.statusCode,
					todosResult.error.message
				);

			return new Ok(todosResult.value);
		} catch (ex) {
			const error = ex as Error;
			return ResultExceptionFactory.error(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
		}
	}
}
