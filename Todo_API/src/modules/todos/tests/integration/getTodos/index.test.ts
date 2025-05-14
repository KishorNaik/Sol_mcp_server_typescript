// Debug Mode:All Test Case Run
//node --trace-deprecation --test --require ts-node/register -r tsconfig-paths/register ./src/modules/todos/tests/integration/getTodos/index.test.ts

// Debug Mode:Specific Test Case Run
//node --trace-deprecation --test --test-name-pattern='test_name' --require ts-node/register -r tsconfig-paths/register ./src/modules/todos/tests/integration/getTodos/index.test.ts

// If Debug not Worked then use
//node --trace-deprecation --test --test-name-pattern='test_name' --require ts-node/register --inspect=4321 -r tsconfig-paths/register ./src/modules/todos/tests/integration/getTodos/index.test.ts

import 'reflect-metadata';
import { afterEach, beforeEach, describe, it } from 'node:test';
import expect from 'expect';
import request from 'supertest';
import { App } from '@/app';
import { ValidateEnv } from '@/shared/utils/validations/env';
import { modulesFederation } from '@/moduleFederation';
import { destroyDatabase, initializeDatabase } from '@kishornaik/todo-db-library';

process.env.NODE_ENV = 'development';
process.env.ENCRYPTION_KEY = 'RWw5ejc0Wzjq0i0T2ZTZhcYu44fQI5M6';
ValidateEnv();

const appInstance = new App([...modulesFederation]);
const app = appInstance.getServer();

describe(`get_todos`, () => {
	beforeEach(async () => {
		await initializeDatabase();
	});

	afterEach(async () => {
		await destroyDatabase();
	});

	//node --trace-deprecation --test --test-name-pattern='should_return_false_if_query_param_not_passed' --require ts-node/register -r tsconfig-paths/register ./src/modules/todos/tests/integration/getTodos/index.test.ts
	it(`should_return_false_if_query_param_not_passed`, async () => {
		// Default Pagination Query Param added by the endpoint
		const response = await request(app).get('/api/v1/todos');
		expect(response.status).toBe(404);
	});

	//node --trace-deprecation --test --test-name-pattern='should_return_false_if_pagination_query_has_negative_value' --require ts-node/register -r tsconfig-paths/register ./src/modules/todos/tests/integration/getTodos/index.test.ts
	it(`should_return_false_if_pagination_query_has_negative_value`, async () => {
		// Default Pagination Query Param added by the endpoint
		const response = await request(app).get('/api/v1/todos?pageSize=-1&pageNumber=-1');
		expect(response.status).toBe(400);
	});

	//node --trace-deprecation --test --test-name-pattern='should_return_false_if_title_query_do_not_pass' --require ts-node/register -r tsconfig-paths/register ./src/modules/todos/tests/integration/getTodos/index.test.ts
	it(`should_return_false_if_title_query_do_not_pass`, async () => {
		// Default Pagination Query Param added by the endpoint
		const response = await request(app).get('/api/v1/todos?pageSize=15&pageNumber=1&title');
		expect(response.status).toBe(400);
	});

	//node --trace-deprecation --test --test-name-pattern='should_return_true_if_all_services_worked' --require ts-node/register -r tsconfig-paths/register ./src/modules/todos/tests/integration/getTodos/index.test.ts
	it(`should_return_true_if_all_services_worked`, async () => {
		// Default Pagination Query Param added by the endpoint
		const response = await request(app).get(
			'/api/v1/todos?pageSize=15&pageNumber=1&title=shopping'
		);
		console.log(`response.body: `, JSON.stringify(response.body, null, 2));
		expect(response.status).toBe(200);
	});
});
