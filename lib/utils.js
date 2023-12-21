import pkg from "../package.json" assert { type: "json" };

export const objectToArray = (obj) => {
	if (!obj || typeof obj !== "object") {
		return [];
	}

	const results = Object.keys(obj).reduce((results, name) => {
		results.push({
			name: name,
			value: obj[name],
		});

		return results;
	}, []);

	return results;
};

const getReqHeaderSize = (req) => {
	const keys = Object.keys(req.headers);

	const values = keys.map((key) => req.headers[key]);

	const headers =
		req.method +
		req.url +
		req.versionMajor +
		req.versionMinor +
		keys.join() +
		values.join();

	// startline: [method] [url] HTTP/1.1\r\n = 12
	// endline: \r\n = 2
	// every header + \r\n = * 2
	return Buffer.from(headers).length + keys.length * 2 + 12 + 2;
};

export const createHar = (req) => {
	return {
		log: {
			version: "1.2",
			creator: {
				name: "mockbin.com",
				version: pkg.version,
			},
			entries: [
				{
					startedDateTime: new Date().toISOString(),
					clientIPAddress: req.ip,
					request: {
						method: req.method,
						url: `${req.forwarded.proto}://${req.hostname}${req.originalUrl}`,
						httpVersion: "HTTP/1.1",
						// TODO, add cookie details
						cookies: objectToArray(req.cookies),
						headers: objectToArray(req.headers),
						queryString: objectToArray(req.query),
						// TODO
						postData: {
							mimeType: req.contentType
								? req.contentType
								: "application/octet-stream",
							text: req.body,
							params: [],
						},
						headersSize: getReqHeaderSize(req),
						bodySize: req.rawBody.length,
					},
				},
			],
		},
	};
};

export const createSimpleHar = (req) => {
	return {
		startedDateTime: new Date().toISOString(),
		clientIPAddress: req.ip,
		method: req.method,
		url: `${req.forwarded.proto}://${req.hostname}${req.originalUrl}`,
		httpVersion: "HTTP/1.1",
		// TODO, add cookie details
		cookies: req.cookies,
		headers: req.headers,
		queryString: req.query,
		// TODO
		postData: {
			mimeType: req.contentType ? req.contentType : "application/octet-stream",
			text: req.body,
			params: [],
		},
		headersSize: getReqHeaderSize(req),
		bodySize: req.rawBody.length,
	};
};
export default { objectToArray, createHar, createSimpleHar, getReqHeaderSize };
