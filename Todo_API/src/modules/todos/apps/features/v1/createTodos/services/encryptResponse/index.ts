import { IServiceHandlerAsync } from '@/shared/utils/helpers/services';
import { CreateTodosResponseDTO } from '../../../../../contracts/features/v1/createTodos/index.Contract';
import { AesResponseDto } from '@/shared/models/response/aes.ResponseDto';
import Container, { Service } from 'typedi';
import { sealed } from '@/shared/utils/decorators/sealed';
import { ResultError, ResultExceptionFactory } from '@/shared/utils/exceptions/results';
import { Err, Ok, Result } from 'neverthrow';
import { StatusCodes } from 'http-status-codes';
import { ToDoEntity } from '@kishornaik/todo-db-library';
import { AesEncryptWrapper, IAesEncryptWrapper } from '@/shared/utils/helpers/aes';

@sealed
@Service()
export class CreateTodoEncryptResponseService extends AesEncryptWrapper<CreateTodosResponseDTO> {
	public constructor() {
		super();
	}
}
