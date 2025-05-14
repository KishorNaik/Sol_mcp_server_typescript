import { RemoveTodosRequestDto } from '@/modules/todos/apps/contracts/features/v1/removeTodos/index.Contracts';
import { sealed } from '@/shared/utils/decorators/sealed';
import { IServiceHandlerVoidAsync } from '@/shared/utils/helpers/services';
import { DtoValidation } from '@/shared/utils/validations/dto';
import { Service } from 'typedi';

@sealed
@Service()
export class RemoveTodosValidationService extends DtoValidation<RemoveTodosRequestDto> {}
