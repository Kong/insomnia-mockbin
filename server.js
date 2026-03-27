const app = require("./src");
const dotenv = require("dotenv");

dotenv.config();

const options = {
	port: process.env.MOCKBIN_PORT,
	quiet: process.env.MOCKBIN_QUIET,
	redis: process.env.MOCKBIN_REDIS,
	redisExpiry: process.env.MOCKBIN_REDIS_EXPIRE_SECONDS,
	isCloudMock: process.env.MOCKBIN_IS_CLOUD_MOCK === "true",
	cloudRestrictedHeaders: process.env.MOCKBIN_CLOUD_RESTRICTED_HEADERS,
};

app(options, () => {
	console.info("starting server");
	console.table(options);
	if (!options.port || !options.redis) {
		console.warn(`
		------------------------
		Missing env file or env vars:
		run this to fix it.
		cp .env.sample .env
		OR add MOCKBIN_PORT and MOCKBIN_REDIS to your env.
		------------------------
		`);
	}
});
