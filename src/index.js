import path, { join } from "path";
import { fileURLToPath } from "url";
import compression from "compression";
import cookieParser from "cookie-parser";
import debugLog from "debug-log";
import express from "express";
import methodOverride from "method-override";
import morgan from "morgan";
import router from "../lib/index.js";
const debug = debugLog("mockbin");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export default function (options, done) {
	if (!options) {
		throw Error("missing options");
	}

	debug("system started with options: %j", options);

	// setup ExpressJS
	const app = express();

	app.enable("view cache");
	app.enable("trust proxy");
	app.set("view engine", "pug");
	app.set("views", join(__dirname, "views"));
	app.set("jsonp callback name", "__callback");

	// add 3rd party middlewares
	app.use(compression());
	app.use(cookieParser());
	app.use(methodOverride("__method"));
	app.use(methodOverride("X-HTTP-Method-Override"));
	app.use("/static", express.static(join(__dirname, "static")));

	if (options.quiet !== true) {
		app.use(morgan("dev"));
	}

	// magic starts here
	app.use("/", router(options));

	app.listen(options.port);

	if (typeof done === "function") {
		done();
	}
}
