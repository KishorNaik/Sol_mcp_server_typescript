import { GetTodosByIdentifierResponseDto } from '@/modules/todos/apps/contracts/features/v1/getTodosByIdentifier/index.Contract';
import { sealed } from '@/shared/utils/decorators/sealed';
import { ResultError, ResultExceptionFactory } from '@/shared/utils/exceptions/results';
import { IServiceHandlerAsync } from '@/shared/utils/helpers/services';
import { ToDoEntity } from '@kishornaik/todo-db-library';
import { StatusCodes } from 'http-status-codes';
import { Ok, Result } from 'neverthrow';
import { Service } from 'typedi';

export interface IGetTodosByIdentifierMapperResponseService
	extends IServiceHandlerAsync<ToDoEntity, GetTodosByIdentifierResponseDto> {}

@sealed
@Service()
export class GetTodosByIdentifierMapperResponseService
	implements IGetTodosByIdentifierMapperResponseService
{
	public async handleAsync(
		params: ToDoEntity
	): Promise<Result<GetTodosByIdentifierResponseDto, ResultError>> {
		try {
			if (!params)
				return ResultExceptionFactory.error(StatusCodes.BAD_REQUEST, 'Invalid params');

			const todoEntity: ToDoEntity = params;
			const response = new GetTodosByIdentifierResponseDto();
			response.identifier = todoEntity.identifier;
			response.title = todoEntity.title;
			response.description = todoEntity.description;

			return new Ok(response);
		} catch (ex) {
			const error = ex as Error;
			return ResultExceptionFactory.error(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
		}
	}
}
