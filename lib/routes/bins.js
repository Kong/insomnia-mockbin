import debugLog from "debug-log";
import { Router } from "express";
import forwarded from "forwarded-http/lib/middleware.js";
import bodyParser from "../middleware/body-parser.js";
import cors from "../middleware/cors.js";
import negotiateContent from "../middleware/negotiate-content.js";
import create from "./bins/create.js";
import log from "./bins/log.js";
import run from "./bins/run.js";
import sample from "./bins/sample.js";
import update from "./bins/update.js";
import view from "./bins/view.js";
const debug = debugLog("mockbin");

export default function bins() {
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
		negotiateContent,
	];

	const endpoints = [
		{
			action: "get",
			path: "/create",
			route: (req, res, next) => {
				res.view = "bin/create";
				next();
			},
		},
		{ action: "post", path: "/create", route: create },
		{ action: "get", path: "/:uuid/view", route: view },
		{ action: "get", path: "/:uuid/sample", route: sample },
		{ action: "get", path: "/:uuid/log", route: log },
		{
			action: "delete",
			path: "/:uuid/delete",
			route: (req, res, next) => {
				client.del(`bin:${req.params.uuid}`, (err) => {
					if (err) {
						debug(err);
						throw err;
					}
					next();
				});

				client.del(`log:${req.params.uuid}`, (err) => {
					if (err) {
						debug(err);
						throw err;
					}
					next();
				});
			},
		},
		{ action: "put", path: "/:uuid", route: update },
		{ action: "all", path: "/:uuid*", route: run },
	];
	for (const endpoint of endpoints) {
		// add route to middleware
		defaults.splice(3, 1, endpoint.route);

		// assign router to action at path
		router[endpoint.action].apply(router, [endpoint.path].concat(defaults));
	}

	return router;
}
