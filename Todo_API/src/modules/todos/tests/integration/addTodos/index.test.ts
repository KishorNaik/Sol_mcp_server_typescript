// Debug Mode:All Test Case Run
//node --trace-deprecation --test --require ts-node/register -r tsconfig-paths/register ./src/modules/todos/tests/integration/addTodos/index.test.ts

// Debug Mode:Specific Test Case Run
//node --trace-deprecation --test --test-name-pattern='test_name' --require ts-node/register -r tsconfig-paths/register ./src/modules/todos/tests/integration/addTodos/index.test.ts

// If Debug not Worked then use
//node --trace-deprecation --test --test-name-pattern='test_name' --require ts-node/register --inspect=4321 -r tsconfig-paths/register ./src/modules/todos/tests/integration/addTodos/index.test.ts
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

describe(`create_todos`, () => {
	beforeEach(async () => {
		await initializeDatabase();
	});

	afterEach(async () => {
		await destroyDatabase();
	});

	// node --trace-deprecation --test --test-name-pattern='should_return_false_aes_body_validation_failed' --require ts-node/register -r tsconfig-paths/register ./src/modules/todos/tests/integration/addTodos/index.test.ts
	it(`should_return_false_aes_body_validation_failed`, async () => {
		const aesRequestDto: AesRequestDto = new AesRequestDto();
		aesRequestDto.body = '';

		const response = await request(app).post('/api/v1/todos').send(aesRequestDto);
		expect(response.status).toBe(400);
	});

	// node --trace-deprecation --test --test-name-pattern='should_return_false_request_body_validation_failed' --require ts-node/register -r tsconfig-paths/register ./src/modules/todos/tests/integration/addTodos/index.test.ts
	it(`should_return_false_request_body_validation_failed`, async () => {
		const requestBody = {
			title: '',
			description: '',
		};

		const aes = new AES(ENCRYPTION_KEY);
		const encryptRequestBody = await aes.encryptAsync(JSON.stringify(requestBody));

		const aesRequestDto: AesRequestDto = new AesRequestDto();
		aesRequestDto.body = encryptRequestBody;

		const response = await request(app).post('/api/v1/todos').send(aesRequestDto);
		expect(response.status).toBe(400);
	});

	// node --trace-deprecation --test --test-name-pattern='should_return_true_if_all_services_worked' --require ts-node/register -r tsconfig-paths/register ./src/modules/todos/tests/integration/addTodos/index.test.ts
	it(`should_return_true_if_all_services_worked`, async () => {
		const requestBody = {
			title: faker.lorem.words(10),
			description: faker.lorem.words(50),
		};

		const aes = new AES(ENCRYPTION_KEY);
		const encryptRequestBody = await aes.encryptAsync(JSON.stringify(requestBody));

		const aesRequestDto: AesRequestDto = new AesRequestDto();
		aesRequestDto.body = encryptRequestBody;

		const response = await request(app).post('/api/v1/todos').send(aesRequestDto);
		console.log(`Response:${JSON.stringify(response.body)}`);

		expect(response.status).toBe(200);
	});
});
