import Container, { Service } from 'typedi';
import { UpdateService } from '../../../../../../shared/services/db/update';
import { ToDoEntity } from '../../../../infrastructures/entity/todos/index.Entity';

// @Service decorator is not working if constructor has the parameters, then set the container.
Container.set<UpdateService<ToDoEntity>>(UpdateService<ToDoEntity>, new UpdateService<ToDoEntity>(ToDoEntity));

@Service()
export class UpdateTodosService extends UpdateService<ToDoEntity> {
	public constructor() {
		super(ToDoEntity);
	}
}
