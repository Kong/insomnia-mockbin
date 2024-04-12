const debug = require("debug")("mockbin");
const e = require("express");
const validate = require("har-validator");
const path = require("node:path");

module.exports = (client) => (req, res, next) => {
	const compoundId = req.params.serviceid + req.params.custompath;

	let mock = req.jsonBody;

	// overritten by application/x-www-form-urlencoded or multipart/form-data
	if (req.simple.postData.text) {
		try {
			mock = JSON.parse(req.simple.postData.text);
		} catch (e) {
			debug(e);
		}
	}
	if (!mock) {
		res.body = {
			error: "Response body is required",
			message: 'The "response" field is required',
		};
		next();
		return;
	}

	// provide optional values before validation
	mock.redirectURL = "";
	mock.bodySize = 0;
	mock.headersSize = 0;

	if (!mock.content) {
		mock.content = {};
	}

	mock.content.size = 0;

	validate
		.response(mock)
		.then(function () {
			client.set(
				`bin:${compoundId}`,
				JSON.stringify(mock),
				"EX",
				process.env.MOCKBIN_REDIS_EXPIRE_SECONDS,
			);

			res.view = "redirect";
			res.status(200).location(`/bin/${compoundId}`).body = id;
		})
		.catch((err) => {
			res.body = {
				error: "Failed to set response",
				message: err.message,
			};
		})

		.then(next);
};
