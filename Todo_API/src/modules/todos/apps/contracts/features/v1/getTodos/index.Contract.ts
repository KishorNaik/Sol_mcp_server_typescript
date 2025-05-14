import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaginationQueryStringParametersModel } from '../../../../../../../shared/models/request/paginationQueryString.request';
import { Type } from 'class-transformer';
import { IsSafeString } from '../../../../../../../shared/utils/validations/decorators/isSafeString';

//#region request
export class GetTodosRequestDto extends PaginationQueryStringParametersModel {
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@IsSafeString()
	@Type(() => String)
	public title?: string;
}
//#endregion

// #region response
export class GetTodosResponseDto {
	public identifier: string;
	public title: string;
	public description: string;
	public isCompleted: boolean;
}
