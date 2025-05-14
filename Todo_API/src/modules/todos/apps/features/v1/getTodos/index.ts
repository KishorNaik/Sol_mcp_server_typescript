import {
	Body,
	Delete,
	Get,
	HttpCode,
	JsonController,
	OnUndefined,
	Param,
	Post,
	QueryParams,
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
	PaginationDataResponseModel,
} from '@/shared/models/response/data.Response';
import { AesResponseDto } from '@/shared/models/response/aes.ResponseDto';
import Container from 'typedi';
import mediatR from '@/shared/medaitR/index';
import { StatusCodes } from 'http-status-codes';
import { ENCRYPTION_KEY } from '@/config';
import { ValidationMiddleware } from '../../../../../../middlewares/validation.middleware';
import {
	GetTodosRequestDto,
	GetTodosResponseDto,
} from '../../../contracts/features/v1/getTodos/index.Contract';
import { sealed } from '../../../../../../shared/utils/decorators/sealed';
import { request } from 'http';
import { GetTodosDbService, IGetTodosDbService } from './services/db';
import { IPageListResult, ToDoEntity } from '@kishornaik/todo-db-library';
import { GetTodosMapResponseService, IGetTodosMapResponseService } from './services/mapResponse';
import { GetTodosEncryptResponseService } from './services/encryptResponse';

//#region Controller
@JsonController('/api/v1/todos')
@OpenAPI({ tags: ['todos'] })
export class GetTodosController {
	@Get('')
	@OpenAPI({ summary: 'Get Todos', tags: ['todos'] })
	@HttpCode(StatusCodes.OK)
	@OnUndefined(StatusCodes.BAD_REQUEST)
	@UseBefore(ValidationMiddleware(GetTodosRequestDto))
	public async getTodosAsync(@QueryParams() request: GetTodosRequestDto, @Res() res: Response) {
		const response = await mediatR.send<ApiDataResponse<AesResponseDto>>(
			new GetTodosQuery(request)
		);
		return res.status(response.StatusCode).json(response);
	}
}
//#endregion

// #region Query
export class GetTodosQuery extends RequestData<ApiDataResponse<AesResponseDto>> {
	private readonly _request: GetTodosRequestDto;

	public constructor(request: GetTodosRequestDto) {
		super();
		this._request = request;
	}

	public get request(): GetTodosRequestDto {
		return this._request;
	}
}
// #endregion

// #region Query Handler
@sealed
@requestHandler(GetTodosQuery)
export class GetTodosQueryHandler
	implements RequestHandler<GetTodosQuery, ApiDataResponse<AesResponseDto>>
{
	private readonly _getTodosDbService: IGetTodosDbService;
	private readonly _getTodosMapResponseService: IGetTodosMapResponseService;
	private readonly _getTodosEncryptResponseService: GetTodosEncryptResponseService;

	public constructor() {
		this._getTodosDbService = Container.get(GetTodosDbService);
		this._getTodosMapResponseService = Container.get(GetTodosMapResponseService);
		this._getTodosEncryptResponseService = Container.get(GetTodosEncryptResponseService);
	}

	public async handle(value: GetTodosQuery): Promise<ApiDataResponse<AesResponseDto>> {
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

			const getTodosRequestDto: GetTodosRequestDto = value.request;

			const getTodosDbServiceResult = await this._getTodosDbService.handleAsync({
				request: getTodosRequestDto,
			});
			if (getTodosDbServiceResult.isErr())
				return DataResponseFactory.error<AesResponseDto>(
					getTodosDbServiceResult.error.status,
					getTodosDbServiceResult.error.message
				);

			const todos: IPageListResult<ToDoEntity> = getTodosDbServiceResult.value;
			const items: ToDoEntity[] = todos.items;
			const pagination: PaginationDataResponseModel =
				todos.page as PaginationDataResponseModel;

			// Map Response
			const getTodosMapResponseResult = await this._getTodosMapResponseService.handleAsync({
				todos: items,
			});
			if (getTodosMapResponseResult.isErr())
				return DataResponseFactory.error<AesResponseDto>(
					getTodosMapResponseResult.error.status,
					getTodosMapResponseResult.error.message
				);

			const getTodosResponseDto: Array<GetTodosResponseDto> = getTodosMapResponseResult.value;

			// Encrypt Response
			const getTodosEncryptResponseResult =
				await this._getTodosEncryptResponseService.handleAsync({
					data: getTodosResponseDto,
					key: ENCRYPTION_KEY,
				});
			if (getTodosEncryptResponseResult.isErr())
				return DataResponseFactory.error<AesResponseDto>(
					getTodosEncryptResponseResult.error.status,
					getTodosEncryptResponseResult.error.message
				);

			// Response
			const aesResponseDto: AesResponseDto =
				getTodosEncryptResponseResult.value.aesResponseDto;
			return DataResponseFactory.success<AesResponseDto>(
				StatusCodes.OK,
				aesResponseDto,
				'Success',
				pagination as PaginationDataResponseModel
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
