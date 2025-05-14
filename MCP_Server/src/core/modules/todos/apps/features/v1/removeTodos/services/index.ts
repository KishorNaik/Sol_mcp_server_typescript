import { Service } from "typedi";
import { sealed } from "../../../../../../../shared/utils/decorators/sealed/index.js";
import { IServiceHandlerAsync } from "../../../../../../../shared/utils/helpers/services/index.js";
import { Ok, Result } from "neverthrow";
import { ResultError, ResultExceptionFactory } from "../../../../../../../shared/utils/exceptions/results/index.js";
import { StatusCodes } from "http-status-codes";
import { AxiosHelper } from "../../../../../../../shared/utils/helpers/axios/index.js";
import { BASE_URL, ENCRYPTION_KEY } from "../../../../../../../config/env/index.js";
import { AesResponseDto } from "../../../../../../../shared/models/response/aes.ResponseDto.js";
import { DataResponse } from "../../../../../../../shared/models/response/data.Response.js";
import { AES } from "../../../../../../../shared/utils/helpers/aes/index.js";

export interface IRemoveTodosApiServiceParameters {
	identifier: string;
}

export interface IRemoveTodosApiServiceResult{
  message: string;
}

export interface IRemoveTodosApiService extends IServiceHandlerAsync<IRemoveTodosApiServiceParameters,IRemoveTodosApiServiceResult>{}

@sealed
@Service()
export class RemoveTodosApiService implements IRemoveTodosApiService {
  public async handleAsync(params: IRemoveTodosApiServiceParameters): Promise<Result<IRemoveTodosApiServiceResult, ResultError>> {
    try
    {
      //@guard
      if(!params)
      return ResultExceptionFactory.error(StatusCodes.BAD_REQUEST,'Invalid Request');

      // Create an Instance of Axios Helper
      const axiosHelper: AxiosHelper = new AxiosHelper({
        baseURL: String(BASE_URL),
      });

      // Get Identifier
      const {identifier}=params;

      // Set Url
      const url=`/api/v1/todos/${identifier}`;

      // Make Request
      const responseResult=await axiosHelper.deleteAsync<AesResponseDto>(url);
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

      const aes = new AES(String(ENCRYPTION_KEY));
      const decryptResponseBody = await aes.decryptAsync(aesResponseBodyDto.body!);
      if (!decryptResponseBody)
        return ResultExceptionFactory.error(
          StatusCodes.NOT_ACCEPTABLE,
          'Failed to decrypt response body'
        );

      const responseBody: IRemoveTodosApiServiceResult = JSON.parse(decryptResponseBody);
      if (!responseBody)
        return ResultExceptionFactory.error(
          StatusCodes.NOT_ACCEPTABLE,
          'Failed to parse response body'
        );

      return new Ok(responseBody);
    }
    catch(ex)
    {
      const error=ex as Error;
      return ResultExceptionFactory.error(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
    }
  }
}


