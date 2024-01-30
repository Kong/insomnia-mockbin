const compression = require("compression");
const cookieParser = require("cookie-parser");
const debug = require("debug")("mockbin");
const express = require("express");
const methodOverride = require("method-override");
const morgan = require("morgan");
const path = require("path");
const router = require("../lib");

module.exports = (options, done) => {
	if (!options) {
		throw Error("missing options");
	}

	debug("system started with options: %j", options);

	// setup ExpressJS
	const app = express();

	app.enable("view cache");
	app.enable("trust proxy");
	app.set("view engine", "pug");
	app.set("views", path.join(__dirname, "views"));
	app.set("jsonp callback name", "__callback");

	// add 3rd party middlewares
	app.use(compression());
	app.use(cookieParser());
	app.use(methodOverride("__method"));
	app.use(methodOverride("X-HTTP-Method-Override"));
	app.use("/static", express.static(path.join(__dirname, "static")));

	app.use(
		morgan("dev", {
			skip: (req, res) => options.quiet === "true" && res.statusCode < 400,
		}),
	);

	// magic starts here
	app.use("/", router(options));
	app.use("/healthcheck", (req, res) => {
		res.set({ "Content-Type": "application/json; charset=utf-8" });
		res.send(
			JSON.stringify(
				{
					name: process.env.npm_package_name,
					version: process.env.npm_package_version,
					uptimeSeconds: process.uptime(),
					memory: process.memoryUsage(),
					pid: process.pid,
					versions: process.versions,
				},
				null,
				2,
			),
		);
	});

	app.listen(options.port);

	if (typeof done === "function") {
		done();
	}
};
