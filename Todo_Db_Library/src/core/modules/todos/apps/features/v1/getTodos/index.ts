import Container, { Service } from 'typedi';
import { ToDoEntity } from '../../../../infrastructures/entity/todos/index.Entity';
import { GetService } from '../../../../../../shared/services/db/get';
import { IPageListResult, IPagination } from '../../../../../../shared/models/types/pagination';
import { ISort } from '../../../../../../shared/models/types/order';
import { QueryRunner, SelectQueryBuilder } from 'typeorm';
import { IServiceHandlerAsync } from '../../../../../../shared/utils/helpers/services';
import { Ok, Result } from 'neverthrow';
import {
	ResultError,
	ResultExceptionFactory,
} from '../../../../../../shared/utils/exceptions/results';
import { StatusCodes } from 'http-status-codes';
import { StatusEnum } from '../../../../../../shared/models/enums/status.enum';

// @Service decorator is not working if constructor has the parameters, then set the container.
Container.set<GetService<ToDoEntity>>(
	GetService<ToDoEntity>,
	new GetService<ToDoEntity>(ToDoEntity)
);

export interface IGetTodosServiceParameters {
	pagination: IPagination;
	search?:
		| {
				title: string;
		  }
		| undefined;
	sort?: ISort;
	queryRunner?: QueryRunner;
}

export interface IGetTodosService
	extends IServiceHandlerAsync<IGetTodosServiceParameters, IPageListResult<ToDoEntity>> {}

@Service()
export class GetTodoService implements IGetTodosService {
	private readonly _getService: GetService<ToDoEntity>;

	public constructor() {
		this._getService = Container.get(GetService<ToDoEntity>);
		//this._getService=new GetService<ToDoEntity>(ToDoEntity);
	}
	public async handleAsync(
		params: IGetTodosServiceParameters
	): Promise<Result<IPageListResult<ToDoEntity>, ResultError>> {
		try {
			if (!params)
				return ResultExceptionFactory.error(StatusCodes.BAD_REQUEST, 'Invalid params');

			if (!params.pagination)
				return ResultExceptionFactory.error(StatusCodes.BAD_REQUEST, 'Invalid pagination');

			const todoEntity: ToDoEntity = new ToDoEntity();
			todoEntity.status = StatusEnum.ACTIVE;

			console.log(`Get Service Begin.....`);

			const getTodosResult = await this._getService.handleAsync(
				todoEntity,
				params.pagination,
				params.sort,
				params.queryRunner ?? undefined
			);

			if (getTodosResult.isErr())
				return ResultExceptionFactory.error(
					getTodosResult.error.statusCode,
					getTodosResult.error.message
				);
			console.log(`Get Service Passed`);

			// Filter
			let queryBuilder: SelectQueryBuilder<ToDoEntity> =
				getTodosResult.value.selectQueryBuilder;
			if (params?.search) {
				if (!params.search.title)
					return ResultExceptionFactory.error(StatusCodes.BAD_REQUEST, 'Invalid search');

				const title = params.search.title;
				queryBuilder.andWhere('entity.title ILIKE :title', { title: `%${title}%` });
			}

			const getTodos = await queryBuilder.getMany();
			if (getTodos.length === 0)
				return ResultExceptionFactory.error(StatusCodes.NOT_FOUND, 'No todo found');

			const pageListResult: IPageListResult<ToDoEntity> = {
				items: getTodos,
				page: {
					currentPage: getTodosResult.value.currentPage,
					pageSize: params.pagination.pageSize,
					totalPages: getTodosResult.value.totalPages,
					totalCount: getTodosResult.value.totalCount,
					hasNext: getTodosResult.value.hasNext,
					hasPrevious: getTodosResult.value.hasPrevious,
				},
			};

			return new Ok(pageListResult);
		} catch (ex) {
			const error = ex as Error;
			return ResultExceptionFactory.error(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
		}
	}
}
