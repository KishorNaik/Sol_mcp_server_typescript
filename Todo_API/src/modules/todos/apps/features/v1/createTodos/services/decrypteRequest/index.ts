import { Err, Ok, Result } from 'neverthrow';
import { StatusCodes } from 'http-status-codes';
import Container, { Service } from 'typedi';
import { AesDecryptWrapper, IAesDecryptWrapper } from '@/shared/utils/helpers/aes';
import { ResultError, ResultExceptionFactory } from '@/shared/utils/exceptions/results';
import { AesRequestDto } from '@/shared/models/request/aes.RequestDto';
import { IServiceHandlerAsync } from '@/shared/utils/helpers/services';
import { CreateTodosRequestDTO } from '../../../../../contracts/features/v1/createTodos/index.Contract';
import { sealed } from '@/shared/utils/decorators/sealed';

@sealed
@Service()
export class CreateTodosDecryptService extends AesDecryptWrapper<CreateTodosRequestDTO> {
	public constructor() {
		super();
	}
}
