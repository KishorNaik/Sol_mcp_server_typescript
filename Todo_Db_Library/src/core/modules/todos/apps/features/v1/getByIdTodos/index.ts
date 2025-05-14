import Container, { Service } from 'typedi';
import { ToDoEntity } from '../../../../infrastructures/entity/todos/index.Entity';
import { DeleteService } from '../../../../../../shared/services/db/delete';
import { GetByIdentifierService } from '../../../../../../shared/services/db/getByIdentifer';

// @Service decorator is not working if constructor has the parameters, then set the container.
Container.set<GetByIdentifierService<ToDoEntity>>(
  GetByIdentifierService<ToDoEntity>,
  new GetByIdentifierService<ToDoEntity>(ToDoEntity)
);

@Service()
export class GetByIdentifierTodoService extends GetByIdentifierService<ToDoEntity> {
	public constructor() {
		super(ToDoEntity);
	}
}
