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
import delay from "./routes/delay.js";
import echo from "./routes/echo.js";
import gzip from "./routes/gzip.js";
import har from "./routes/har.js";
import headers from "./routes/headers.js";
// import { hello, ips, headers, status, cookies, redirect, delay, stream, har, echo, request, bins, gzip } from './routes/index.js'
import hello from "./routes/hello.js";
import ips from "./routes/ips.js";
import redirect from "./routes/redirect.js";
import request from "./routes/request.js";
import status from "./routes/status.js";
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
		{ action: "get", path: "/", route: hello },
		{ action: "all", path: "/ip", route: ips.one },
		{ action: "all", path: "/ips", route: ips.all },
		{ action: "all", path: "/agent", route: headers.agent },
		{ action: "all", path: "/status/:code/:reason?", route: status },
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
		{ action: "all", path: "/delay/:ms?", route: delay },
		{ action: "all", path: "/stream/:chunks?", route: stream },
		{ action: "all", path: "/har*", route: har },
		{ action: "all", path: "/echo*", route: echo },
		{ action: "all", path: "/request*", route: request },
	];

	endpoints.forEach((endpoint) => {
		// add route to middleware
		defaults.splice(3, 1, endpoint.route);

		// assign router to action at path
		router[endpoint.action].apply(router, [endpoint.path].concat(defaults));
	});

	if (options?.redis) {
		router.use("/bin", bins(options.redis));
	} else {
		debug("no redis dsn provided, will not load bin routes");
	}

	// duplicate routes with gzip forced
	router.use("/gzip", gzip, compression, Object.assign(router));

	return router;
}
