// Debug Mode:All Test Case Run
//node --trace-deprecation --test --require ts-node/register -r tsconfig-paths/register ./src/modules/todos/tests/integration/getTodosByIdentifier/index.test.ts

// Debug Mode:Specific Test Case Run
//node --trace-deprecation --test --test-name-pattern='test_name' --require ts-node/register -r tsconfig-paths/register ./src/modules/todos/tests/integration/getTodosByIdentifier/index.test.ts

// If Debug not Worked then use
//node --trace-deprecation --test --test-name-pattern='test_name' --require ts-node/register --inspect=4321 -r tsconfig-paths/register ./src/modules/todos/tests/integration/getTodosByIdentifier/index.test.ts

import 'reflect-metadata';
import { afterEach, beforeEach, describe, it } from 'node:test';
import expect from 'expect';
import request from 'supertest';
import { App } from '@/app';
import { ValidateEnv } from '@/shared/utils/validations/env';
import { modulesFederation } from '@/moduleFederation';
import { destroyDatabase, initializeDatabase } from '@kishornaik/todo-db-library';
import { ENCRYPTION_KEY } from '@/config';
import { faker } from '@faker-js/faker';
import { AesRequestDto } from '@/shared/models/request/aes.RequestDto';
import { AES } from '@/shared/utils/helpers/aes';

process.env.NODE_ENV = 'development';
process.env.ENCRYPTION_KEY = 'RWw5ejc0Wzjq0i0T2ZTZhcYu44fQI5M6';
ValidateEnv();

const appInstance = new App([...modulesFederation]);
const app = appInstance.getServer();

describe(`get_todos_by_identifier`, () => {
	beforeEach(async () => {
		await initializeDatabase();
	});

	afterEach(async () => {
		await destroyDatabase();
	});

	//node --trace-deprecation --test --test-name-pattern='should_return_false_if_identifier_not_passed' --require ts-node/register -r tsconfig-paths/register ./src/modules/todos/tests/integration/getTodosByIdentifier/index.test.ts
	it(`should_return_false_if_identifier_not_passed`, async () => {
		const response = await request(app).get('/api/v1/todos');
		expect(response.status).toBe(404);
	});

	//node --trace-deprecation --test --test-name-pattern='should_return_false_if_we_do_not_pass_guid_identifier' --require ts-node/register -r tsconfig-paths/register ./src/modules/todos/tests/integration/getTodosByIdentifier/index.test.ts
	it(`should_return_false_if_we_do_not_pass_guid_identifier`, async () => {
		const response = await request(app).get('/api/v1/todos/kishor');
		console.log(`Response:${JSON.stringify(response.body)}`);
		expect(response.status).toBe(400);
	});

	//node --trace-deprecation --test --test-name-pattern='should_return_false_if_identifier_pass_wrong' --require ts-node/register -r tsconfig-paths/register ./src/modules/todos/tests/integration/getTodosByIdentifier/index.test.ts
	it(`should_return_false_if_identifier_pass_wrong`, async () => {
		const response = await request(app).get(
			'/api/v1/todos/2be18d46-aea2-9009-1538-03d82996737b'
		);
		console.log(`Response:${JSON.stringify(response.body)}`);
		expect(response.status).toBe(404);
	});

	//node --trace-deprecation --test --test-name-pattern='should_return_true_if_all_services_worked' --require ts-node/register -r tsconfig-paths/register ./src/modules/todos/tests/integration/getTodosByIdentifier/index.test.ts
	it(`should_return_true_if_all_services_worked`, async () => {
		const response = await request(app).get(
			'/api/v1/todos/ff70bbfd-82d6-0135-b30c-cd45330303d4'
		);
		console.log(`Response:${JSON.stringify(response.body)}`);
		expect(response.status).toBe(200);
	});
});
