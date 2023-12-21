/* global describe, it */

import status from "../../lib/routes/status";

import "should";

describe("/status/:code/:reason", () => {
	it("should use defaults", (done) => {
		const req = {
			params: {},
		};

		const res = {};

		status(req, res, () => {
			res.statusCode.should.equal(200);
			res.statusMessage.should.equal("OK");

			res.body.code.should.equal(200);
			res.body.message.should.equal("OK");

			done();
		});
	});

	it("should use params", (done) => {
		const req = {
			params: {
				code: 300,
				reason: "foo",
			},
		};

		const res = {};

		status(req, res, () => {
			res.statusCode.should.equal(300);
			res.statusMessage.should.equal("foo");

			res.body.code.should.equal(300);
			res.body.message.should.equal("foo");
			done();
		});
	});

	it("should replace + with spaces", (done) => {
		const req = {
			params: {
				code: 300,
				reason: "foo+bar",
			},
		};

		const res = {};

		status(req, res, () => {
			res.statusCode.should.equal(300);
			res.statusMessage.should.equal("foo bar");

			res.body.code.should.equal(300);
			res.body.message.should.equal("foo bar");
			done();
		});
	});
});
