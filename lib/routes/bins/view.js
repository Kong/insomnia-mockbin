const debug = require("debug")("mockbin");
const { createCompoundId } = require("../../utils");
const { validateRequestMethod } = require("../../validation");

module.exports = (client) => (req, res, next) => {
	const method = validateRequestMethod(req.headers["insomnia-mock-method"]);
	const compoundId = createCompoundId(method, req.params.uuid, req.params[0]);
	client.get(`bin:${compoundId}`, (err, value) => {
		if (err) {
			debug(err);

			throw err;
		}

		if (value) {
			const har = JSON.parse(value);

			res.view = "bin/view";
			res.body = har;
		}

		next();
	});
};
