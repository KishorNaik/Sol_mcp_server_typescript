import * as dotenv from 'dotenv';
dotenv.config();

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const IS_DEV = NODE_ENV === 'development';
export const IS_TEST = NODE_ENV === 'test';
export const IS_PROD = NODE_ENV === 'production';

export const {
	SECRET_KEY,
	REFRESH_SECRET_KEY,
	LOG_FORMAT,
	LOG_DIR,
	ORIGIN,
	DB_HOST,
	DB_PORT,
	DB_USERNAME,
	DB_PASSWORD,
	DB_DATABASE,
	REDIS_HOST,
	REDIS_PORT,
	REDIS_PASSWORD,
	REDIS_DB,
	REDIS_USERNAME,
	RABBITMQ_URL,

	MCP_SERVER_NAME,
	BASE_URL,
	ENCRYPTION_KEY,
} = process.env;
