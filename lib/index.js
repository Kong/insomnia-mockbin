import compression from "compression";
import debugLog from "debug-log";
import { Router } from "express";
import forwarded from "forwarded-http/lib/middleware.js";
import bodyParser from "./middleware/body-parser.js";
import cors from "./middleware/cors.js";
import negotiateContent from "./middleware/negotiate-content.js";
import bins from "./routes/bins.js";
const debug = debugLog("mockbin");
export default function router(options) {
	const router = Router();

	const defaults = [
		forwarded({ allowPrivate: true }),
		(err, req, res, next) => {
			debug(err);
			res.status(err.status || 500).view = "error";
			next();
		},
		bodyParser,
		null,
		cors,
		(req, res, next) => {
			req.app.disable("x-powered-by");
			res.set("X-Powered-By", "mockbin");
			next();
		},
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
		{
			action: "all",
			path: "/agent",
			route: (req, res, next) => {
				req.params.name = "user-agent";
				res.body = req.headers?.[req.params.name] || false;
				next();
			},
		},
		{
			action: "all",
			path: "/status/:code/:reason?",
			route: (req, res, next) => {
				res.statusCode = req.params.code || 200;
				res.statusMessage = (req.params.reason || "OK").replace(/\+/g, " ");
				res.body = { code: res.statusCode, message: res.statusMessage };
				next();
			},
		},
		{
			action: "all",
			path: "/headers",
			route: (req, res, next) => {
				res.yamlInline = 2;
				res.body = {
					headers: req.har.log.entries[0].request.headers,
					headersSize: req.har.log.entries[0].request.headersSize,
				};
				next();
			},
		},
		{
			action: "all",
			path: "/header/:name",
			route: (req, res, next) => {
				res.body = req.headers?.[req.params.name] || false;
				next();
			},
		},
		{
			action: "all",
			path: "/header/:name/:value",
			route: (req, res, next) => {
				res.set(req.params.name, req.params.value);
				res.body = req.params.value;
				next();
			},
		},
		{
			action: "all",
			path: "/cookies",
			route: (req, res, next) => {
				res.body = req.har.log.entries[0].request.cookies;
				next();
			},
		},
		{
			action: "all",
			path: "/forwarded",
			route: (req, res, next) => {
				res.body = req.forwarded;
				next();
			},
		},
		{
			action: "all",
			path: "/cookie/:name",
			route: (req, res, next) => {
				res.body = req.cookies?.[req.params.name] || false;
				next();
			},
		},
		{
			action: "all",
			path: "/cookie/:name/:value",
			route: (req, res, next) => {
				res.cookie(req.params.name, req.params.value);
				res.body = req.params.value;
				next();
			},
		},
		{
			action: "all",
			path: "/redirect/:status_code/:count?",
			route: (req, res, next) => {
				let count = req.params.count ? parseInt(req.params.count, 10) : 1;
				const status = parseInt(req.params.status_code, 10) || 302;
				const valid = [300, 301, 302, 303, 307, 308];
				if (count > 100) {
					count = 100;
				}
				if (!~valid.indexOf(status)) {
					res.body = {
						error: `invalid status code, must be one of ${valid.join()}`,
					};
					return next();
				}
				if (count > 0) {
					if (count === 1 && req.query.to) {
						return res.redirect(status, req.query.to);
					}
					return res.redirect(
						status,
						`/redirect/${status}/${count - 1}${
							req.query.to ? `?to=${req.query.to}` : ""
						}`,
					);
				}
				res.body = "redirect finished";
				next();
			},
		},
		{
			action: "all",
			path: "/delay/:ms?",
			route: (req, res, next) => {
				let delay = req.params.ms ? parseInt(req.params.ms, 10) : 200;
				if (delay > 60000) {
					delay = 60000;
				}
				setTimeout(() => {
					res.body = { delay };
					next();
				}, delay);
			},
		},
		{
			action: "all",
			path: "/stream/:chunks?",
			route: (req, res, next) => {
				res.set({
					"Content-Type": "text/plain; charset=utf-8",
					"Transfer-Encoding": "chunked",
				});
				// set default chunks to 10
				let chunks = req.params.chunks ? parseInt(req.params.chunks, 10) : 10;
				// max out chunks at 100
				if (chunks > 100) {
					chunks = 100;
				}
				let count = 1;
				while (count <= chunks) {
					res.write(
						`${JSON.stringify({
							type: "stream",
							chunk: count++,
						})}\n`,
					);
				}
				res.end();
			},
		},
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
		compression({
			threshold: 1,
			filter: () => true,
		}),
		Object.assign(router),
	);

	return router;
}
