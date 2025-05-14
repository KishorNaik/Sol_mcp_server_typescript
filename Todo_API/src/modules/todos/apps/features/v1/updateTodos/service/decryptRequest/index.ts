import { UpdateTodosRequestDTO } from '@/modules/todos/apps/contracts/features/v1/updateTodos/index.Contract';
import { sealed } from '@/shared/utils/decorators/sealed';
import { AesDecryptWrapper } from '@/shared/utils/helpers/aes';
import { Service } from 'typedi';

@sealed
@Service()
export class UpdateTodosDecryptService extends AesDecryptWrapper<UpdateTodosRequestDTO> {
	public constructor() {
		super();
	}
}
