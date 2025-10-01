const debug = require("debug")("mockbin");
const e = require("express");
const validate = require("har-validator");
const { createCompoundId } = require("../../utils");
module.exports = (client) => (req, res, next) => {
	const compoundId = createCompoundId(
		req.headers["insomnia-mock-method"],
		req.params.uuid,
		req.params[0],
	);

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
	// express is sensitive to mismatched content-length header
	mock.headers = mock.headers.filter(
		(header) => header.name.toLowerCase() !== "content-length",
	);

	validate
		.response(mock)
		.then(function () {
			client.set(
				`bin:${compoundId}`,
				JSON.stringify(mock),
				"EX",
				process.env.MOCKBIN_REDIS_EXPIRE_SECONDS || "1000000000",
			);

			res.view = "redirect";
			res.status(200).location(`/bin/${compoundId}`).body = req.params.uuid;
		})
		.catch((err) => {
			res.body = {
				error: "Failed to set response",
				message: err.message,
			};
		})

		.then(next);
};
