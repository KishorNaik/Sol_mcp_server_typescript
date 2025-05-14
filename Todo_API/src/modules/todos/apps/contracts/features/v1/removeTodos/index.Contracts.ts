import { IsSafeString } from '@/shared/utils/validations/decorators/isSafeString';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

// #region Request DTO
export class RemoveTodosRequestDto {
	@IsNotEmpty()
	@IsString()
	@IsSafeString({ message: 'Name must not contain HTML or JavaScript code' })
	@IsUUID()
	@Type(() => String)
	identifier: string;
}
// #endregion

// #region Response DTO
export class RemoveTodosResponseDto {
	message: string;
}
// #endregion
