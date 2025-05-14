import { GetTodosByIdentifierRequestDto } from '@/modules/todos/apps/contracts/features/v1/getTodosByIdentifier/index.Contract';
import { sealed } from '@/shared/utils/decorators/sealed';
import { DtoValidation } from '@/shared/utils/validations/dto';
import { Service } from 'typedi';

@sealed
@Service()
export class GetTodosByIdentifierValidationService extends DtoValidation<GetTodosByIdentifierRequestDto> {
	public constructor() {
		super();
	}
}
