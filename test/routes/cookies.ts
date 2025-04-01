/* global describe, it */

const cookies = require("../../lib/routes/cookies");

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
			params: {
				name: "foo",
			},
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
			params: {
				name: "foo",
			},
		};

		cookies.one(req, res, () => {
			res.body.should.be.false();

			done();
		});
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
});
