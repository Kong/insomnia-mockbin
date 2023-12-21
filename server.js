import { config } from "dotenv";
import app from "./src/index.js";

config({ silent: false });

const options = {
	port: process.env.MOCKBIN_PORT,
	quiet: process.env.MOCKBIN_QUIET,
	redis: process.env.MOCKBIN_REDIS,
};

app(options, () => {
	console.info("starting server on port: %d", options.port);
});
