import test, { afterEach, beforeEach, describe } from 'node:test';
import expect from 'expect';
import {
	destroyDatabase,
	getQueryRunner,
	initializeDatabase,
	QueryRunner,
} from '../../../../config/dbSource';
import { ToDoEntity } from '../../infrastructures/entity/todos/index.Entity';
import { faker } from '@faker-js/faker';
import { StatusEnum } from '../../../../shared/models/enums/status.enum';
import { v4 as uuidv4 } from 'uuid';
import { GetTodoService } from '../../apps/features/v1/getTodos';
import { QueryBuilder, SelectQueryBuilder } from 'typeorm';
import {
	getPropertyNameByObject,
	getPropertyNameByType,
} from '../../../../shared/utils/miscellaneous/getPropertyName';
import { Order } from '../../../../shared/models/types/order';
import Container from 'typedi';
import { GetService } from '../../../../shared/services/db/get';

// Debug Mode:All Test Case Run
//node --trace-deprecation --test --require ts-node/register -r tsconfig-paths/register ./src/core/modules/todos/tests/getTodos/index.test.ts

// Debug Mode:Specific Test Case Run
//node --trace-deprecation --test --test-name-pattern='test_name' --require ts-node/register -r tsconfig-paths/register ./src/core/modules/todos/tests/getTodos/index.test.ts

// If Debug not Worked then use
//node --trace-deprecation --test --test-name-pattern='test_name' --require ts-node/register --inspect=4321 -r tsconfig-paths/register ./src/core/modules/todos/tests/getTodos/index.test.ts

