import debugLog from "debug-log";
import { Router } from "express";
import bodyParser from "./middleware/body-parser.js";
import compression from "./middleware/compression.js";
import cors from "./middleware/cors.js";
import errorHandler from "./middleware/error-handler.js";
// import { forwarded, errorHandler, bodyParser, cors, poweredBy, negotiateContent, compression } from './middleware/index.js'
import forwarded from "./middleware/forwarded.js";
import negotiateContent from "./middleware/negotiate-content.js";
import poweredBy from "./middleware/powered-by.js";
import bins from "./routes/bins.js";
import cookies from "./routes/cookies.js";
import headers from "./routes/headers.js";
// import { hello, ips, headers, status, cookies, redirect, delay, stream, har, echo, request, bins, gzip } from './routes/index.js'
import redirect from "./routes/redirect.js";
import stream from "./routes/stream.js";
const debug = debugLog("mockbin");
export default function router(options) {
	const router = Router();

	const defaults = [
		forwarded,
		errorHandler,
		bodyParser,
		null,
		cors,
		poweredBy,
		negotiateContent,
	];

	const endpoints = [
		{
			action: "get",
			path: "/",
			route: (req, res, next) => {
				res.view = "index";
				res.body = "Hello World!";
				next();
			},
		},
		{
			action: "all",
			path: "/ip",
			route: (req, res, next) => {
				res.body = req.ip;
				next();
			},
		},
		{
			action: "all",
			path: "/ips",
			route: (req, res, next) => {
				res.body = req.forwarded.for;
				next();
			},
		},
		{ action: "all", path: "/agent", route: headers.agent },
		{
			action: "all",
			path: "/status/:code/:reason?",
			route: (req, res, next) => {
				res.statusCode = req.params.code || 200;
				res.statusMessage = (req.params.reason || "OK").replace(/\+/g, " ");

				res.body = {
					code: res.statusCode,
					message: res.statusMessage,
				};

				next();
			},
		},
		{ action: "all", path: "/headers", route: headers.all },
		{ action: "all", path: "/header/:name", route: headers.one },
		{ action: "all", path: "/header/:name/:value", route: headers.set },
		{ action: "all", path: "/cookies", route: cookies.all },
		{
			action: "all",
			path: "/forwarded",
			route: (req, res, next) => {
				res.body = req.forwarded;
				next();
			},
		},
		{ action: "all", path: "/cookie/:name", route: cookies.one },
		{ action: "all", path: "/cookie/:name/:value", route: cookies.set },
		{ action: "all", path: "/redirect/:status_code/:count?", route: redirect },
		{
			action: "all",
			path: "/delay/:ms?",
			route: (req, res, next) => {
				let delay = req.params.ms ? parseInt(req.params.ms, 10) : 200;
				if (delay > 60000) {
					delay = 60000;
				}
				setTimeout(() => {
					res.body = {
						delay,
					};
					next();
				}, delay);
			},
		},
		{ action: "all", path: "/stream/:chunks?", route: stream },
		{
			action: "all",
			path: "/har*",
			route: (req, res, next) => {
				res.view = "default";
				res.yamlInline = 6;
				res.body = req.har;
				next();
			},
		},
		{
			action: "all",
			path: "/echo*",
			route: (req, res) => {
				res.type(req.headers["content-type"] || "text/plain");
				res.send(req.body || "");
			},
		},
		{
			action: "all",
			path: "/request*",
			route: (req, res, next) => {
				res.yamlInline = 6;
				res.body = req.simple;
				next();
			},
		},
	];
	for (const endpoint of endpoints) {
		// add route to middleware
		defaults.splice(3, 1, endpoint.route);

		// assign router to action at path
		router[endpoint.action].apply(router, [endpoint.path].concat(defaults));
	}

	if (options?.redis) {
		router.use("/bin", bins(options.redis));
	} else {
		debug("no redis dsn provided, will not load bin routes");
	}

	// duplicate routes with gzip forced
	router.use(
		"/gzip",
		(req, res, next) => {
			// force compression
			req.headers["accept-encoding"] = "gzip";
			next();
		},
		compression,
		Object.assign(router),
	);

	return router;
}
