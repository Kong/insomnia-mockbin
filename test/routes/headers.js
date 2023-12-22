/* global describe, it */

import { agent, all, one } from "../../lib/routes/headers.js";

import "should";

describe("/agent", () => {
	it("should response with user-agent header", (done) => {
		const res = {};
		const req = {
			params: {},
			headers: {
				"user-agent": "foo",
			},
		};

		agent(req, res, () => {
			res.body.should.equal(req.headers["user-agent"]);

			done();
		});
	});
});

describe("/header/:name", () => {
	it("should response with one header", (done) => {
		const res = {};
		const req = {
			params: {
				name: "foo",
			},
			headers: {
				foo: "bar",
			},
		};

		one(req, res, () => {
			res.body.should.equal(req.headers.foo);

			done();
		});
	});

	it("should response with false when no headers are defined", (done) => {
		const res = {};
		const req = {
			params: {
				name: "foo",
			},
			headers: {},
		};

		one(req, res, () => {
			res.body.should.be.false();

			done();
		});
	});

	it("should response with false when no match", (done) => {
		const res = {};
		const req = {
			params: {
				name: "foo",
			},
		};

		one(req, res, () => {
			res.body.should.be.false();

			done();
		});
	});
});

describe("/header/:name", () => {
	it("should response with all headers", (done) => {
		const res = {};
		const req = {
			har: {
				log: {
					entries: [
						{
							request: {
								headers: ["test"],
								headersSize: 0,
							},
						},
					],
				},
			},
		};

		all(req, res, () => {
			res.body.should.eql(req.har.log.entries[0].request);

			done();
		});
	});
});
