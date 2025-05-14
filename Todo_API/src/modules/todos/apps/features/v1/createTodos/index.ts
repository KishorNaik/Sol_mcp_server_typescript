import {
	Body,
	Get,
	HttpCode,
	JsonController,
	OnUndefined,
	Post,
	Res,
	UseBefore,
} from 'routing-controllers';
import { Response } from 'express';
import { OpenAPI } from 'routing-controllers-openapi';
import { RequestData, RequestHandler, requestHandler } from 'mediatr-ts';
import {
	DataResponse as ApiDataResponse,
	DataResponse,
	DataResponseFactory,
} from '@/shared/models/response/data.Response';
import { AesResponseDto } from '@/shared/models/response/aes.ResponseDto';
import { sealed } from '@/shared/utils/decorators/sealed';
import Container from 'typedi';
import mediatR from '@/shared/medaitR/index';
import { StatusCodes } from 'http-status-codes';
import { AesRequestDto } from '@/shared/models/request/aes.RequestDto';
import { CreateTodosDecryptService } from './services/decrypteRequest';
import { ENCRYPTION_KEY } from '@/config';
import { CreateTodosValidationService } from './services/Validations';
import {
	CreateTodosRequestDTO,
	CreateTodosResponseDTO,
} from '../../../contracts/features/v1/createTodos/index.Contract';
import { CreateTodoDbService } from './services/db';
import { getQueryRunner, StatusEnum, ToDoEntity } from '@kishornaik/todo-db-library';
import { CreateTodoEncryptResponseService } from './services/encryptResponse';
import { TodoCreateDomainEvent } from './events/domain/todoCreated';
import { ValidationMiddleware } from '@/middlewares/validation.middleware';
import { CreateTodoMapEntityService } from './services/mapEntity';

// #region Controller
@JsonController('/api/v1/todos')
@OpenAPI({ tags: ['todos'] })
export class CreateTodosController {
	@Post()
	@OpenAPI({ summary: 'Create Todos', tags: ['todos'] })
	@HttpCode(StatusCodes.OK)
	@OnUndefined(StatusCodes.BAD_REQUEST)
	@UseBefore(ValidationMiddleware(AesRequestDto))
	public async createAsync(@Body() request: AesRequestDto, @Res() res: Response) {
		const response = await mediatR.send<ApiDataResponse<AesResponseDto>>(
			new CreateTodosCommand(request)
		);
		return res.status(response.StatusCode).json(response);
	}
}
// #endregion

// #region Command
export class CreateTodosCommand extends RequestData<ApiDataResponse<AesResponseDto>> {
	private readonly _request: AesRequestDto;
	constructor(request: AesRequestDto) {
		super();
		this._request = request;
	}
	public get request(): AesRequestDto {
		return this._request;
	}
}
// #endregion

