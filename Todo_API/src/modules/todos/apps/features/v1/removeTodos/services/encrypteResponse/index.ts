import { RemoveTodosResponseDto } from '@/modules/todos/apps/contracts/features/v1/removeTodos/index.Contracts';
import { sealed } from '@/shared/utils/decorators/sealed';
import { AesEncryptWrapper } from '@/shared/utils/helpers/aes';
import { Service } from 'typedi';

@sealed
@Service()
export class RemoveTodoEncryptResponseService extends AesEncryptWrapper<RemoveTodosResponseDto> {
	public constructor() {
		super();
	}
}
