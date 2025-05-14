import { Err, Ok, Result } from 'neverthrow';
import { StatusCodes } from 'http-status-codes';
import Container, { Service } from 'typedi';
import { AesDecryptWrapper, IAesDecryptWrapper } from '@/shared/utils/helpers/aes';
import { ResultError, ResultExceptionFactory } from '@/shared/utils/exceptions/results';
import { IServiceHandlerVoidAsync } from '@/shared/utils/helpers/services';
import { CreateTodosRequestDTO } from '../../../../../contracts/features/v1/createTodos/index.Contract';
import { DtoValidation, IDtoValidation } from '@/shared/utils/validations/dto';
import { sealed } from '@/shared/utils/decorators/sealed';
@sealed
@Service()
export class CreateTodosValidationService extends DtoValidation<CreateTodosRequestDTO> {
	public constructor() {
		super();
	}
}
