import Container, { Service } from 'typedi';
import { ToDoEntity } from '../../../../infrastructures/entity/todos/index.Entity';
import { DeleteService } from '../../../../../../shared/services/db/delete';

// @Service decorator is not working if constructor has the parameters, then set the container.
Container.set<DeleteService<ToDoEntity>>(DeleteService<ToDoEntity>, new DeleteService<ToDoEntity>(ToDoEntity));


@Service()
export class RemoveTodosService extends DeleteService<ToDoEntity> {
	public constructor() {
		super(ToDoEntity);
	}
}
