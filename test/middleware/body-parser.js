/* global describe, it, before, after, afterEach */

const express = require("express");
const zlib = require("node:zlib");
const mockbin = require("../../lib");
const bodyParser = require("../../lib/middleware/body-parser");

require("should");

const MiB = 1024 * 1024;

// Starts an app on a random port and resolves with its base URL and a closer.
const listen = (app) =>
	new Promise((resolve) => {
		const server = app.listen(0, () => {
			resolve({
				base: `http://127.0.0.1:${server.address().port}`,
				close: () => new Promise((done) => server.close(done)),
			});
		});
	});

// What the middleware leaves on the request, reported back as JSON.
const report = (req, res) => {
	const harHeaders = req.har.log.entries[0].request.headers;
	const encoding = harHeaders.find((h) => h.name === "content-encoding");

	res.json({
		rawLength: req.rawBody.length,
		bodySize: req.bodySize,
		body: req.body.length > 100 ? `<${req.body.length} chars>` : req.body,
		contentType: req.contentType,
		jsonBody: req.jsonBody,
		formBody: req.formBody,
		contentEncodingHeader: req.headers["content-encoding"] ?? null,
		contentEncodingInHar: encoding ? encoding.value : null,
	});
};

const appWith = (options) => {
	const app = express();
	app.all("/echo", bodyParser(options), report);
	return app;
};

const chunked = (bytes) =>
	new ReadableStream({
		start(controller) {
			for (let sent = 0; sent < bytes; sent += 1024) {
				controller.enqueue(
					new Uint8Array(Math.min(1024, bytes - sent)).fill(97),
				);
			}
			controller.close();
		},
	});

