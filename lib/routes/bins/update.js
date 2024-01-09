const debug = require("debug")("mockbin");
const validate = require("har-validator");

module.exports = function (req, res, next) {
	const id = req.params.uuid;
	let mock = req.jsonBody;
	if (!mock) {
		res.body = {
			errors: "Response HAR is required",
		};
		next();
	}

	// overritten by application/x-www-form-urlencoded or multipart/form-data
	if (req.simple.postData.text) {
		try {
			mock = JSON.parse(req.simple.postData.text);
		} catch (e) {
			debug(e);
		}
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
				const path = req.params[0];
				const isPathSupported =
					/^[a-zA-Z0-9\/]+$/i.test(path) && !path.includes("//");
				if (path && !isPathSupported) {
					throw new Error(`Unsupported path: ${path}`);
				}
				const compoundId = id + path;
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
