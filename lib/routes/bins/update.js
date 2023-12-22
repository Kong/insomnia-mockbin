import { format } from "util";
import debugLog from "debug-log";
import { response } from "har-validator";
import client from "../../dbconfig.js";
const debug = debugLog("mockbin");

export default function (req, res, next) {
	const id = req.params.uuid;
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

	response(mock)
		.then(() => {
			client.set(`bin:${id}`, JSON.stringify(mock));

			res.view = "redirect";
			res.status(200).location(format("/bin/%s", id)).body = id;
		})

		.catch((err) => {
			res.body = {
				errors: err.errors,
			};
		})

		.then(next);
}
