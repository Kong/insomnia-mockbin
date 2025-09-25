const debug = require("debug")("mockbin");
const pkg = require("../../../package.json");
const { validateRequestMethod } = require("../../validation");

module.exports = (client) => (req, res, next) => {
	res.view = "bin/log";
	const method = validateRequestMethod(
		req.headers["insomnia-mock-method"] || "",
	);
	const compoundId = req.params.uuid + req.params[0] + method;
	client.lrange(`log:${compoundId}`, 0, -1, (err, history) => {
		if (err) {
			debug(err);

			throw err;
		}

		res.body = {
			log: {
				version: "1.2",
				creator: {
					name: "mockbin.com",
					version: pkg.version,
				},
				entries: [],
			},
		};

		if (history.length) {
			res.body.log.entries = history.map((request) => JSON.parse(request));
		}

		next();
	});
};
