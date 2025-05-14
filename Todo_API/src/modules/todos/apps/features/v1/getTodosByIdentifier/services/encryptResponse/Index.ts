import { GetTodosByIdentifierResponseDto } from '@/modules/todos/apps/contracts/features/v1/getTodosByIdentifier/index.Contract';
import { sealed } from '@/shared/utils/decorators/sealed';
import { AesEncryptWrapper } from '@/shared/utils/helpers/aes';
import { Service } from 'typedi';

@sealed
@Service()
export class GetTodosByIdentifierEncryptResponseService extends AesEncryptWrapper<GetTodosByIdentifierResponseDto> {
	public constructor() {
		super();
	}
}
