import { IsSafeString } from '@/shared/utils/validations/decorators/isSafeString';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

//#region Request Dto
export class UpdateTodosRequestDTO {
	@IsNotEmpty()
	@IsString()
	@IsSafeString({ message: 'Name must not contain HTML or JavaScript code' })
	@Type(() => String)
	identifier: string;

	@IsNotEmpty()
	@IsString()
	@IsSafeString({ message: 'Name must not contain HTML or JavaScript code' })
	@Type(() => String)
	title: string;

	@IsNotEmpty()
	@IsString()
	@IsSafeString({ message: 'Name must not contain HTML or JavaScript code' })
	@Type(() => String)
	description: string;
}
//#endregion

// #region Response Dto
export class UpdateTodosResponseDTO {
	message: string;
}
//#endregion
