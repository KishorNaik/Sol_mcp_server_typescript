import { sealed } from '@/shared/utils/decorators/sealed';
import { ResultError, ResultExceptionFactory } from '@/shared/utils/exceptions/results';
import { logger } from '@/shared/utils/helpers/loggers';
import { redisCacheCircuitBreaker, RedisHelper } from '@/shared/utils/helpers/redis';
import { IServiceHandlerAsync } from '@/shared/utils/helpers/services';
import {
	GetByIdentifierTodoService,
	GetTodoService,
	GetTodosRowVersionService,
	SelectQueryBuilder,
	StatusEnum,
	ToDoEntity,
} from '@kishornaik/todo-db-library';
import { IGetVersionByIdentifierServiceResult } from '@kishornaik/todo-db-library';
import { StatusCodes } from 'http-status-codes';
import { Ok, Result } from 'neverthrow';
import Container, { Service } from 'typedi';

export interface ITodosSharedCacheServiceParameters {
	identifier: string; // key
	status: StatusEnum;
}

export interface ITodosSharedCacheServiceResult {
	isCached: boolean;
	entity: ToDoEntity;
}

export interface ITodoSharedCacheService
	extends IServiceHandlerAsync<
		ITodosSharedCacheServiceParameters,
		ITodosSharedCacheServiceResult
	> {}

@sealed
@Service()
export class TodosSharedCacheService implements ITodoSharedCacheService {
	private readonly _getTodoByIdentifierDbService: GetByIdentifierTodoService;
	private readonly _getTodoRowVersionDbService: GetTodosRowVersionService;
	private readonly _redisHelper: RedisHelper;

	public constructor() {
		this._getTodoByIdentifierDbService = Container.get(GetByIdentifierTodoService);
		this._getTodoRowVersionDbService = Container.get(GetTodosRowVersionService);
		this._redisHelper = Container.get(RedisHelper);
	}

	private async getTodosByIdentifierAsync(
		identifier: string,
		status: StatusEnum,
		isCached: boolean
	): Promise<Result<ITodosSharedCacheServiceResult, ResultError>> {
		if (!identifier)
			return ResultExceptionFactory.error(
				StatusCodes.INTERNAL_SERVER_ERROR,
				'identifier is null'
			);

		const entityObj: ToDoEntity = new ToDoEntity();
		entityObj.identifier = identifier;
		entityObj.status = status;
		const todoResult = await this._getTodoByIdentifierDbService.handleAsync(entityObj);
		if (todoResult.isErr())
			return ResultExceptionFactory.error(
				todoResult.error.statusCode,
				todoResult.error.message
			);

		const todosSharedCacheServiceResult: ITodosSharedCacheServiceResult = {
			entity: todoResult.value,
			isCached: isCached,
		};

		return new Ok(todosSharedCacheServiceResult);
	}

	public async handleAsync(
		params: ITodosSharedCacheServiceParameters
	): Promise<Result<ITodosSharedCacheServiceResult, ResultError>> {
		let entity: ToDoEntity;
		let isCached: boolean = false;
		const { identifier, status } = params;
		try {
			if (!params)
				return ResultExceptionFactory.error(
					StatusCodes.INTERNAL_SERVER_ERROR,
					'parameter is null'
				);

			if (!params.identifier)
				return ResultExceptionFactory.error(
					StatusCodes.INTERNAL_SERVER_ERROR,
					'identifier is null'
				);

			// init Redis Cache
			await this._redisHelper.init(true);

			const cacheKey = `Todo_${identifier}`;

			//const cacheValueResult = await this._redisHelper.get(cacheKey);
			const cacheValueResult = await redisCacheCircuitBreaker.fire(
				this._redisHelper,
				cacheKey
			);
			/*
      if (cacheValueResult.isErr())
			{
				logger.error(
					`Error getting cache value for key: ${cacheKey}`,
					cacheValueResult.error
				);

				return await this.getTodosByIdentifierAsync(identifier,status, false);
			}*/

			//const cacheValue: string = cacheValueResult.value;
			const cacheValue: string = cacheValueResult;
			if (!cacheValue) {
				// Get Todos Data by Identifier
				const todoResult = await this.getTodosByIdentifierAsync(identifier, status, false);
				if (todoResult.isErr())
					return ResultExceptionFactory.error(
						todoResult.error.status,
						todoResult.error.message
					);

				entity = todoResult.value.entity;
				if (!entity)
					return ResultExceptionFactory.error(StatusCodes.NOT_FOUND, 'entity not found');

				// Set Cache
				const setCacheResult = await this._redisHelper.set(
					cacheKey,
					JSON.stringify(entity)
				);
				if (setCacheResult.isErr()) {
					logger.error(
						`Error setting cache value for key: ${cacheKey}`,
						setCacheResult.error
					);

					return await this.getTodosByIdentifierAsync(identifier, status, false);
				}

				isCached = true;
			} else {
				entity = JSON.parse(cacheValue);
				if (!entity)
					return ResultExceptionFactory.error(StatusCodes.NOT_FOUND, 'entity not found');

				// Get Todos Row Version
				const todoRowVersionEntity: ToDoEntity = new ToDoEntity();
				todoRowVersionEntity.identifier = identifier;
				todoRowVersionEntity.status = status;

				const todoRowVersionResult =
					await this._getTodoRowVersionDbService.handleAsync(todoRowVersionEntity);
				if (todoRowVersionResult.isErr())
					return ResultExceptionFactory.error(
						todoRowVersionResult.error.statusCode,
						todoRowVersionResult.error.message
					);

				const todoRowVersionResponse: IGetVersionByIdentifierServiceResult =
					todoRowVersionResult.value;

				// Check Row Version
				if (entity.version !== todoRowVersionResponse.version) {
					// Get Todos Data by Identifier
					const todoResult = await this.getTodosByIdentifierAsync(
						identifier,
						status,
						false
					);
					if (todoResult.isErr())
						return ResultExceptionFactory.error(
							todoResult.error.status,
							todoResult.error.message
						);

					const latestTodoEntity: ToDoEntity = todoResult.value.entity;

					// Set Cache
					const setCacheResult = await this._redisHelper.set(
						cacheKey,
						JSON.stringify(latestTodoEntity)
					);
					if (setCacheResult.isErr()) {
						logger.error(
							`Error setting cache value for key: ${cacheKey}`,
							setCacheResult.error
						);

						return await this.getTodosByIdentifierAsync(identifier, status, false);
					}

					isCached = true;
					entity = latestTodoEntity;
				} else {
					isCached = false;
				}
			}

			const todosSharedCacheServiceResult: ITodosSharedCacheServiceResult = {
				entity: entity,
				isCached: isCached,
			};

			return new Ok(todosSharedCacheServiceResult);
		} catch (ex) {
			const error = ex as Error;
			const fallbackResult = await this.getTodosByIdentifierAsync(identifier, status, false);
			if (fallbackResult.isErr()) {
				logger.error(`Redis Fallback Error: ${error.message}`);
				return ResultExceptionFactory.error(
					fallbackResult.error.status,
					fallbackResult.error.message
				);
			}
			const fallback: ToDoEntity = fallbackResult.value.entity;
			return ResultExceptionFactory.error(
				StatusCodes.INTERNAL_SERVER_ERROR,
				error.message,
				fallback
			);
		} finally {
			await this._redisHelper.disconnect();
		}
	}
}
