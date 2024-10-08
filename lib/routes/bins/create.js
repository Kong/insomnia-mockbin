const debug = require("debug")("mockbin");
const util = require("node:util");
const uuid = require("uuid");
const validate = require("har-validator");

module.exports = (client) => (req, res, next) => {
	let mock = req.jsonBody;

	// check for full HAR
	if (req.jsonBody?.response) {
		mock = req.jsonBody.response;
	}

	// exception for the web Form
	// TODO eliminate this and rely on req.simple.postData.text
	if (req.simple.postData.params?.response) {
		try {
			mock = JSON.parse(req.simple.postData.params.response);
		} catch (e) {
			debug(e);
		}
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
	// express is sensitive to mismatched content-length header
	mock.headers = mock.headers.filter(
		(header) => header.name.toLowerCase() !== "content-length",
	);

	validate
		.response(mock)
		.then(function () {
			const id = uuid.v4();

			client.set(
				`bin:${id}`,
				JSON.stringify(mock),
				"EX",
				process.env.MOCKBIN_REDIS_EXPIRE_SECONDS || "1000000000",
			);

			res.view = "redirect";
			res.status(201).location(util.format("/bin/%s", id)).body = id;
		})

		.catch((err) => {
			res.body = {
				error: "Failed to set response",
				message: err.message,
			};
		})

		.then(next);
};
