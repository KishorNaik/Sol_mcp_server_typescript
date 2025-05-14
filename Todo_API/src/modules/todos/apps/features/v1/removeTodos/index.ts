import {
	Body,
	Delete,
	Get,
	HttpCode,
	JsonController,
	OnUndefined,
	Param,
	Post,
	Res,
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
import { ENCRYPTION_KEY } from '@/config';
import {
	RemoveTodosRequestDto,
	RemoveTodosResponseDto,
} from '../../../contracts/features/v1/removeTodos/index.Contracts';
import { RemoveTodosValidationService } from './services/validation';
import { RemoveTodoDbService } from './services/Db';
import { getQueryRunner, StatusEnum, ToDoEntity } from '@kishornaik/todo-db-library';
import { RemoveTodoEncryptResponseService } from './services/encrypteResponse';
import { TodoRemovedDomainEvent } from './events/domain/todoRemoved';
import { RemoveTodoMapEntityService } from './services/mapEntity';
import {
	IIsTodoRemovedSharedService,
	IsTodoRemovedSharedService,
} from '../../../shared/services/isTodoRemoved';

// #region Controller
@JsonController('/api/v1/todos')
@OpenAPI({ tags: ['todos'] })
export class RemoveTodosController {
	@Delete('/:identifier')
	@OpenAPI({ summary: 'Remove Todos', tags: ['todos'] })
	@HttpCode(StatusCodes.OK)
	@OnUndefined(StatusCodes.BAD_REQUEST)
	public async removeAsync(@Param('identifier') identifier: string, @Res() res: Response) {
		const removeTodosRequestDto: RemoveTodosRequestDto = new RemoveTodosRequestDto();
		removeTodosRequestDto.identifier = identifier;

		const response = await mediatR.send<ApiDataResponse<AesResponseDto>>(
			new RemoveTodosCommand(removeTodosRequestDto)
		);
		return res.status(response.StatusCode).json(response);
	}
}
// #endregion

// #region Command
export class RemoveTodosCommand extends RequestData<ApiDataResponse<AesResponseDto>> {
	private readonly _request: RemoveTodosRequestDto;

	public constructor(request: RemoveTodosRequestDto) {
		super();
		this._request = request;
	}

	public get request(): RemoveTodosRequestDto {
		return this._request;
	}
}
// #endregion

// #region Command Handler
@sealed
@requestHandler(RemoveTodosCommand)
export class RemoveTodosCommandHandler
	implements RequestHandler<RemoveTodosCommand, ApiDataResponse<AesResponseDto>>
{
	private readonly _removeTodosValidationService: RemoveTodosValidationService;
	private readonly _isTodoRemovedService: IIsTodoRemovedSharedService;
	private readonly _removeTodoMapEntityService: RemoveTodoMapEntityService;
	private readonly _removeTodoDbService: RemoveTodoDbService;
	private readonly _removeTodoEncryptResponseService: RemoveTodoEncryptResponseService;

	public constructor() {
		this._removeTodosValidationService = Container.get(RemoveTodosValidationService);
		this._isTodoRemovedService = Container.get(IsTodoRemovedSharedService);
		this._removeTodoMapEntityService = Container.get(RemoveTodoMapEntityService);
		this._removeTodoDbService = Container.get(RemoveTodoDbService);
		this._removeTodoEncryptResponseService = Container.get(RemoveTodoEncryptResponseService);
	}

	public async handle(value: RemoveTodosCommand): Promise<ApiDataResponse<AesResponseDto>> {
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

			const removeTodoRequestDto: RemoveTodosRequestDto = value.request;
			// Validation Service
			const validationResult = await this._removeTodosValidationService.handleAsync({
				dto: removeTodoRequestDto,
				dtoClass: RemoveTodosRequestDto,
			});
			if (validationResult.isErr())
				return DataResponseFactory.error<AesResponseDto>(
					StatusCodes.BAD_REQUEST,
					validationResult.error.message
				);

			// Is Todo Removed
			const isTodoRemovedResult = await this._isTodoRemovedService.handleAsync({
				identifier: removeTodoRequestDto.identifier,
			});
			if (isTodoRemovedResult.isErr())
				return DataResponseFactory.error<AesResponseDto>(
					StatusCodes.NOT_FOUND,
					`Todo not found or already removed`
				);

			const mapEntityResult = await this._removeTodoMapEntityService.handleAsync({
				request: removeTodoRequestDto,
			});
			if (mapEntityResult.isErr())
				return DataResponseFactory.error<AesResponseDto>(
					StatusCodes.BAD_REQUEST,
					mapEntityResult.error.message
				);

			let todoEntity: ToDoEntity = mapEntityResult.value;

			await queryRunner.startTransaction();
			// Db Service
			const removeTodoDbServiceResult = await this._removeTodoDbService.handleAsync(
				todoEntity,
				queryRunner
			);
			if (removeTodoDbServiceResult.isErr())
				return DataResponseFactory.error<AesResponseDto>(
					StatusCodes.INTERNAL_SERVER_ERROR,
					removeTodoDbServiceResult.error.message
				);

			todoEntity = removeTodoDbServiceResult.value;

			// Map
			const removeTodoResponseDto: RemoveTodosResponseDto = new RemoveTodosResponseDto();
			removeTodoResponseDto.message = `todo removed successfully`;

			// Encrypt Service
			var encryptResponseResult = await this._removeTodoEncryptResponseService.handleAsync({
				data: removeTodoResponseDto,
				key: ENCRYPTION_KEY,
			});
			if (encryptResponseResult.isErr()) {
				await queryRunner.rollbackTransaction();

				return DataResponseFactory.error<AesResponseDto>(
					StatusCodes.INTERNAL_SERVER_ERROR,
					encryptResponseResult.error.message
				);
			}

			// Map
			const aesResponseDto: AesResponseDto = encryptResponseResult.value.aesResponseDto;

			await queryRunner.commitTransaction();

			// TodoRemoved Domain Event
			// - Set Cache
			await mediatR.publish(
				new TodoRemovedDomainEvent(todoEntity.identifier, StatusEnum.INACTIVE)
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
				StatusCodes.INTERNAL_SERVER_ERROR,
				error.message
			);
		} finally {
			await queryRunner.release();
		}
	}
}
// #endregion
