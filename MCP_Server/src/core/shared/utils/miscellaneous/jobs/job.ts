import { logger } from '../../helpers/loggers/index.js';

export const JobPromise = (callBack: Function) => {
	Promise.resolve(callBack()).catch((error) => {
		logger.error(`Error in fire and forget job: ${error}`);
	});
};

export const JobFireAndForget = (callBack: () => void) => {
	setImmediate(callBack);
};
