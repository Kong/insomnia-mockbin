const pkg = require("../package.json");

const utils = {
	// HTTP method + ID + route name: POST1234/foo OR 1234/foo
	// NOTE: http method GET is ingored in the compound id in order to preserve existing mocks
	createCompoundId: (method, id, path) => {
		return method.toLowerCase() === "get" ? id + path : method + id + path;
	},
	objectToArray: (obj) => {
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
	},

	getReqHeaderSize: (req) => {
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
	},

	createHar: (req) => ({
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
						url: `${req.protocol}://${req.hostname}${req.originalUrl}`,
						httpVersion: "HTTP/1.1",
						// TODO, add cookie details
						cookies: utils.objectToArray(req.cookies),
						headers: utils.objectToArray(req.headers),
						queryString: utils.objectToArray(req.query),
						// TODO
						postData: {
							mimeType: req.contentType
								? req.contentType
								: "application/octet-stream",
							text: req.body,
							params: [],
						},
						headersSize: utils.getReqHeaderSize(req),
						bodySize: req.rawBody.length,
					},
				},
			],
		},
	}),

	createSimpleHar: (req) => ({
		startedDateTime: new Date().toISOString(),
		clientIPAddress: req.ip,
		method: req.method,
		url: `${req.protocol}://${req.hostname}${req.originalUrl}`,
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
		headersSize: utils.getReqHeaderSize(req),
		bodySize: req.rawBody.length,
	}),
};

module.exports = utils;
