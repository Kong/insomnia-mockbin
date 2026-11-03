const express = require("express");
const Dicer = require("@idio/dicer");
const querystring = require("node:querystring");
const contentTypeParser = require("content-type");
const util = require("../utils");

// Largest request body accepted by default. It is sized for cloud-hosted mocks;
// self-hosted deployments can change it with MOCKBIN_MAX_BODY_BYTES
// (0 disables the limit).
const DEFAULT_MAX_BODY_BYTES = 5 * 1024 * 1024;

/**
 * Turns the configured limit (the MOCKBIN_MAX_BODY_BYTES string, or a number)
 * into a byte count. Unset gives the default, 0 means unlimited (infinity) and
 * anything that is not a non-negative integer falls back to the default instead
 * of keeping the server from starting.
 */
const resolveMaxBodyBytes = (value) => {
	if (value === undefined || value === null || value === "") {
		return DEFAULT_MAX_BODY_BYTES;
	}

	const bytes =
		typeof value === "string" && /^\d+$/.test(value.trim())
			? Number(value.trim())
			: value;

	if (
		bytes !== Number.POSITIVE_INFINITY &&
		!(Number.isInteger(bytes) && bytes >= 0)
	) {
		console.warn(
			`Ignoring invalid MOCKBIN_MAX_BODY_BYTES ${JSON.stringify(value)}, using the default of ${DEFAULT_MAX_BODY_BYTES} bytes`,
		);
		return DEFAULT_MAX_BODY_BYTES;
	}

	return bytes === 0 ? Number.POSITIVE_INFINITY : bytes;
};

const formatBytes = (bytes) =>
	bytes % (1024 * 1024) === 0
		? `${bytes / (1024 * 1024)} MiB`
		: `${bytes} bytes`;

const parseContentType = (contentTypeHeader) => {
	if (!contentTypeHeader) {
		return { contentType: null };
	}
	const { type, parameters } = contentTypeParser.parse(contentTypeHeader);
	return {
		contentType: type.replace(/\+$/, ""),
		parameters,
	};
};

// Answers a request whose body could not be read. The JSON shape matches what
// the Insomnia client shows to the user: `error` becomes the title and
// `message` the text of the error dialog.
const respondToReadError = (err, res, limit) => {
	// The client went away mid-upload, there is nobody left to answer.
	if (err.type === "request.aborted" || res.headersSent) {
		return;
	}

	if (err.type === "entity.too.large") {
		res.status(413).json({
			error: "Payload Too Large",
			message: `The request body exceeds the maximum allowed size of ${formatBytes(limit)}.`,
		});
		return;
	}

	if (err.type === "encoding.unsupported") {
		res.status(415).json({
			error: "Unsupported Content Encoding",
			message: `The request body uses the unsupported content encoding "${err.encoding}". Supported encodings are gzip and deflate.`,
		});
		return;
	}

	// zlib refused a body that is not valid gzip/deflate data
	if (typeof err.code === "string" && err.code.startsWith("Z_")) {
		res.status(400).json({
			error: "Bad Request",
			message: `The request body could not be decompressed: ${err.message}.`,
		});
		return;
	}

	res.status(err.status || 400).json({
		error: "Bad Request",
		message: err.message,
	});
};

/**
 * Parses the request body (req.body, a Buffer at this point) based on the Content-Type header.
 *
 * It supports JSON, URL-encoded, and multipart form data (including file uploads).
 * The parsed data is attached to the request object as req.jsonBody, req.formBody, or req.multiPartSimple.
 * It also generates HAR (HTTP Archive) objects for logging and debugging purposes.
 * After parsing, it calls next() to pass control to the next middleware or route handler.
 */
const parseBody = (req, next) => {
	try {
		// requests without a body leave req.body as an empty object
		req.rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
		req.body = req.rawBody.toString("utf8");
		req.bodySize = req.rawBody.length;
		req.jsonBody = null;
		req.formBody = null;
		req.contentType = null;
		req.multiPartSimple = {};

		// parse Content-Type
		const contentTypeHeader = req.headers["content-type"];
		const { contentType, parameters } = parseContentType(contentTypeHeader);

		if (contentType) {
			req.contentType = contentType;
		}

		// create HAR Object
		req.har = util.createHar(req);
		req.simple = util.createSimpleHar(req);

		switch (req.contentType) {
			case "application/json":
				try {
					req.jsonBody = JSON.parse(req.body);
				} catch (exception) {}

				next();
				break;

			case "application/x-www-form-urlencoded":
				req.formBody = querystring.parse(req.body);

				// update HAR objects
				req.simple.postData.params = req.formBody;
				req.har.log.entries[0].request.postData.params = util.objectToArray(
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
					boundary: parameters.boundary,
				});

				dice.on("part", (part) => {
					part.on("data", (data) => {
						req.multiPartData.push(data.toString("utf8"));
					});

					part.on("header", (headers) => {
						const param = {};

						if (headers["content-disposition"]) {
							const disposition = contentTypeParser.parse(
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
							const { contentType: partContentType } = parseContentType(
								headers["content-type"][0] || "application/octet-stream",
							);

							param.contentType = partContentType;
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
	} catch (e) {
		next(new Error(`Error parsing request body: ${e.message}`));
	}
};

/**
 * Custom body parser middleware factory for Express.
 *
 * The request body is read by Express's own raw parser. It inflates a gzip or
 * deflate body (other Content-Encodings are refused with 415) and enforces the
 * size limit on the inflated size: an oversized request is refused with 413
 * from its Content-Length alone, or as soon as the body grows past the limit,
 * and the rest of it is discarded rather than buffered. The body is then parsed
 * by `parseBody`.
 */
module.exports = (options) => {
	const limit = resolveMaxBodyBytes(options?.maxBodyBytes);
	const readBody = express.raw({ type: () => true, limit });

	return (req, res, next) => {
		// An answered request normally ends there. But if a route answers and still
		// calls next(), the request reaches the next route of the same router that
		// matches, which has this middleware too. The stream is spent by then, so
		// stay inert, like the previous listener-based implementation did.
		if (req.rawBody !== undefined) {
			return;
		}

		readBody(req, res, (err) => {
			if (err) {
				respondToReadError(err, res, limit);
				return;
			}

			parseBody(req, next);
		});
	};
};

module.exports.DEFAULT_MAX_BODY_BYTES = DEFAULT_MAX_BODY_BYTES;
module.exports.resolveMaxBodyBytes = resolveMaxBodyBytes;
