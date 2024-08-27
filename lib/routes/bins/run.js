const debug = require("debug")("mockbin");
const { createCompoundId } = require("../../utils");

module.exports = (client) => (req, res, next) => {
	const compoundId = createCompoundId(
		req.method,
		req.params.uuid,
		req.params[0],
	);

	client.get(`bin:${compoundId}`, function (err, value) {
		if (err) {
			debug(err);

			throw err;
		}

		if (value) {
			const har = JSON.parse(value);

			// log interaction & send the appropriate response based on HAR
			client.rpush(
				`log:${compoundId}`,
				JSON.stringify(removeSensitiveData(req.har.log.entries[0])),
			);
			client.ltrim(`log:${compoundId}`, 0, 100);

			// headers
			har.headers.map((header) => {
				res.set(header.name.trim(), header.value);
			});

			// cookies
			har.cookies.map((cookie) => {
				res.cookie(cookie.name, cookie.value);
			});

			// status
			res.httpVersion = har.httpVersion.split("/")[1];
			res.statusCode = har.status || 200;
			res.statusMessage = har.statusText
				? encodeURIComponent(har.statusText)
				: "OK";

			// special condition
			if (har.redirectURL !== "") {
				res.location(har.redirectURL);
			}

			return res.send(har.content.text ? har.content.text : null);
		}

		next();
	});
};

function removeSensitiveData(entry) {
	const url = entry.request.url;
	const idx = url.indexOf("?");
	const newUrl = idx !== -1 ? url.substring(0, idx) : url;

	return {
		startedDateTime: entry.startedDateTime,
		clientIPAddress: entry.clientIPAddress,
		request: {
			method: entry.request.method,
			url: newUrl,
			httpVersion: entry.request.httpVersion,
			headersSize: entry.request.headersSize,
			bodySize: entry.request.bodySize,
		},
	};
}
