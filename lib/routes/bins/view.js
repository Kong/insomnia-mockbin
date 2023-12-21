import debugLog from "debug-log";
import client from "../../dbconfig.js";
const debug = debugLog("mockbin");

export default function (req, res, next) {
	client.get("bin:" + req.params.uuid, (err, value) => {
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
}
