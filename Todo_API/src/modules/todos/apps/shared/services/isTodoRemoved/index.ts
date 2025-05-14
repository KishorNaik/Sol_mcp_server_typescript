import { sealed } from '@/shared/utils/decorators/sealed';
import { ResultError, ResultExceptionFactory } from '@/shared/utils/exceptions/results';
import { IServiceHandlerAsync } from '@/shared/utils/helpers/services';
import { Ok, Result } from 'neverthrow';
import Container, { Service } from 'typedi';
import {
	GetTodosByIdentifierSharedService,
	IGetTodosByIdentifierSharedService,
} from '../getTodosByIdentifier';
import { StatusCodes } from 'http-status-codes';

export interface IIsTodoRemovedSharedServiceParameters {
	identifier: string;
}

export interface IIsTodoRemovedSharedService
	extends IServiceHandlerAsync<IIsTodoRemovedSharedServiceParameters, boolean> {}

@sealed
@Service()
export class IsTodoRemovedSharedService implements IIsTodoRemovedSharedService {
	private readonly _getTodosByIdentifierSharedService: IGetTodosByIdentifierSharedService;

	public constructor() {
		this._getTodosByIdentifierSharedService = Container.get(GetTodosByIdentifierSharedService);
	}

	public async handleAsync(
		params: IIsTodoRemovedSharedServiceParameters
	): Promise<Result<boolean, ResultError>> {
		try {
			if (!params)
				return ResultExceptionFactory.error(StatusCodes.BAD_REQUEST, 'Invalid Request');

			if (!params.identifier)
				return ResultExceptionFactory.error(StatusCodes.BAD_REQUEST, 'Invalid Request');

			// Get By Identifier Shared Service
			const getTodosByIdentifierSharedServiceResult =
				await this._getTodosByIdentifierSharedService.handleAsync({
					identifier: params.identifier,
				});
			if (getTodosByIdentifierSharedServiceResult.isErr())
				return ResultExceptionFactory.error(
					getTodosByIdentifierSharedServiceResult.error.status,
					getTodosByIdentifierSharedServiceResult.error.message,
					{
						status: false,
					}
				);

			return new Ok(true);
		} catch (ex) {
			const error = ex as Error;
			return ResultExceptionFactory.error(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
		}
	}
}
