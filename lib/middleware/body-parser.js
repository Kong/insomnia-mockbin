import { parse } from "querystring";
import Dicer from "dicer";
import { parse as _parse } from "media-typer";
import pkg from "../../package.json" assert { type: "json" };

export default function (req, res, next) {
	req.bodyChunks = [];

	req.on("data", (chunk) => {
		req.bodyChunks.push(chunk);
	});

	req.on("end", () => {
		req.rawBody = Buffer.concat(req.bodyChunks);
		req.body = req.rawBody.toString("utf8");
		req.bodySize = req.rawBody.length;
		req.jsonBody = null;
		req.formBody = null;
		req.contentType = null;
		req.multiPartSimple = {};

		// parse Content-Type
		const contentType = req.headers["content-type"];
		const type = contentType ? _parse(contentType) : null;

		if (type) {
			req.contentType = [[type.type, type.subtype].join("/"), type.suffix]
				.join("+")
				.replace(/\+$/, "");
		}

		// create HAR Object
		req.har = createHar(req);
		req.simple = createSimpleHar(req);

		// json
		switch (req.contentType) {
			case "application/json":
				try {
					req.jsonBody = JSON.parse(req.body);
				} catch (exception) {}

				next();
				break;

			case "application/x-www-form-urlencoded":
				req.formBody = parse(req.body);

				// update HAR objects
				req.simple.postData.params = req.formBody;
				req.har.log.entries[0].request.postData.params = objectToArray(
					req.formBody,
				);

				next();
				break;

			case "multipart/mixed":
			case "multipart/related":
			case "multipart/form-data":
			case "multipart/alternate": {
				req.multiPartData = [];
				req.multiPartParams = [];

				// parse a file upload
				const dice = new Dicer({
					boundary: type.parameters.boundary,
				});

				dice.on("part", (part) => {
					part.on("data", (data) => {
						req.multiPartData.push(data.toString("utf8"));
					});

					part.on("header", (headers) => {
						const param = {};

						if (headers["content-disposition"]) {
							const disposition = _parse(
								headers["content-disposition"][0].replace(
									"form-data",
									"form-data/text",
								) || "form-data/text",
							);

							param.name = disposition.parameters.name;

							if (disposition.parameters.filename) {
								param.fileName = disposition.parameters.filename;
							}
						}

						if (headers["content-type"]) {
							const type = _parse(
								headers["content-type"][0] || "application/octet-stream",
							);

							param.contentType = [
								[type.type, type.subtype].join("/"),
								type.suffix,
							]
								.join("+")
								.replace(/\+$/, "");
						}

						req.multiPartParams.push(param);
					});
				});

				dice.on("finish", () => {
					// createa a new simple object param
					req.multiPart = req.multiPartParams.map((param, index) => {
						// append value to pair
						param.value = req.multiPartData[index];

						switch (typeof req.multiPartSimple[param.name]) {
							case "undefined":
								req.multiPartSimple[param.name] = param.value;
								break;

							// array
							case "object":
								req.multiPartSimple[param.name].push(param.value);
								break;

							case "string":
								// this exists? must be an array, make it so
								req.multiPartSimple[param.name] = [
									req.multiPartSimple[param.name],
								];
								req.multiPartSimple[param.name].push(param.value);
								break;
						}

						return param;
					});

					// update HAR objects
					req.simple.postData.params = req.multiPartSimple
						? req.multiPartSimple
						: [];
					req.har.log.entries[0].request.postData.params = req.multiPart
						? req.multiPart
						: [];

					next();
				});

				dice.write(req.body);
				break;
			}

			default:
				next();
		}
	});
}

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

export const getReqHeaderSize = (req) => {
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