describe("body parser", () => {
	describe("resolveMaxBodyBytes", () => {
		const originalWarn = console.warn;
		let warnings = [];

		before(() => {
			console.warn = (message) => warnings.push(message);
		});
		afterEach(() => {
			warnings = [];
		});
		after(() => {
			console.warn = originalWarn;
		});

		it("defaults to 5 MiB when unset", () => {
			bodyParser.DEFAULT_MAX_BODY_BYTES.should.equal(5 * MiB);
			bodyParser.resolveMaxBodyBytes(undefined).should.equal(5 * MiB);
			bodyParser.resolveMaxBodyBytes("").should.equal(5 * MiB);
			warnings.should.be.empty();
		});

		it("reads a byte count", () => {
			bodyParser.resolveMaxBodyBytes("1234").should.equal(1234);
			bodyParser.resolveMaxBodyBytes(" 42 ").should.equal(42);
			bodyParser.resolveMaxBodyBytes(1000).should.equal(1000);
			warnings.should.be.empty();
		});

		it("treats 0 as no limit", () => {
			bodyParser
				.resolveMaxBodyBytes("0")
				.should.equal(Number.POSITIVE_INFINITY);
			bodyParser.resolveMaxBodyBytes(0).should.equal(Number.POSITIVE_INFINITY);
		});

		it("accepts its own result again", () => {
			bodyParser
				.resolveMaxBodyBytes(Number.POSITIVE_INFINITY)
				.should.equal(Number.POSITIVE_INFINITY);
			bodyParser.resolveMaxBodyBytes(5 * MiB).should.equal(5 * MiB);
			warnings.should.be.empty();
		});

		for (const invalid of ["abc", "-1", "1.5", "5mb", "1e3", "NaN", -5, 1.5]) {
			it(`ignores ${JSON.stringify(invalid)} with a warning`, () => {
				bodyParser.resolveMaxBodyBytes(invalid).should.equal(5 * MiB);
				warnings.length.should.equal(1);
				warnings[0].should.containEql("MOCKBIN_MAX_BODY_BYTES");
			});
		}
	});

	describe("within the limit", () => {
		let server;

		before(async () => {
			server = await listen(appWith({ maxBodyBytes: 1024 }));
		});
		after(() => server.close());

		it("parses a JSON body", async () => {
			const res = await fetch(`${server.base}/echo`, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: '{"a":1}',
			});

			res.status.should.equal(200);
			const json = await res.json();
			json.jsonBody.should.eql({ a: 1 });
			json.contentType.should.equal("application/json");
			json.rawLength.should.equal(7);
			json.bodySize.should.equal(7);
		});

		it("parses a form body", async () => {
			const res = await fetch(`${server.base}/echo`, {
				method: "POST",
				headers: { "content-type": "application/x-www-form-urlencoded" },
				body: "name=Ada",
			});

			(await res.json()).formBody.should.eql({ name: "Ada" });
		});

		it("accepts a body of exactly the limit", async () => {
			const res = await fetch(`${server.base}/echo`, {
				method: "POST",
				headers: { "content-type": "application/octet-stream" },
				body: Buffer.alloc(1024, "a"),
			});

			res.status.should.equal(200);
			(await res.json()).rawLength.should.equal(1024);
		});

		it("handles a request without a body", async () => {
			const res = await fetch(`${server.base}/echo`);

			res.status.should.equal(200);
			const json = await res.json();
			json.rawLength.should.equal(0);
			json.body.should.equal("");
		});
	});

	describe("with a Content-Encoding", () => {
		let server;
		const json = Buffer.from('{"name":"Ada"}');

		before(async () => {
			server = await listen(appWith({ maxBodyBytes: 1024 }));
		});
		after(() => server.close());

		const post = (encoding, body) =>
			fetch(`${server.base}/echo`, {
				method: "POST",
				headers: {
					"content-type": "application/json",
					"content-encoding": encoding,
				},
				body,
			});

		for (const [encoding, compress] of [
			["gzip", zlib.gzipSync],
			["deflate", zlib.deflateSync],
		]) {
			it(`inflates a ${encoding} body before parsing it`, async () => {
				const compressed = compress(json);
				compressed.length.should.not.equal(json.length);

				const res = await post(encoding, compressed);

				res.status.should.equal(200);
				const body = await res.json();
				body.jsonBody.should.eql({ name: "Ada" });
				body.body.should.equal('{"name":"Ada"}');
				body.rawLength.should.equal(json.length);
				// the header stays on the request, and in the HAR built from it
				body.contentEncodingHeader.should.equal(encoding);
				body.contentEncodingInHar.should.equal(encoding);
			});
		}

		it("accepts the identity encoding", async () => {
			const res = await post("identity", json);

			res.status.should.equal(200);
			(await res.json()).jsonBody.should.eql({ name: "Ada" });
		});

		for (const encoding of ["zstd", "br"]) {
			it(`refuses ${encoding} with 415`, async () => {
				const res = await post(encoding, Buffer.from([40, 181, 47, 253]));

				res.status.should.equal(415);
				res.headers.get("content-type").should.containEql("application/json");
				const body = await res.json();
				body.error.should.equal("Unsupported Content Encoding");
				body.message.should.containEql(`"${encoding}"`);
				body.message.should.containEql("gzip and deflate");
			});
		}

		it("refuses a body that is not really compressed with 400", async () => {
			const res = await post("gzip", json);

			res.status.should.equal(400);
			const body = await res.json();
			body.error.should.equal("Bad Request");
			body.message.should.startWith(
				"The request body could not be decompressed",
			);
		});

		it("refuses a truncated gzip body with 400", async () => {
			const compressed = zlib.gzipSync(Buffer.alloc(500, "a"));

			const res = await post(
				"gzip",
				compressed.subarray(0, compressed.length - 8),
			);

			res.status.should.equal(400);
			(await res.json()).message.should.startWith(
				"The request body could not be decompressed",
			);
		});

		it("applies the limit to the inflated size", async () => {
			// 1 MiB of zeros compresses to about 1 KiB, close to the 1024 byte limit
			const bomb = zlib.gzipSync(Buffer.alloc(MiB));
			bomb.length.should.be.below(2048);

			const res = await post("gzip", bomb);

			res.status.should.equal(413);
			(await res.json()).error.should.equal("Payload Too Large");
		});

		it("accepts a compressed body whose inflated size is within the limit", async () => {
			const res = await post("gzip", zlib.gzipSync(Buffer.alloc(1024, " ")));

			res.status.should.equal(200);
			(await res.json()).rawLength.should.equal(1024);
		});
	});

	describe("over the limit", () => {
		let server;

		before(async () => {
			server = await listen(appWith({ maxBodyBytes: 1024 }));
		});
		after(() => server.close());

		it("refuses a body with a Content-Length above the limit", async () => {
			const res = await fetch(`${server.base}/echo`, {
				method: "POST",
				headers: { "content-type": "application/octet-stream" },
				body: Buffer.alloc(1025, "a"),
			});

			res.status.should.equal(413);
			res.headers.get("content-type").should.containEql("application/json");
			const json = await res.json();
			json.error.should.equal("Payload Too Large");
			json.message.should.equal(
				"The request body exceeds the maximum allowed size of 1024 bytes.",
			);
		});

		it("refuses a chunked body that grows past the limit", async () => {
			const res = await fetch(`${server.base}/echo`, {
				method: "POST",
				headers: { "content-type": "application/octet-stream" },
				body: chunked(10 * 1024),
				duplex: "half",
			});

			res.status.should.equal(413);
			(await res.json()).error.should.equal("Payload Too Large");
		});

		it("keeps serving requests after refusing one", async () => {
			let res = await fetch(`${server.base}/echo`, {
				method: "POST",
				body: Buffer.alloc(5000, "a"),
			});
			res.status.should.equal(413);

			res = await fetch(`${server.base}/echo`, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: '{"ok":true}',
			});
			res.status.should.equal(200);
			(await res.json()).jsonBody.should.eql({ ok: true });
		});

		it("does not reach the route handler", async () => {
			let reached = false;
			const app = express();
			app.all("/echo", bodyParser({ maxBodyBytes: 10 }), (req, res) => {
				reached = true;
				res.end();
			});
			const small = await listen(app);

			try {
				const res = await fetch(`${small.base}/echo`, {
					method: "POST",
					body: "more than ten bytes",
				});

				res.status.should.equal(413);
				reached.should.be.false();
			} finally {
				await small.close();
			}
		});
	});

	describe("without a limit", () => {
		it("accepts any size when maxBodyBytes is 0", async () => {
			const server = await listen(appWith({ maxBodyBytes: 0 }));

			try {
				const res = await fetch(`${server.base}/echo`, {
					method: "POST",
					headers: { "content-type": "application/octet-stream" },
					body: Buffer.alloc(8 * MiB, "a"),
				});

				res.status.should.equal(200);
				(await res.json()).rawLength.should.equal(8 * MiB);
			} finally {
				await server.close();
			}
		});

		it("uses 5 MiB when no options are given", async () => {
			const server = await listen(appWith(undefined));

			try {
				let res = await fetch(`${server.base}/echo`, {
					method: "POST",
					body: Buffer.alloc(5 * MiB, "a"),
				});
				res.status.should.equal(200);

				res = await fetch(`${server.base}/echo`, {
					method: "POST",
					body: Buffer.alloc(5 * MiB + 1, "a"),
				});
				res.status.should.equal(413);
			} finally {
				await server.close();
			}
		});
	});

	describe("when a request falls through to another route", () => {
		it("does not run the second route when a route answers and still calls next()", async () => {
			// negotiateContent used to do exactly that, so PUT /bin/upsert/... went on
			// to /bin/:uuid* (it matches too), which has the body parser as well. The
			// stream is spent by then; the second route must not run (it never did).
			let secondRoute = false;
			const parse = bodyParser({ maxBodyBytes: 1024 });
			const app = express();
			app.post("/twice", parse, (req, res, next) => {
				res.json({ ok: true });
				next();
			});
			app.post("/twice", parse, () => {
				secondRoute = true;
			});
			const server = await listen(app);

			try {
				const res = await fetch(`${server.base}/twice`, {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: '{"a":1}',
				});

				res.status.should.equal(200);
				await new Promise((resolve) => setTimeout(resolve, 100));
				secondRoute.should.be.false();
			} finally {
				await server.close();
			}
		});
	});

	describe("mockbin()", () => {
		it("applies maxBodyBytes to the routes it mounts", async () => {
			const app = express();
			app.use("/", mockbin({ maxBodyBytes: 2048 }));
			const server = await listen(app);

			try {
				let res = await fetch(`${server.base}/request`, {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({ text: "a".repeat(1000) }),
				});
				res.status.should.equal(200);

				res = await fetch(`${server.base}/request`, {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({ text: "a".repeat(3000) }),
				});
				res.status.should.equal(413);
				(await res.json()).error.should.equal("Payload Too Large");
			} finally {
				await server.close();
			}
		});
	});
});
