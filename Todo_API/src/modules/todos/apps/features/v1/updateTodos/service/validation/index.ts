import { UpdateTodosRequestDTO } from '@/modules/todos/apps/contracts/features/v1/updateTodos/index.Contract';
import { sealed } from '@/shared/utils/decorators/sealed';
import { DtoValidation } from '@/shared/utils/validations/dto';
import { Service } from 'typedi';

@sealed
@Service()
export class UpdateTodosValidationService extends DtoValidation<UpdateTodosRequestDTO> {
	public constructor() {
		super();
	}
}
