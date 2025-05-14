import { PaginationDataResponseModel } from '../../response/data.Response.js';

export interface IPagination {
	pageNumber: number;
	pageSize: number;
}

export interface IPageListResult<T> {
	items: T[];
	page: PaginationDataResponseModel;
}
