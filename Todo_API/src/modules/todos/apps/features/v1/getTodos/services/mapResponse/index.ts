import { GetTodosResponseDto } from '@/modules/todos/apps/contracts/features/v1/getTodos/index.Contract';
import { sealed } from '@/shared/utils/decorators/sealed';
import { ResultError, ResultExceptionFactory } from '@/shared/utils/exceptions/results';
import { IServiceHandlerAsync } from '@/shared/utils/helpers/services';
import { StatusEnum, ToDoEntity } from '@kishornaik/todo-db-library';
import { StatusCodes } from 'http-status-codes';
import Enumerable from 'linq';
import { Ok, Result } from 'neverthrow';
import { Service } from 'typedi';

export interface IGetTodosMapResponseServiceParameters {
	todos: Array<ToDoEntity>;
}

export interface IGetTodosMapResponseService
	extends IServiceHandlerAsync<
		IGetTodosMapResponseServiceParameters,
		Array<GetTodosResponseDto>
	> {}

@sealed
@Service()
export class GetTodosMapResponseService implements IGetTodosMapResponseService {
	public async handleAsync(
		params: IGetTodosMapResponseServiceParameters
	): Promise<Result<GetTodosResponseDto[], ResultError>> {
		try {
			if (!params)
				return ResultExceptionFactory.error(StatusCodes.BAD_REQUEST, 'Invalid Request');

			if (!params.todos)
				return ResultExceptionFactory.error(StatusCodes.BAD_REQUEST, 'Invalid Request');

			if (params.todos.length === 0)
				return ResultExceptionFactory.error(StatusCodes.BAD_REQUEST, 'Invalid Request');

			const todos: Array<GetTodosResponseDto> = Enumerable.from(params.todos)
				.select((x) => {
					const getTodosResponseDto: GetTodosResponseDto = new GetTodosResponseDto();
					getTodosResponseDto.identifier = x.identifier;
					getTodosResponseDto.title = x.title;
					getTodosResponseDto.description = x.description;
					getTodosResponseDto.isCompleted = x.status === StatusEnum.ACTIVE ? true : false;
					return getTodosResponseDto;
				})
				.toArray();

			if (todos.length === 0)
				return ResultExceptionFactory.error(StatusCodes.NOT_FOUND, 'todos  not found');

			return new Ok(todos);
		} catch (ex) {
			const error = ex as Error;
			return ResultExceptionFactory.error(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
		}
	}
}
