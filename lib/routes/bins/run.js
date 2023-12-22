import debugLog from "debug-log";
import client from "../../dbconfig.js";
const debug = debugLog("mockbin");

export default function (req, res, next) {
	client.get(`bin:${req.params.uuid}`, (err, value) => {
		if (err) {
			debug(err);

			throw err;
		}

		if (value) {
			const har = JSON.parse(value);

			// log interaction & send the appropriate response based on HAR
			client.rpush(
				`log:${req.params.uuid}`,
				JSON.stringify(req.har.log.entries[0]),
			);
			client.ltrim(`log:${req.params.uuid}`, 0, 100);

			// headers
			har.headers.map((header) => {
				res.set(header.name, header.value);
			});

			// cookies
			har.cookies.map((cookie) => {
				res.cookie(cookie.name, cookie.value);
			});

			// status
			res.httpVersion = har.httpVersion.split("/")[1];
			res.statusCode = har.status || 200;
			res.statusMessage = har.statusText || "OK";

			// special condition
			if (har.redirectURL !== "") {
				res.location(har.redirectURL);
			}

			return res.send(har.content.text ? har.content.text : null);
		}

		next();
	});
}
