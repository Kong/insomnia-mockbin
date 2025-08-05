const debug = require("debug")("mockbin");
const express = require("express");
const mw = require("../middleware");
const { createClient } = require("redis");
const routes = require("./bins/");
const URL = require("node:url").URL;

module.exports = function bins(dsnStr) {
	// parse redis dsn
	const dsn = new URL(dsnStr);

	// connect to redis
	const client = createClient({
		legacyMode: true,
		url: dsnStr,
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
	client.connect();

	const router = express.Router();

	const endpoints = [
		{
			action: "get",
			path: "/log/:uuid*",
			route: routes.log(client),
		},
		{ action: "put", path: "/upsert/:uuid*", route: routes.update(client) },
		{
			action: "delete",
			path: "/delete/:uuid*",
			route: routes.delete(client),
		},
		// make sure this is the last route
		{ action: "all", path: "/:uuid*", route: routes.run(client) },
	];

	// Only expose necessary routes if running in cloud mock
	if (process.env.MOCKBIN_IS_CLOUD_MOCK !== "true") {
		// use unshift to add extra routes at the beginning to keep the last one in endpoints unchanged
		endpoints.unshift(
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
		);
	}

	endpoints.forEach((endpoint) => {
		// assign router to action at path
		router[endpoint.action].apply(
			router,
			[endpoint.path].concat([
				mw.errorHandler,
				mw.bodyParser,
				endpoint.route,
				mw.cors,
				mw.negotiateContent,
			]),
		);
	});

	return router;
};
