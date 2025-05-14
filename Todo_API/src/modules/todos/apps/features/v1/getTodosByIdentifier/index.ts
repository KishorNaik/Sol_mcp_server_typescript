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
import Container from 'typedi';
import mediatR from '@/shared/medaitR/index';
import { StatusCodes } from 'http-status-codes';
import { ENCRYPTION_KEY } from '@/config';
import {
	GetTodosByIdentifierRequestDto,
	GetTodosByIdentifierResponseDto,
} from '../../../contracts/features/v1/getTodosByIdentifier/index.Contract';
import { sealed } from '@/shared/utils/decorators/sealed';
import { GetTodosByIdentifierValidationService } from '../../../shared/services/getTodosByIdentifier/validation';
import { GetTodosByIdentifierDbService } from '../../../shared/services/getTodosByIdentifier/Db';
import { StatusEnum, ToDoEntity } from '@kishornaik/todo-db-library';
import {
	GetTodosByIdentifierMapperResponseService,
	IGetTodosByIdentifierMapperResponseService,
} from '../../../shared/services/getTodosByIdentifier/mapResponse';
import { GetTodosByIdentifierEncryptResponseService } from './services/encryptResponse/Index';
import {
	GetTodosByIdentifierSharedService,
	IGetTodosByIdentifierSharedService,
} from '../../../shared/services/getTodosByIdentifier';

//#region Controller
@JsonController('/api/v1/todos')
@OpenAPI({ tags: ['todos'] })
@HttpCode(StatusCodes.OK)
@OnUndefined(StatusCodes.BAD_REQUEST)
export class GetTodosByIdentifierController {
	@Get('/:identifier')
	@OpenAPI({ summary: 'Get Todos By Identifier', tags: ['todos'] })
	@HttpCode(StatusCodes.OK)
	@OnUndefined(StatusCodes.BAD_REQUEST)
	public async getTodosByIdentifierAsync(
		@Param('identifier') identifier: string,
		@Res() res: Response
	) {
		const getTodosByIdentifierRequestDto: GetTodosByIdentifierRequestDto =
			new GetTodosByIdentifierRequestDto();
		getTodosByIdentifierRequestDto.identifier = identifier;

		const response = await mediatR.send<ApiDataResponse<AesResponseDto>>(
			new GetTodosByIdentifierQuery(getTodosByIdentifierRequestDto)
		);
		return res.status(response.StatusCode).json(response);
	}
}
//#endregion

//#region Query
export class GetTodosByIdentifierQuery extends RequestData<ApiDataResponse<AesResponseDto>> {
	private readonly _request: GetTodosByIdentifierRequestDto;

	public constructor(request: GetTodosByIdentifierRequestDto) {
		super();
		this._request = request;
	}

	public get request(): GetTodosByIdentifierRequestDto {
		return this._request;
	}
}
//#endregion

// #region Query Handler
@sealed
@requestHandler(GetTodosByIdentifierQuery)
export class GetTodosByIdentifierQueryHandler
	implements RequestHandler<GetTodosByIdentifierQuery, ApiDataResponse<AesResponseDto>>
{
	private readonly _getTodosByIdentifierSharedService: IGetTodosByIdentifierSharedService;
	private readonly _getTodosByIdentifierEncryptResponseService: GetTodosByIdentifierEncryptResponseService;

	public constructor() {
		this._getTodosByIdentifierSharedService = Container.get(GetTodosByIdentifierSharedService);
		this._getTodosByIdentifierEncryptResponseService = Container.get(
			GetTodosByIdentifierEncryptResponseService
		);
	}

	public async handle(
		value: GetTodosByIdentifierQuery
	): Promise<ApiDataResponse<AesResponseDto>> {
		try {
			if (!value)
				return DataResponseFactory.error<AesResponseDto>(
					StatusCodes.BAD_REQUEST,
					'Invalid Request'
				);

			if (!value.request)
				return DataResponseFactory.error<AesResponseDto>(
					StatusCodes.BAD_REQUEST,
					'Invalid Request'
				);

			const request: GetTodosByIdentifierRequestDto = value.request;
			console.log(request.identifier);

			// Get By Identifier Shared Service
			const getTodosByIdentifierSharedServiceResult =
				await this._getTodosByIdentifierSharedService.handleAsync(request);
			if (getTodosByIdentifierSharedServiceResult.isErr())
				return DataResponseFactory.error<AesResponseDto>(
					getTodosByIdentifierSharedServiceResult.error.status,
					getTodosByIdentifierSharedServiceResult.error.message
				);

			const getTodosByIdentifierResponseDto: GetTodosByIdentifierResponseDto =
				getTodosByIdentifierSharedServiceResult.value;

			// Encrypt Response
			const encryptResponseResult =
				await this._getTodosByIdentifierEncryptResponseService.handleAsync({
					data: getTodosByIdentifierResponseDto,
					key: ENCRYPTION_KEY,
				});
			if (encryptResponseResult.isErr())
				return DataResponseFactory.error<AesResponseDto>(
					encryptResponseResult.error.status,
					encryptResponseResult.error.message
				);

			// Return
			const aesResponseDto: AesResponseDto = encryptResponseResult.value.aesResponseDto;

			return DataResponseFactory.success<AesResponseDto>(
				StatusCodes.OK,
				aesResponseDto,
				'Success'
			);
		} catch (ex) {
			const error = ex as Error;
			return DataResponseFactory.error<AesResponseDto>(
				StatusCodes.INTERNAL_SERVER_ERROR,
				error.message
			);
		}
	}
}

// #endregion
