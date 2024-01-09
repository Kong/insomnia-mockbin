const debug = require("debug")("mockbin");
const express = require("express");
const mw = require("../middleware");
const redis = require("redis");
const routes = require("./bins/");
const URL = require("url").URL;

module.exports = function bins(dsnStr) {
	// parse redis dsn
	const dsn = new URL(dsnStr);

	this.dsn = dsn;

	// connect to redis
	const client = redis.createClient({
		host: dsn.hostname,
		port: dsn.port,
		no_ready_check: true,
	});

	// Disable client's AUTH command.
	client.auth = null;
	if (dsn.username) {
		client.send_command("AUTH", [dsn.username, dsn.password]);
	}

	client.on("error", (err) => {
		console.log("redis error:", err);
	});

	const router = express.Router();

	const defaults = [
		mw.forwarded,
		mw.errorHandler,
		mw.bodyParser,
		null,
		mw.cors,
		mw.negotiateContent,
	];

	const endpoints = [
		{ action: "get", path: "/create", route: routes.form },
		{
			action: "post",
			path: "/create",
			route: routes.create(client),
		},
		{
			action: "get",
			path: "/view/:uuid*",
			route: routes.view(client),
		},
		{
			action: "get",
			path: "/sample/:uuid*",
			route: routes.sample(client),
		},
		{
			action: "get",
			path: "/log/:uuid*",
			route: routes.log(client),
		},
		{
			action: "delete",
			path: "/delete/:uuid*",
			route: routes.delete(client),
		},
		{ action: "put", path: "/upsert/:uuid*", route: routes.update(client) },
		{ action: "all", path: "/:uuid*", route: routes.run(client) },
	];

	endpoints.forEach((endpoint) => {
		// add route to middleware
		defaults.splice(3, 1, endpoint.route);

		// assign router to action at path
		router[endpoint.action].apply(router, [endpoint.path].concat(defaults));
	});

	return router;
};
