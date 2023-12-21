import debugLog from "debug-log";
const debug = debugLog("mockbin");

import pkg from "../../../package.json" assert { type: "json" };
import client from "../../dbconfig.js";

export default function (req, res, next) {
	res.view = "bin/log";

	client.lrange(`log:${req.params.uuid}`, 0, -1, (err, history) => {
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
}
