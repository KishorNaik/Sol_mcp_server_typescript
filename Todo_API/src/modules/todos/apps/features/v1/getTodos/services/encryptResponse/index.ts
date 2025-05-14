import { GetTodosResponseDto } from '@/modules/todos/apps/contracts/features/v1/getTodos/index.Contract';
import { sealed } from '@/shared/utils/decorators/sealed';
import { AesEncryptWrapper } from '@/shared/utils/helpers/aes';
import { Service } from 'typedi';

@sealed
@Service()
export class GetTodosEncryptResponseService extends AesEncryptWrapper<Array<GetTodosResponseDto>> {
	public constructor() {
		super();
	}
}
