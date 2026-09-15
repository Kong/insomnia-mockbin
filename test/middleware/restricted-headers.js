/* global describe, it */

const restrictedHeaders = require("../../lib/middleware/restricted-headers");

require("should");

describe("restrictedHeaders", () => {
	it("should remove configured headers from req.headers", (done) => {
		const originalValue = process.env.MOCKBIN_CLOUD_RESTRICTED_HEADERS;
		process.env.MOCKBIN_CLOUD_RESTRICTED_HEADERS =
			"Proxy, Host, X-Forwarded-For";

		const req = {
			headers: {
				proxy: "proxy-value",
				host: "example.com",
				"x-forwarded-for": "127.0.0.1",
				"content-type": "application/json",
			},
		};

		restrictedHeaders(req, {}, () => {
			req.headers.should.not.have.property("proxy");
			req.headers.should.not.have.property("host");
			req.headers.should.not.have.property("x-forwarded-for");
			req.headers.should.have.property("content-type");

			process.env.MOCKBIN_CLOUD_RESTRICTED_HEADERS = originalValue;
			done();
		});
	});

	it("should do nothing when no restricted headers are configured", (done) => {
		const originalValue = process.env.MOCKBIN_CLOUD_RESTRICTED_HEADERS;
		process.env.MOCKBIN_CLOUD_RESTRICTED_HEADERS = undefined;

		const req = {
			headers: {
				foo: "bar",
			},
		};

		restrictedHeaders(req, {}, () => {
			req.headers.should.have.property("foo");

			process.env.MOCKBIN_CLOUD_RESTRICTED_HEADERS = originalValue;
			done();
		});
	});
});
