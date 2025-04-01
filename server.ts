const app = require("./src");
const dotenv = require("dotenv");

dotenv.config();

const options = {
	port: process.env.MOCKBIN_PORT,
	quiet: process.env.MOCKBIN_QUIET,
	redis: process.env.MOCKBIN_REDIS,
	redisExpiry: process.env.MOCKBIN_REDIS_EXPIRE_SECONDS,
};

app(options, () => {
	console.info(
		"starting server",
		options.port,
		options.redis,
		options.redisExpiry,
	);
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
