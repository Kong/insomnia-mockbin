/* global describe, it */

const hello = require("../../lib/routes/hello");

require("should");

describe("/", () => {
	it("should respond with Hello World", (done) => {
		const res = {};

		hello(null, res, () => {
			res.body.should.equal("Hello World!");

			done();
		});
	});
});
