import { Service } from 'typedi';
import { sealed } from '../../../../../../../shared/utils/decorators/sealed/index.js';
import { IServiceHandlerAsync } from '../../../../../../../shared/utils/helpers/services/index.js';
import { Ok, Result } from 'neverthrow';
import {
	ResultError,
	ResultExceptionFactory,
} from '../../../../../../../shared/utils/exceptions/results/index.js';
import { StatusCodes } from 'http-status-codes';
import { AxiosHelper } from '../../../../../../../shared/utils/helpers/axios/index.js';
import { BASE_URL, ENCRYPTION_KEY } from '../../../../../../../config/env/index.js';
import { AES } from '../../../../../../../shared/utils/helpers/aes/index.js';
import { AesRequestDto } from '../../../../../../../shared/models/request/aes.RequestDto.js';
import { AesResponseDto } from '../../../../../../../shared/models/response/aes.ResponseDto.js';
import { DataResponse } from '../../../../../../../shared/models/response/data.Response.js';

export interface IAddTodosApiServiceParameters {
	title?: string;
	description?: string;
}

export interface IAddTodosApiServiceResults {
	message: string;
}

export interface IAddTodosApiService
	extends IServiceHandlerAsync<IAddTodosApiServiceParameters, IAddTodosApiServiceResults> {}

@sealed
@Service()
export class AddTodosApiService implements IAddTodosApiService {
	public async handleAsync(
		params: IAddTodosApiServiceParameters
	): Promise<Result<IAddTodosApiServiceResults, ResultError>> {
		try {
			//Guards
			if (!params)
				return ResultExceptionFactory.error(StatusCodes.BAD_REQUEST, `Invalid Params`);

			// Create an Instance of Axios Helper
			const axiosHelper: AxiosHelper = new AxiosHelper({
				baseURL: String(BASE_URL),
			});

			// request Body
			const requestBody = params;

			// Encrypt Body
			const aes = new AES(String(ENCRYPTION_KEY));
			const encryptRequestBody = await aes.encryptAsync(JSON.stringify(requestBody));

			const aesRequestBodyDto: AesRequestDto = new AesRequestDto();
			aesRequestBodyDto.body = encryptRequestBody;

			// API Request
			const responseResult = await axiosHelper.postAsync<AesRequestDto, AesResponseDto>(
				'/api/v1/todos',
				aesRequestBodyDto
			);
			if (responseResult.isErr())
				return ResultExceptionFactory.error(
					responseResult.error.statusCode,
					responseResult.error.message
				);

			const response: DataResponse<AesResponseDto> = responseResult.value;
			if (!response.Success)
				return ResultExceptionFactory.error(response.StatusCode!, response.Message!);

			// Decrypt Body
			const aesResponseBodyDto: AesResponseDto = response.Data!;
			if (!aesResponseBodyDto.body)
				return ResultExceptionFactory.error(StatusCodes.NOT_FOUND, `Body not found`);

			const decryptResponseBody = await aes.decryptAsync(aesResponseBodyDto.body!);
			if (!decryptResponseBody)
				return ResultExceptionFactory.error(
					StatusCodes.NOT_ACCEPTABLE,
					'Failed to decrypt response body'
				);

			const responseBody: IAddTodosApiServiceResults = JSON.parse(decryptResponseBody);
			if (!responseBody)
				return ResultExceptionFactory.error(
					StatusCodes.NOT_ACCEPTABLE,
					'Failed to parse response body'
				);

			return new Ok(responseBody);
		} catch (ex) {
			const error = ex as Error;
			return ResultExceptionFactory.error(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
		}
	}
}
