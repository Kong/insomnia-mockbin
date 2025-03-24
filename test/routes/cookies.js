/* global describe, it */

const cookies = require("../../lib/routes/cookies");
const httpMocks = require("node-mocks-http");
require("should");

describe("/cookie/:name", () => {
	it("should response with one cookie", (done) => {
		const res = {};
		const req = {
			params: {
				name: "foo",
			},
			cookies: {
				foo: "bar",
			},
		};

		cookies.one(req, res, () => {
			res.body.should.equal(req.cookies.foo);
			done();
		});
	});

	it("should response with false when no cookies are defined", (done) => {
		const res = {};
		const req = {
			params: { name: "foo" },
			cookies: {},
		};

		cookies.one(req, res, () => {
			res.body.should.be.false();
			done();
		});
	});

	it("should response with false when no match", (done) => {
		const res = {};
		const req = {
			params: { name: "foo" },
		};

		cookies.one(req, res, () => {
			res.body.should.be.false();
			done();
		});
	});

	it("should return the value of the existing cookie", (done) => {
		const req = httpMocks.createRequest({
			params: { name: "testcookie" },
			cookies: { testcookie: "testValue" },
		});
		const res = httpMocks.createResponse();
		const next = () => {
			res.body.should.equal("testValue");
			done();
		};
		cookies.one(req, res, next);
	});
});

describe("/cookie/:name", () => {
	it("should response with all cookies", (done) => {
		const res = {};
		const req = {
			har: {
				log: {
					entries: [
						{
							request: {
								cookies: ["test"],
							},
						},
					],
				},
			},
		};

		cookies.all(req, res, () => {
			res.body.should.equal(req.har.log.entries[0].request.cookies);
			done();
		});
	});

	// Test generated using Keploy

	it("should retrieve all cookies from the HAR log", (done) => {
		const req = httpMocks.createRequest({
			har: {
				log: {
					entries: [
						{
							request: {
								cookies: [
									{ name: "cookie1", value: "value1" },
									{ name: "cookie2", value: "value2" },
								],
							},
						},
					],
				},
			},
		});
		const res = httpMocks.createResponse();
		const next = () => {
			res.body.should.deepEqual([
				{ name: "cookie1", value: "value1" },
				{ name: "cookie2", value: "value2" },
			]);
			done();
		};
		cookies.all(req, res, next);
	});

	// Test generated using Keploy

	it("should set a cookie with the correct name and value", (done) => {
		const req = httpMocks.createRequest({
			params: { name: "newCookie", value: "newValue" },
		});
		const res = httpMocks.createResponse();
		res.cookie = function (name, value) {
			this.body = value;
		};
		const next = () => {
			res.body.should.equal("newValue");
			done();
		};
		cookies.set(req, res, next);
	});
});
