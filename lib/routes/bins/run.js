const debug = require("debug")("mockbin");

function runMock(err, value, req, res, client, compoundId, next) {
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
		har.headers.forEach((header) => {
			res.set(header.name.trim(), header.value);
		});

		// cookies
		har.cookies.forEach((cookie) => {
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
}

module.exports = (client) => (req, res, next) => {
	const compoundId = req.params.uuid + req.params[0];
	const method = req.method;

	const mCompoundId = `${compoundId}${method}`;

	// try to find a method-specific mock first
	client.get(`bin:${mCompoundId}`, function (mErr, mValue) {
		if (mErr || !mValue) {
			// no dice with the method-specific mock, try the all-methods mock (legacy)
			client.get(`bin:${compoundId}`, function (err, value) {
				return runMock(err, value, req, res, client, compoundId, next);
			});
		}
		return runMock(mErr, mValue, req, res, client, mCompoundId, next);
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