describe(`get_todos`, () => {
	let queryRunner: QueryRunner;
	beforeEach(async () => {
		await initializeDatabase();
		queryRunner = getQueryRunner();
	});

	afterEach(async () => {
		await queryRunner.release();
		await destroyDatabase();
	});

	//node --trace-deprecation --test --test-name-pattern='should_return_false_when_status_is_not_provided' --require ts-node/register -r tsconfig-paths/register ./src/core/modules/todos/tests/getTodos/index.test.ts
	test(`should_return_false_when_status_is_not_provided`, async () => {
		const getService = Container.set<GetService<ToDoEntity>>(
			GetService<ToDoEntity>,
			new GetService<ToDoEntity>(ToDoEntity)
		);
		const getTodoService = Container.get(GetTodoService);
		await queryRunner.startTransaction();

		const result = await getTodoService.handleAsync({
			pagination: {
				pageNumber: 1,
				pageSize: 1,
			},
			queryRunner: queryRunner,
		});
		if (result.isErr()) {
			await queryRunner.rollbackTransaction();
			expect(result.isErr()).toBe(true);
			return;
		}

		await queryRunner.commitTransaction();
		expect(true).toBe(true);
	});

	//node --trace-deprecation --test --test-name-pattern='should_return_true_when_data_found' --require ts-node/register -r tsconfig-paths/register ./src/core/modules/todos/tests/getTodos/index.test.ts
	test(`should_return_true_when_data_found`, async () => {
		const getService = Container.set<GetService<ToDoEntity>>(
			GetService<ToDoEntity>,
			new GetService<ToDoEntity>(ToDoEntity)
		);
		const getTodoService = Container.get(GetTodoService);
		await queryRunner.startTransaction();

		const result = await getTodoService.handleAsync({
			pagination: {
				pageNumber: 1,
				pageSize: 1,
			},
			queryRunner: queryRunner,
		});
		if (result.isErr()) {
			await queryRunner.rollbackTransaction();
			expect(result.isErr()).toBe(true);
			return;
		}

		const res = await result.value.items;

		console.table(res);

		await queryRunner.commitTransaction();
		expect(true).toBe(true);
		expect(res.length).toStrictEqual(2);
	});

	//node --trace-deprecation --test --test-name-pattern='should_return_true_when_data_found_with_pagination' --require ts-node/register -r tsconfig-paths/register ./src/core/modules/todos/tests/getTodos/index.test.ts
	test(`should_return_true_when_data_found_with_pagination`, async () => {
		const getService = Container.set<GetService<ToDoEntity>>(
			GetService<ToDoEntity>,
			new GetService<ToDoEntity>(ToDoEntity)
		);
		const getTodoService = Container.get(GetTodoService);
		await queryRunner.startTransaction();

		const result = await getTodoService.handleAsync({
			pagination: {
				pageNumber: 1,
				pageSize: 1,
			},
			queryRunner: queryRunner,
		});
		if (result.isErr()) {
			await queryRunner.rollbackTransaction();
			expect(result.isErr()).toBe(true);
			return;
		}

		const res = await result.value.items;

		console.table(res);

		await queryRunner.commitTransaction();
		expect(true).toBe(true);
		expect(res.length).toStrictEqual(1);
	});

	//node --trace-deprecation --test --test-name-pattern='should_return_true_when_data_found_with_orderby' --require ts-node/register -r tsconfig-paths/register ./src/core/modules/todos/tests/getTodos/index.test.ts
	test(`should_return_true_when_data_found_with_orderby`, async () => {
		const getService = Container.set<GetService<ToDoEntity>>(
			GetService<ToDoEntity>,
			new GetService<ToDoEntity>(ToDoEntity)
		);
		const getTodoService = Container.get(GetTodoService);
		await queryRunner.startTransaction();

		const result = await getTodoService.handleAsync({
			pagination: {
				pageNumber: 1,
				pageSize: 1,
			},
			sort: {
				by: [
					getPropertyNameByType<ToDoEntity>(`created_date`),
					getPropertyNameByType<ToDoEntity>(`modified_date`),
				],
				direction: Order.ASC,
			},
			queryRunner: queryRunner,
		});
		if (result.isErr()) {
			await queryRunner.rollbackTransaction();
			expect(result.isErr()).toBe(true);
			return;
		}

		const res = await result.value.items;

		console.table(res);

		await queryRunner.commitTransaction();
		expect(true).toBe(true);
		expect(res.length).toStrictEqual(2);
	});

	//node --trace-deprecation --test --test-name-pattern='should_return_true_when_data_found_with_another_filter' --require ts-node/register -r tsconfig-paths/register ./src/core/modules/todos/tests/getTodos/index.test.ts
	test(`should_return_true_when_data_found_with_another_filter`, async () => {
		const getService = Container.set<GetService<ToDoEntity>>(
			GetService<ToDoEntity>,
			new GetService<ToDoEntity>(ToDoEntity)
		);
		const getTodoService = Container.get(GetTodoService);

		await queryRunner.startTransaction();

		const result = await getTodoService.handleAsync({
			pagination: {
				pageNumber: 1,
				pageSize: 3,
			},
			search: {
				title: 'shopping',
			},
			sort: {
				by: [
					getPropertyNameByType<ToDoEntity>(`created_date`),
					getPropertyNameByType<ToDoEntity>(`modified_date`),
				],
				direction: Order.ASC,
			},
			queryRunner: queryRunner,
		});
		if (result.isErr()) {
			await queryRunner.rollbackTransaction();
			expect(result.isErr()).toBe(true);
			return;
		}

		// Another Filter
		const res = result.value.items;
		console.table(res);
		console.log(`Page:${JSON.stringify(result.value.page)}`);

		await queryRunner.commitTransaction();
		expect(true).toBe(true);
		//expect(res.length).toStrictEqual(2);
	});

	//node --trace-deprecation --test --test-name-pattern='should_return_true_when_data_found_without_query_runner' --require ts-node/register -r tsconfig-paths/register ./src/core/modules/todos/tests/getTodos/index.test.ts
	test(`should_return_true_when_data_found_without_query_runner`, async () => {
		const getService = Container.set<GetService<ToDoEntity>>(
			GetService<ToDoEntity>,
			new GetService<ToDoEntity>(ToDoEntity)
		);
		const getTodoService = Container.get(GetTodoService);

		//await queryRunner.startTransaction();

		const result = await getTodoService.handleAsync({
			pagination: {
				pageNumber: 1,
				pageSize: 3,
			},
			search: {
				title: 'shopping',
			},
			sort: {
				by: [
					getPropertyNameByType<ToDoEntity>(`created_date`),
					getPropertyNameByType<ToDoEntity>(`modified_date`),
				],
				direction: Order.ASC,
			},
		});
		if (result.isErr()) {
			//await queryRunner.rollbackTransaction();
			expect(result.isErr()).toBe(true);
			return;
		}

		// Another Filter
		const res = result.value.items;
		console.table(res);
		console.log(`Page:${JSON.stringify(result.value.page)}`);

		//await queryRunner.commitTransaction();
		expect(true).toBe(true);
		//expect(res.length).toStrictEqual(2);
	});
});
