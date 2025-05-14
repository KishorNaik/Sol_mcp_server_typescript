import { test } from 'node:test';
import assert from 'node:assert';
import { Main } from '../core/demo';

test.only('On-Success', async () => {
	let mainObj = new Main();

	let result = await mainObj.addCall(1, 1);

	assert.strictEqual(result, 2);
});
