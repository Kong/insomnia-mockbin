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
			path: ":serviceid/log/:custompath*",
			route: routes.log(client),
		},
		{
			action: "delete",
			path: ":serviceid/delete/:custompath*",
			route: routes.delete(client),
		},
		{
			action: "put",
			path: ":serviceid/upsert/:custompath*",
			route: routes.update(client),
		},
		{
			action: "all",
			path: "/:serviceid/:custompath*",
			route: routes.run(client),
		},
	];

	endpoints.forEach((endpoint) => {
		// add route to middleware
		defaults.splice(3, 1, endpoint.route);

		// assign router to action at path
		router[endpoint.action].apply(router, [endpoint.path].concat(defaults));
	});

	return router;
};
