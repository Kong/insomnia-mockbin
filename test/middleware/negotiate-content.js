/* global describe, it, before, after */

const express = require("express");
const path = require("node:path");
const mockbin = require("../../lib");

require("should");

describe("negotiateContent", () => {
	let server;
	let base;
	let passedOn;

	before(async () => {
		const app = express();
		app.set("view engine", "pug");
		app.set("views", path.join(__dirname, "..", "..", "src", "views"));
		app.use("/", mockbin());
		// Only a request that mockbin passed on after answering it gets here.
		app.use((req) => {
			passedOn.push(req.originalUrl);
		});

		await new Promise((resolve) => {
			server = app.listen(0, resolve);
		});
		base = `http://127.0.0.1:${server.address().port}`;
	});

	after(() => new Promise((resolve) => server.close(resolve)));

	const formats = [
		"application/json",
		"text/html",
		"application/xml",
		"text/yaml",
		"text/plain",
	];
	const paths = [
		"/request?x=1",
		"/headers",
		"/status/418",
		"/redirect/302/0",
		// answered from a timer instead of straight away
		"/delay/10",
	];

	// It is the last handler of a route and answers the request. Calling next()
	// as well would send the request on to the next route matching the same
	// path (PUT /bin/upsert/... also matches /bin/:uuid*) and past the router.
	for (const route of paths) {
		for (const accept of formats) {
			it(`answers ${route} as ${accept} without passing the request on`, async () => {
				passedOn = [];

				const res = await fetch(base + route, {
					headers: { accept },
					redirect: "manual",
				});
				await res.text();
				// a request that was wrongly passed on needs a moment to get there
				await new Promise((resolve) => setTimeout(resolve, 30));

				res.status.should.be.below(500);
				passedOn.should.be.empty();
			});
		}
	}
});
