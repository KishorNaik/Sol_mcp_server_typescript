import Container, { Service } from 'typedi';
import { sealed } from '../../../../../../shared/utils/decorators/sealed';
import { GetByVersionIdentifierService } from '../../../../../../shared/services/db/getVersion';
import { ToDoEntity } from '../../../../infrastructures/entity/todos/index.Entity';

// @Service decorator is not working if constructor has the parameters, then set the container.
Container.set<GetByVersionIdentifierService<ToDoEntity>>(GetByVersionIdentifierService<ToDoEntity>, new GetByVersionIdentifierService<ToDoEntity>(ToDoEntity));

@sealed
@Service()
export class GetTodosRowVersionService extends GetByVersionIdentifierService<ToDoEntity> {
	public constructor() {
		super(ToDoEntity);
	}
}
