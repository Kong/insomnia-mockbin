/* global describe, it */

const pkg = require("../package.json");
const utils = require("../lib/utils");

require("should");

const fixture = {
	method: "POST",
	url: "http://mockbin.com/",
	protocol: "http",
	versionMajor: "1",
	versionMinor: "1",
	ip: "127.0.0.1",
	body: "",
	rawBody: "",
	hostname: "mockbin.com",
	originalUrl: "/",
	forwarded: {
		proto: "http",
	},
	headers: {
		foo: "bar",
	},
};

describe("Utils", () => {
	describe("ObjectToArray", () => {
		it("should return blank array on undefined", (done) => {
			const result = utils.objectToArray(undefined);

			result.should.be.an.Array();
			result.length.should.be.equal(0);

			done();
		});

		it("should return blank array on invalid type", (done) => {
			const result = utils.objectToArray("foo");

			result.should.be.an.Array();
			result.length.should.be.equal(0);

			done();
		});

		it("should convert to name/value pair", (done) => {
			const result = utils.objectToArray(fixture.headers);

			result.should.be.an.Array();
			result.should.be.eql([
				{
					name: "foo",
					value: "bar",
				},
			]);

			done();
		});
	});

	describe("getReqHeaderSize", () => {
		it("should calculate header size", (done) => {
			const result = utils.getReqHeaderSize(fixture);

			result.should.be.a.Number();
			result.should.be.equal(47);

			done();
		});
	});

	describe("isValidCompoundId", () => {
		const validId = `mock_${"a".repeat(32)}`;

		it("should return null for a valid id and basic path", (done) => {
			const result = utils.isValidCompoundId(validId, "/foo/bar_baz-qux~.txt");

			should(result).be.exactly(null);

			done();
		});

		it("should return null for a path with sub-delim characters", (done) => {
			const result = utils.isValidCompoundId(
				validId,
				"/foo;bar=baz,qux!$&'()*+",
			);

			should(result).be.exactly(null);

			done();
		});

		it("should return null for a path with `:` and `@`", (done) => {
			const result = utils.isValidCompoundId(validId, "/foo:8080/@user");

			should(result).be.exactly(null);

			done();
		});

		it("should return null for a path containing `..`", (done) => {
			const result = utils.isValidCompoundId(validId, "/foo/../bar");

			should(result).be.exactly(null);

			done();
		});

		it("should return an error for a path containing `%`", (done) => {
			const result = utils.isValidCompoundId(validId, "/foo%2Fbar");

			result.should.be.an.Object();
			result.error.should.be.equal("Invalid Path Characters");

			done();
		});

		it("should return an error for a path containing a space", (done) => {
			const result = utils.isValidCompoundId(validId, "/foo bar");

			result.should.be.an.Object();
			result.error.should.be.equal("Invalid Path Characters");

			done();
		});

		it("should return an error for a path containing `?`", (done) => {
			const result = utils.isValidCompoundId(validId, "/foo?bar=1");

			result.should.be.an.Object();
			result.error.should.be.equal("Invalid Path Characters");

			done();
		});

		it("should return an error for a malformed id", (done) => {
			const result = utils.isValidCompoundId("not_a_valid_id", "/foo");

			result.should.be.an.Object();
			result.error.should.be.equal('Invalid Mock "id"');

			done();
		});

		it("should return null for a path of exactly 1900 characters", (done) => {
			const result = utils.isValidCompoundId(validId, `/${"a".repeat(1899)}`);

			should(result).be.exactly(null);

			done();
		});

		it("should return an error for a path of exactly 1901 characters", (done) => {
			const result = utils.isValidCompoundId(validId, `/${"a".repeat(1900)}`);

			result.should.be.an.Object();
			result.error.should.be.equal('Invalid Mock "path" length');

			done();
		});
	});

	describe("createHar", () => {
		const result = utils.createHar(fixture);

		result.log.entries[0].startedDateTime = "now";

		result.should.be.an.Object();
		result.should.eql({
			log: {
				version: "1.2",
				creator: {
					name: "mockbin.com",
					version: pkg.version,
				},

				entries: [
					{
						startedDateTime: "now",
						clientIPAddress: "127.0.0.1",
						request: {
							method: "POST",
							url: "http://mockbin.com/",
							httpVersion: "HTTP/1.1",
							cookies: [],
							headers: [
								{
									name: "foo",
									value: "bar",
								},
							],
							queryString: [],
							postData: {
								mimeType: "application/octet-stream",
								params: [],
								text: "",
							},
							headersSize: 47,
							bodySize: 0,
						},
					},
				],
			},
		});
	});

	describe("createSimpleHar", () => {});
});
