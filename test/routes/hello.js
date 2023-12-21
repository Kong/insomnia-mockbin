/* global describe, it */

import hello from "../../lib/routes/hello.js";

import "should";

describe("/", () => {
	it("should respond with Hello World", (done) => {
		const res = {};

		hello(null, res, () => {
			res.body.should.equal("Hello World!");

			done();
		});
	});
});