// #region Command Handler
@sealed
@requestHandler(CreateTodosCommand)
export class CreateTodosCommandHandler
	implements RequestHandler<CreateTodosCommand, ApiDataResponse<AesResponseDto>>
{
	private readonly _createTodosDecryptService: CreateTodosDecryptService;
	private readonly _createTodosValidationService: CreateTodosValidationService;
	private readonly _createTodoMapEntityService: CreateTodoMapEntityService;
	private readonly _createTodoDbService: CreateTodoDbService;
	private readonly _createTodoEncryptService: CreateTodoEncryptResponseService;

	public constructor() {
		this._createTodosDecryptService = Container.get(CreateTodosDecryptService);
		this._createTodosValidationService = Container.get(CreateTodosValidationService);
		this._createTodoMapEntityService = Container.get(CreateTodoMapEntityService);
		this._createTodoDbService = Container.get(CreateTodoDbService);
		this._createTodoEncryptService = Container.get(CreateTodoEncryptResponseService);
	}

	public async handle(value: CreateTodosCommand): Promise<ApiDataResponse<AesResponseDto>> {
		const queryRunner = getQueryRunner();
		await queryRunner.connect();
		try {
			if (!value)
				return DataResponseFactory.error<AesResponseDto>(
					StatusCodes.BAD_REQUEST,
					'Invalid command'
				);

			if (!value.request)
				return DataResponseFactory.error<AesResponseDto>(
					StatusCodes.BAD_REQUEST,
					'Invalid request'
				);

			const aesRequestDto: AesRequestDto = value.request;

			// Decrypt Service
			const decryptedRequestResult = await this._createTodosDecryptService.handleAsync({
				data: aesRequestDto.body,
				key: ENCRYPTION_KEY,
			});
			if (decryptedRequestResult.isErr())
				return DataResponseFactory.error<AesResponseDto>(
					decryptedRequestResult.error.status,
					decryptedRequestResult.error.message
				);

			const createTodoRequestDto: CreateTodosRequestDTO = decryptedRequestResult.value;

			// Validation Service
			const createTodosValidationResult =
				await this._createTodosValidationService.handleAsync({
					//request: createTodoRequestDto,
					dto: createTodoRequestDto,
					dtoClass: CreateTodosRequestDTO,
				});
			if (createTodosValidationResult.isErr())
				return DataResponseFactory.error<AesResponseDto>(
					createTodosValidationResult.error.status,
					createTodosValidationResult.error.message
				);

			// Map Entity
			const mapEntityResult = await this._createTodoMapEntityService.handleAsync({
				request: createTodoRequestDto,
			});
			if (mapEntityResult.isErr())
				return DataResponseFactory.error<AesResponseDto>(
					mapEntityResult.error.status,
					mapEntityResult.error.message
				);
			let todoEntity: ToDoEntity = mapEntityResult.value;

			// DB Service
			await queryRunner.startTransaction();

			const createTodoDbResult = await this._createTodoDbService.handleAsync(
				todoEntity,
				queryRunner
			);
			if (createTodoDbResult.isErr()) {
				await queryRunner.rollbackTransaction();
				return DataResponseFactory.error<AesResponseDto>(
					createTodoDbResult.error.statusCode,
					createTodoDbResult.error.message
				);
			}

			todoEntity = createTodoDbResult.value;

			//const getTodoById=Container.get(GetByIdTodoService);

			// const getTodoByIdResult = await getTodoById.handleAsync(todoEntity, queryRunner);
			// if (getTodoByIdResult.isErr())
			//   return DataResponseFactory.error<AesResponseDto>(
			//     getTodoByIdResult.error.statusCode,
			//     getTodoByIdResult.error.message
			//   );
			// console.log(`Data: ${JSON.stringify(getTodoByIdResult.value)}`);

			// Map
			const createTodosResponseDto: CreateTodosResponseDTO = new CreateTodosResponseDTO();
			createTodosResponseDto.message = 'Success';

			// Encrypt Service
			const encryptResponseResult = await this._createTodoEncryptService.handleAsync({
				data: createTodosResponseDto,
				key: ENCRYPTION_KEY,
			});
			if (encryptResponseResult.isErr()) {
				await queryRunner.rollbackTransaction();
				return DataResponseFactory.error<AesResponseDto>(
					encryptResponseResult.error.status,
					encryptResponseResult.error.message
				);
			}

			const aesResponseDto: AesResponseDto = encryptResponseResult.value.aesResponseDto;
			await queryRunner.commitTransaction();

			// TodoCreated Domain Event
			// - Set Cache
			await mediatR.publish(
				new TodoCreateDomainEvent(todoEntity.identifier, StatusEnum.ACTIVE)
			);

			return DataResponseFactory.success<AesResponseDto>(
				StatusCodes.OK,
				aesResponseDto,
				'Success'
			);
		} catch (ex) {
			const error = ex as Error;
			if (queryRunner.isTransactionActive) {
				await queryRunner.rollbackTransaction();
			}
			return DataResponseFactory.error<AesResponseDto>(
				StatusCodes.INTERNAL_SERVER_ERROR,
				error.message
			);
		} finally {
			await queryRunner.release();
		}
	}
}
// #endregion
