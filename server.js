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
	nodeEnv: process.env.NODE_ENV,
};

// Node runs as PID 1 in the container; the kernel only delivers signals to
// PID 1 if a handler is registered. Drain in-flight requests on shutdown
// instead of waiting for Docker's 10s SIGKILL. Handlers are registered before
// the server starts listening so they are in place the moment it accepts
// connections (and `server` is assigned synchronously by app() below before
// any signal can be delivered).
// biome-ignore lint/style/useConst: must be `let` — assigned after the handlers below, but the shutdown closure captures it beforehand.
let server;

const shutdown = (signal) => {
	console.info(`${signal} received, shutting down`);
	server.close(() => process.exit(0));
	setTimeout(() => {
		console.error("forced shutdown after timeout");
		process.exit(1);
	}, 8000).unref();
};

for (const signal of ["SIGTERM", "SIGINT"]) {
	process.on(signal, () => shutdown(signal));
}

server = app(options, () => {
	console.info("starting server");
	Object.keys(options).forEach((key) => {
		let value = options[key];
		if (key === "redis" && typeof value === "string") {
			value = value.replace(/(:)[^:@]+(@)/, "$1***$2");
		}
		console.info(`${key}: ${value}`);
	});
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
