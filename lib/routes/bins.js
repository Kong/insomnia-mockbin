import { URL } from "url";
import debugLog from "debug-log";
import { Router } from "express";
import { createClient } from "redis";
import bodyParser from "../middleware/body-parser.js";
import cors from "../middleware/cors.js";
import errorHandler from "../middleware/error-handler.js";
// import { forwarded, errorHandler, bodyParser, cors, negotiateContent } from '../middleware'
import forwarded from "../middleware/forwarded.js";
import negotiateContent from "../middleware/negotiate-content.js";
import create from "./bins/create.js";
import _delete from "./bins/delete.js";
// import { form, create, view, sample, log, delete, update, run } from './bins/'
import form from "./bins/form.js";
import log from "./bins/log.js";
import run from "./bins/run.js";
import sample from "./bins/sample.js";
import update from "./bins/update.js";
import view from "./bins/view.js";
const debug = debugLog("mockbin");

export default function bins() {
	// parse redis dsn
	// var dsn = new URL(dsnStr)

	// connect to redis
	// this.client = createClient(dsn.port, dsn.hostname, {
	//   auth_pass: dsn.auth ? dsn.auth.split(':').pop() : false
	// })

	// this.client.on('error', function (err) {
	//   debug('redis error:', err)
	// })

	const router = Router();

	const defaults = [
		forwarded,
		errorHandler,
		bodyParser,
		null,
		cors,
		negotiateContent,
	];

	const endpoints = [
		{ action: "get", path: "/create", route: form },
		{ action: "post", path: "/create", route: create },
		{ action: "get", path: "/:uuid/view", route: view },
		{ action: "get", path: "/:uuid/sample", route: sample },
		{ action: "get", path: "/:uuid/log", route: log },
		{ action: "delete", path: "/:uuid/delete", route: _delete },
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
