import { App } from '@/app';
import { ValidateEnv } from '@/shared/utils/validations/env';
import { runNodeCluster } from './shared/utils/miscellaneous/clusters';
import { modulesFederation } from './moduleFederation';

ValidateEnv();

const env = process.env.NODE_ENV || 'development';
if (env === 'development') {
	const app = new App([...modulesFederation]);
	app.listen();
} else {
	runNodeCluster(() => {
		const app = new App([...modulesFederation]);
		app.listen();
	});
}
