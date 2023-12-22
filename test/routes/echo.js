/* global describe, it */

import echo from "../../lib/routes/echo.js";

import "should";

const res = {
	headers: {},

	type: (type) => {
		res.headers["content-type"] = type;
	},

	send: (body) => {
		res.body = body;
	},
};

describe("/echo", () => {
	it("should respond with request body and content-type header", (done) => {
		const req = {
			body: "foo",
			headers: {
				"content-type": "text/plain",
			},
		};

		echo(req, res);

		res.body.should.equal(req.body);
		res.headers.should.have.property("content-type");
		res.headers["content-type"].should.equal(req.headers["content-type"]);

		done();
	});

	it("should respond with default values", (done) => {
		const req = {
			headers: {},
		};

		echo(req, res);

		res.body.should.equal("");
		res.headers.should.have.property("content-type");
		res.headers["content-type"].should.equal("text/plain");

		done();
	});
});
