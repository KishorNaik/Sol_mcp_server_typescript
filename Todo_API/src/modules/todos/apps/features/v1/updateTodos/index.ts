import {
	Body,
	Get,
	HttpCode,
	JsonController,
	OnUndefined,
	Post,
	Put,
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
import { ENCRYPTION_KEY } from '@/config';
import { UpdateTodosDecryptService } from './service/decryptRequest';
import {
	UpdateTodosRequestDTO,
	UpdateTodosResponseDTO,
} from '../../../contracts/features/v1/updateTodos/index.Contract';
import { UpdateTodosValidationService } from './service/validation';
import { UpdateTodoDbService } from './service/db';
import { getQueryRunner, StatusEnum, ToDoEntity } from '@kishornaik/todo-db-library';
import { UpdateTodosEncryptResponseService } from './service/encryptRequest';
import { TodoUpdatedDomainEvent } from './events/domain/todoUpdated';
import { ValidationMiddleware } from '@/middlewares/validation.middleware';
import { IUpdateTodoMapEntityService, UpdateTodoMapEntityService } from './service/mapEntity';
import {
	IIsTodoRemovedSharedService,
	IsTodoRemovedSharedService,
} from '../../../shared/services/isTodoRemoved';

// #region Controller
@JsonController('/api/v1/todos')
@OpenAPI({ tags: ['todos'] })
export class UpdateTodosController {
	@Put()
	@OpenAPI({ summary: 'Update Todos', tags: ['todos'] })
	@HttpCode(StatusCodes.OK)
	@OnUndefined(StatusCodes.BAD_REQUEST)
	@UseBefore(ValidationMiddleware(AesRequestDto))
	public async updateAsync(@Body() request: AesRequestDto, @Res() res: Response) {
		const response = await mediatR.send<ApiDataResponse<AesResponseDto>>(
			new UpdateTodosCommand(request)
		);
		return res.status(response.StatusCode).json(response);
	}
}
// #endregion

// #region Command
export class UpdateTodosCommand extends RequestData<ApiDataResponse<AesResponseDto>> {
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
@requestHandler(UpdateTodosCommand)
export class UpdateTodosCommandHandler
	implements RequestHandler<UpdateTodosCommand, ApiDataResponse<AesResponseDto>>
{
	private readonly _updateTodosDecryptService: UpdateTodosDecryptService;
	private readonly _updateTodosValidationService: UpdateTodosValidationService;
	private readonly _isTodoRemovedService: IIsTodoRemovedSharedService;
	private readonly _updateTodosMapEntityService: IUpdateTodoMapEntityService;
	private readonly _updateTodosDbService: UpdateTodoDbService;
	private readonly _updateTodoEncryptResponseService: UpdateTodosEncryptResponseService;

	public constructor() {
		this._updateTodosDecryptService = Container.get(UpdateTodosDecryptService);
		this._updateTodosValidationService = Container.get(UpdateTodosValidationService);
		this._isTodoRemovedService = Container.get(IsTodoRemovedSharedService);
		this._updateTodosMapEntityService = Container.get(UpdateTodoMapEntityService);
		this._updateTodosDbService = Container.get(UpdateTodoDbService);
		this._updateTodoEncryptResponseService = Container.get(UpdateTodosEncryptResponseService);
	}

	public async handle(value: UpdateTodosCommand): Promise<ApiDataResponse<AesResponseDto>> {
		let queryRunner = getQueryRunner();
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

			const request: AesRequestDto = value.request;

			// Decrypt Service
			const decryptRequestResult = await this._updateTodosDecryptService.handleAsync({
				data: request.body,
				key: ENCRYPTION_KEY,
			});
			if (decryptRequestResult.isErr())
				return DataResponseFactory.error<AesResponseDto>(
					decryptRequestResult.error.status,
					decryptRequestResult.error.message
				);

			const updateTodosRequestDto: UpdateTodosRequestDTO = decryptRequestResult.value;

			// Validation Service
			const validationResult = await this._updateTodosValidationService.handleAsync({
				dto: updateTodosRequestDto,
				dtoClass: UpdateTodosRequestDTO,
			});
			if (validationResult.isErr())
				return DataResponseFactory.error<AesResponseDto>(
					validationResult.error.status,
					validationResult.error.message
				);

			// Is Todo Removed
			const isTodoRemovedResult = await this._isTodoRemovedService.handleAsync({
				identifier: updateTodosRequestDto.identifier,
			});
			if (isTodoRemovedResult.isErr())
				return DataResponseFactory.error<AesResponseDto>(
					StatusCodes.NOT_FOUND,
					`Todo not found or already removed`
				);

			// Map Entity
			const mapEntityResult = await this._updateTodosMapEntityService.handleAsync({
				request: updateTodosRequestDto,
			});
			if (mapEntityResult.isErr())
				return DataResponseFactory.error<AesResponseDto>(
					mapEntityResult.error.status,
					mapEntityResult.error.message
				);

			let todoEntity: ToDoEntity = mapEntityResult.value;

			await queryRunner.startTransaction();

			// Update Todo Db Service
			const updateTodoDbResult = await this._updateTodosDbService.handleAsync(
				todoEntity,
				queryRunner
			);
			if (updateTodoDbResult.isErr())
				return DataResponseFactory.error<AesResponseDto>(
					updateTodoDbResult.error.statusCode,
					updateTodoDbResult.error.message
				);

			todoEntity = updateTodoDbResult.value;

			// Map
			const updateTodosResponseDto: UpdateTodosResponseDTO = new UpdateTodosResponseDTO();
			updateTodosResponseDto.message = 'Todo Updated Successfully';

			// Encrypt Response
			const encryptResponseResult = await this._updateTodoEncryptResponseService.handleAsync({
				data: updateTodosResponseDto,
				key: ENCRYPTION_KEY,
			});
			if (encryptResponseResult.isErr())
				return DataResponseFactory.error<AesResponseDto>(
					encryptResponseResult.error.status,
					encryptResponseResult.error.message
				);

			const aesResponseDto: AesResponseDto = encryptResponseResult.value.aesResponseDto;
			await queryRunner.commitTransaction();

			// TodoUpdated Domain Event
			// - Set Cache
			await mediatR.publish(
				new TodoUpdatedDomainEvent(todoEntity.identifier, StatusEnum.ACTIVE)
			);

			return DataResponseFactory.success<AesResponseDto>(
				StatusCodes.OK,
				aesResponseDto,
				'Success'
			);
		} catch (ex) {
			const error = ex as Error;
			await queryRunner.rollbackTransaction();
			return DataResponseFactory.error<AesResponseDto>(
				StatusCodes.BAD_REQUEST,
				error.message
			);
		} finally {
			await queryRunner.release();
		}
	}
}
// #endregion
