'use strict';
import { RemoveTodosRequestDto } from '@/modules/todos/apps/contracts/features/v1/removeTodos/index.Contracts';
import { sealed } from '@/shared/utils/decorators/sealed';
import { ResultError, ResultExceptionFactory } from '@/shared/utils/exceptions/results';
import { IServiceHandlerAsync } from '@/shared/utils/helpers/services';
import {
	QueryRunner,
	RemoveTodosService,
	StatusEnum,
	ToDoEntity,
} from '@kishornaik/todo-db-library';
import { StatusCodes } from 'http-status-codes';
import { Ok, Result } from 'neverthrow';
import Container, { Service } from 'typedi';

Container.set(RemoveTodosService, new RemoveTodosService());

@sealed
@Service()
export class RemoveTodoDbService extends RemoveTodosService {
	public constructor() {
		super();
	}
}
