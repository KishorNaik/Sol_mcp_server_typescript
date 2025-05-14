import { IServiceHandlerAsync } from '@/shared/utils/helpers/services';
import {
	GetTodosByIdentifierRequestDto,
	GetTodosByIdentifierResponseDto,
} from '../../../contracts/features/v1/getTodosByIdentifier/index.Contract';
import { sealed } from '@/shared/utils/decorators/sealed';
import Container, { Service } from 'typedi';
import { ResultError, ResultExceptionFactory } from '@/shared/utils/exceptions/results';
import { Result, Ok } from 'neverthrow';
import { StatusCodes } from 'http-status-codes';
import { GetTodosByIdentifierValidationService } from './validation';
import { GetTodosByIdentifierDbService } from './Db';
import {
	GetTodosByIdentifierMapperResponseService,
	IGetTodosByIdentifierMapperResponseService,
} from './mapResponse';
import { StatusEnum, ToDoEntity } from '@kishornaik/todo-db-library';

export interface IGetTodosByIdentifierSharedService
	extends IServiceHandlerAsync<GetTodosByIdentifierRequestDto, GetTodosByIdentifierResponseDto> {}

@sealed
@Service()
export class GetTodosByIdentifierSharedService implements IGetTodosByIdentifierSharedService {
	private readonly _validationService: GetTodosByIdentifierValidationService;
	private readonly _getTodosByIdentifierDbService: GetTodosByIdentifierDbService;
	private readonly _getTodosByIdentifierMapper: IGetTodosByIdentifierMapperResponseService;

	public constructor() {
		this._validationService = Container.get(GetTodosByIdentifierValidationService);
		this._getTodosByIdentifierDbService = Container.get(GetTodosByIdentifierDbService);
		this._getTodosByIdentifierMapper = Container.get(GetTodosByIdentifierMapperResponseService);
	}

	public async handleAsync(
		params: GetTodosByIdentifierRequestDto
	): Promise<Result<GetTodosByIdentifierResponseDto, ResultError>> {
		try {
			if (!params)
				return ResultExceptionFactory.error(StatusCodes.BAD_REQUEST, 'Invalid Request');

			// Validation Service
			const validationServiceResult = await this._validationService.handleAsync({
				dto: params,
				dtoClass: GetTodosByIdentifierRequestDto,
			});
			if (validationServiceResult.isErr())
				return ResultExceptionFactory.error(
					StatusCodes.BAD_REQUEST,
					validationServiceResult.error.message
				);

			// Db Service
			const dbServiceResult = await this._getTodosByIdentifierDbService.handleAsync({
				request: params,
				status: StatusEnum.ACTIVE,
			});
			if (dbServiceResult.isErr())
				return ResultExceptionFactory.error(
					dbServiceResult.error.status,
					dbServiceResult.error.message
				);

			const todoEntity: ToDoEntity = dbServiceResult.value;

			// Map Response
			const mapperResponseResult =
				await this._getTodosByIdentifierMapper.handleAsync(todoEntity);
			if (mapperResponseResult.isErr())
				return ResultExceptionFactory.error(
					mapperResponseResult.error.status,
					mapperResponseResult.error.message
				);
			const getTodosByIdentifierResponseDto: GetTodosByIdentifierResponseDto =
				mapperResponseResult.value;

			return new Ok(getTodosByIdentifierResponseDto);
		} catch (ex) {
			const error = ex as Error;
			return ResultExceptionFactory.error(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
		}
	}
}
