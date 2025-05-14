import {
	ITodoSharedCacheService,
	TodosSharedCacheService,
} from '@/modules/todos/apps/shared/cache';
import { sealed } from '@/shared/utils/decorators/sealed';
import { logger } from '@/shared/utils/helpers/loggers';
import { StatusEnum } from '@kishornaik/todo-db-library';
import { NotificationData, NotificationHandler, notificationHandler } from 'mediatr-ts';
import Container from 'typedi';

// #region Domain Event
export class TodoRemovedDomainEvent extends NotificationData {
	private readonly _identifier: string;
	private readonly _status: StatusEnum;

	public constructor(identifier: string, status: StatusEnum) {
		super();
		this._identifier = identifier;
		this._status = status;
	}
	public get identifier(): string {
		return this._identifier;
	}

	public get status(): StatusEnum {
		return this._status;
	}
}
//#endregion

// #region Domain Event Handler
@sealed
@notificationHandler(TodoRemovedDomainEvent)
export class TodoRemovedDomainEventHandler implements NotificationHandler<TodoRemovedDomainEvent> {
	private readonly _redisCacheService: ITodoSharedCacheService;
	public constructor() {
		this._redisCacheService = Container.get(TodosSharedCacheService);
	}

	public async handle(notification: TodoRemovedDomainEvent): Promise<void> {
		try {
			// Set Cache
			let result = await this._redisCacheService.handleAsync({
				identifier: notification.identifier,
				status: notification.status,
			});
			if (result.isErr()) throw new Error(result.error.message);
		} catch (ex) {
			const error = ex as Error;
			logger.error(`TodoCreateDomainEventHandler Error: ${error.message}`);
			throw ex;
		}
	}
}
//#endregion
