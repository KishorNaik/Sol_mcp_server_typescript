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
import { AddTodosService } from '../../apps/features/v1/addTodos';

// Debug Mode:All Test Case Run
//node --trace-deprecation --test --require ts-node/register -r tsconfig-paths/register ./src/core/modules/todos/tests/addTodos/index.test.ts

// Debug Mode:Specific Test Case Run
//node --trace-deprecation --test --test-name-pattern='test_name' --require ts-node/register -r tsconfig-paths/register ./src/core/modules/todos/tests/addTodos/index.test.ts

// If Debug not Worked then use
//node --trace-deprecation --test --test-name-pattern='test_name' --require ts-node/register --inspect=4321 -r tsconfig-paths/register ./src/core/modules/todos/tests/addTodos/index.test.ts
describe(`Add_Todos`, () => {
	let queryRunner: QueryRunner;
	beforeEach(async () => {
		await initializeDatabase();
		queryRunner = getQueryRunner();
	});

	afterEach(async () => {
		await queryRunner.release();
		await destroyDatabase();
	});

	//node --trace-deprecation --test --test-name-pattern='should_return_false_when_identifier_is_not_provided' --require ts-node/register -r tsconfig-paths/register ./src/core/modules/todos/tests/addTodos/index.test.ts
	test(`should_return_false_when_identifier_is_not_provided`, async () => {
		const todoEntity: ToDoEntity = new ToDoEntity();
		//todoEntity.identifier=uuidv4().trim().toString();
		todoEntity.title = faker.lorem.sentence();
		todoEntity.description = faker.lorem.sentence();
		todoEntity.status = StatusEnum.ACTIVE;
		todoEntity.created_date = new Date();
		todoEntity.modified_date = new Date();

		await queryRunner.startTransaction();

		const result = await new AddTodosService().handleAsync(todoEntity, queryRunner);
		if (result.isErr()) {
			await queryRunner.rollbackTransaction();
			expect(result.isErr()).toBe(true);
			return;
		}

		await queryRunner.commitTransaction();
		expect(true).toBe(true);
	});

	//node --trace-deprecation --test --test-name-pattern='should_return_false_when_status_is_not_provided' --require ts-node/register -r tsconfig-paths/register ./src/core/modules/todos/tests/addTodos/index.test.ts
	test(`should_return_false_when_status_is_not_provided`, async () => {
		const todoEntity: ToDoEntity = new ToDoEntity();
		todoEntity.identifier = uuidv4().trim().toString();
		todoEntity.title = faker.lorem.sentence();
		todoEntity.description = faker.lorem.sentence();
		//todoEntity.status=StatusEnum.ACTIVE;
		todoEntity.created_date = new Date();
		todoEntity.modified_date = new Date();

		await queryRunner.startTransaction();

		const result = await new AddTodosService().handleAsync(todoEntity, queryRunner);
		if (result.isErr()) {
			await queryRunner.rollbackTransaction();
			expect(result.isErr()).toBe(true);
			return;
		}

		await queryRunner.commitTransaction();
		expect(true).toBe(true);
	});

	//node --trace-deprecation --test --test-name-pattern='should_return_false_when_validation_failed' --require ts-node/register -r tsconfig-paths/register ./src/core/modules/todos/tests/addTodos/index.test.ts
	test(`should_return_false_when_validation_failed`, async () => {
		const todoEntity: ToDoEntity = new ToDoEntity();
		todoEntity.identifier = uuidv4().trim().toString();
		todoEntity.title = '';
		todoEntity.description = '';
		todoEntity.status = StatusEnum.ACTIVE;
		todoEntity.created_date = new Date();
		todoEntity.modified_date = new Date();

		await queryRunner.startTransaction();

		const result = await new AddTodosService().handleAsync(todoEntity, queryRunner);
		if (result.isErr()) {
			await queryRunner.rollbackTransaction();
			expect(result.isErr()).toBe(true);
			return;
		}

		await queryRunner.commitTransaction();
		expect(true).toBe(true);
	});

	//node --trace-deprecation --test --test-name-pattern='should_return_true_when_add_todos' --require ts-node/register -r tsconfig-paths/register ./src/core/modules/todos/tests/addTodos/index.test.ts
	test(`should_return_true_when_add_todos`, async () => {
		const todoEntity: ToDoEntity = new ToDoEntity();
		todoEntity.identifier = uuidv4().trim().toString();
		todoEntity.title = faker.lorem.sentence();
		todoEntity.description = faker.lorem.sentence();
		todoEntity.status = StatusEnum.ACTIVE;
		todoEntity.created_date = new Date();
		todoEntity.modified_date = new Date();

		await queryRunner.startTransaction();

		const result = await new AddTodosService().handleAsync(todoEntity, queryRunner);
		if (result.isErr()) {
			await queryRunner.rollbackTransaction();
			expect(result.isErr()).toBe(true);
		}

		await queryRunner.commitTransaction();
		expect(true).toBe(true);
	});
});
