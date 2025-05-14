import Container, { Service } from 'typedi';
import { ToDoEntity } from '../../../../infrastructures/entity/todos/index.Entity';
import { AddService } from '../../../../../../shared/services/db/add';
//import { BaseEntity } from '../../../../../../shared/entity/base';
//import { ToDoEntity } from '../../../../infrastructures/entity/todos/index.Entity';

// @Service decorator is not working if constructor has the parameters, then set the container.
Container.set<AddService<ToDoEntity>>(AddService<ToDoEntity>, new AddService<ToDoEntity>(ToDoEntity));

@Service()
export class AddTodosService extends AddService<ToDoEntity> {
	public constructor() {
		super(ToDoEntity);
		//logger.info('AddTodosService');
	}
}
