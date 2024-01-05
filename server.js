const app = require("./src");
const dotenv = require("dotenv");

dotenv.config({ silent: true });

const options = {
	port: process.env.MOCKBIN_PORT,
	quiet: process.env.MOCKBIN_QUIET,
	redis: process.env.MOCKBIN_REDIS,
};

app(options, () => {
	console.info("starting server on port: %d", options.port);
});
