const debug = require("debug")("mockbin");
const validate = require("har-validator");
const path = require("path");

module.exports = function (req, res, next) {
	const id = req.params.uuid;
	const path = req.params[0];
	const compoundId = id + path;

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
		res.status(400);
		res.body = {
			errors: "Response HAR is required",
		};
		next();
		return;
	}

	const isAlphanumericAndSlashes = /^[a-zA-Z0-9\/]+$/i.test(path);
	const isPathSupported = isAlphanumericAndSlashes && !path.includes("//");

	if (path && !isPathSupported) {
		res.status(400);
		res.body = {
			errors: `Unsupported path ${path}`,
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
		.then(
			function () {
				this.client.set(`bin:${compoundId}`, JSON.stringify(mock));

				res.view = "redirect";
				res.status(200).location(`/bin/${compoundId}`).body = id;
			}.bind(this),
		)
		.catch((err) => {
			res.body = {
				errors: err.message,
			};
		})

		.then(next);
};
