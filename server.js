const app = require("./src");
const dotenv = require("dotenv");

const result = dotenv.config({ silent: false });
if (result.error) {
	console.warn(`
	------------------------
	Missing env file:
	run this to fix it.
	cp .env.sample .env
	------------------------
	`);
	throw result.error;
}

const options = {
	port: process.env.MOCKBIN_PORT,
	quiet: process.env.MOCKBIN_QUIET,
	redis: process.env.MOCKBIN_REDIS,
};

app(options, () => {
	console.info("starting server on port: %d", options.port);
});
