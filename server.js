const app = require("./src");
const dotenv = require("dotenv");
const pkg = require("./package");

dotenv.config({ silent: true });

const options = {
	port: process.env.MOCKBIN_PORT || pkg.config.port,
	quiet: process.env.MOCKBIN_QUIET || pkg.config.quiet,
	redis: process.env.MOCKBIN_REDIS || pkg.config.redis,
};

app(options, () => {
	console.info("starting server on port: %d", options.port);
});
