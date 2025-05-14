import { UpdateTodosResponseDTO } from '@/modules/todos/apps/contracts/features/v1/updateTodos/index.Contract';
import { sealed } from '@/shared/utils/decorators/sealed';
import { AesEncryptWrapper } from '@/shared/utils/helpers/aes';
import { Service } from 'typedi';

@sealed
@Service()
export class UpdateTodosEncryptResponseService extends AesEncryptWrapper<UpdateTodosResponseDTO> {
	public constructor() {
		super();
	}
}
